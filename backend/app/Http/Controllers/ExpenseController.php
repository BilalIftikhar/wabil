<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExpenseRequest;
use App\Http\Resources\ExpenseResource;
use App\Models\Expense;
use App\Models\ExpenseBudget;
use App\Models\ExpenseIncome;
use App\Services\CurrencyService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function __construct(private readonly CurrencyService $currency)
    {
    }

    /** Paginated, filterable list. */
    public function index(Request $request): JsonResponse
    {
        $query = Expense::query()
            ->with('category')
            ->where('admin_user_id', $request->user()->id)
            ->when($request->filled('category'), fn ($q) => $q->where('expense_category_id', $request->category))
            ->when($request->filled('payment_method'), fn ($q) => $q->where('payment_method', $request->payment_method))
            ->when($request->filled('from'), fn ($q) => $q->whereDate('date', '>=', $request->from))
            ->when($request->filled('to'), fn ($q) => $q->whereDate('date', '<=', $request->to))
            ->when($request->filled('min'), fn ($q) => $q->where('amount_pkr', '>=', $request->min))
            ->when($request->filled('max'), fn ($q) => $q->where('amount_pkr', '<=', $request->max))
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = $request->search;
                $q->where(fn ($w) => $w->where('title', 'ilike', "%{$term}%")
                    ->orWhereJsonContains('tags', $term));
            });

        $sort = $request->get('sort', 'date');
        $dir = $request->get('dir', 'desc');
        $query->orderBy(in_array($sort, ['date', 'amount_pkr']) ? $sort : 'date', $dir === 'asc' ? 'asc' : 'desc');

        return ExpenseResource::collection($query->paginate($request->get('per_page', 20)))->response();
    }

    public function store(StoreExpenseRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['admin_user_id'] = $request->user()->id;
        $data['converted_amount'] = $this->currency->convert((float) $data['amount_pkr'], 'USD');
        $data['exchange_rate'] = $this->currency->rates()['PKR'] ?? null;

        if ($request->hasFile('receipt_image')) {
            $data['receipt_image'] = $request->file('receipt_image')->store('receipts', 'public');
        }

        $expense = Expense::create($data)->load('category');

        return (new ExpenseResource($expense))->response()->setStatusCode(201);
    }

    public function update(StoreExpenseRequest $request, Expense $expense): JsonResponse
    {
        abort_unless($expense->admin_user_id === $request->user()->id, 403);
        $expense->update($request->validated());

        return (new ExpenseResource($expense->load('category')))->response();
    }

    public function destroy(Request $request, Expense $expense): JsonResponse
    {
        abort_unless($expense->admin_user_id === $request->user()->id, 403);
        $expense->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $ids = $request->validate(['ids' => 'required|array', 'ids.*' => 'integer'])['ids'];
        Expense::where('admin_user_id', $request->user()->id)->whereIn('id', $ids)->delete();

        return response()->json(['message' => 'Deleted', 'count' => count($ids)]);
    }

    /** Overview dashboard aggregates for /admin/expenses. */
    public function overview(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();

        $monthExpenses = Expense::where('admin_user_id', $userId)
            ->whereBetween('date', [$startOfMonth, $now->copy()->endOfMonth()]);

        $totalSpent = (clone $monthExpenses)->sum('amount_pkr');

        $totalIncome = ExpenseIncome::where('admin_user_id', $userId)
            ->whereBetween('date', [$startOfMonth, $now->copy()->endOfMonth()])
            ->sum('amount_pkr');

        $budgetTotal = ExpenseBudget::where('admin_user_id', $userId)
            ->where('month', $now->month)->where('year', $now->year)
            ->sum('budget_amount');

        $byCategory = (clone $monthExpenses)
            ->selectRaw('expense_category_id, SUM(amount_pkr) as total')
            ->groupBy('expense_category_id')
            ->with('category')
            ->get()
            ->map(fn ($row) => [
                'category' => $row->category?->name,
                'color' => $row->category?->color_hex,
                'icon' => $row->category?->icon,
                'total' => (float) $row->total,
            ]);

        // Last 6 months trend
        $trend = collect(range(5, 0))->map(function ($i) use ($userId, $now) {
            $month = $now->copy()->subMonths($i);
            $spent = Expense::where('admin_user_id', $userId)
                ->whereYear('date', $month->year)->whereMonth('date', $month->month)
                ->sum('amount_pkr');
            $income = ExpenseIncome::where('admin_user_id', $userId)
                ->whereYear('date', $month->year)->whereMonth('date', $month->month)
                ->sum('amount_pkr');

            return ['month' => $month->format('M'), 'expense' => (float) $spent, 'income' => (float) $income];
        });

        $recent = Expense::with('category')
            ->where('admin_user_id', $userId)
            ->latest('date')->limit(10)->get();

        return response()->json([
            'summary' => [
                'total_spent' => (float) $totalSpent,
                'total_income' => (float) $totalIncome,
                'net_balance' => (float) ($totalIncome - $totalSpent),
                'budget_total' => (float) $budgetTotal,
                'budget_used_pct' => $budgetTotal > 0 ? round($totalSpent / $budgetTotal * 100, 1) : 0,
            ],
            'by_category' => $byCategory,
            'trend' => $trend,
            'recent' => ExpenseResource::collection($recent),
        ]);
    }
}
