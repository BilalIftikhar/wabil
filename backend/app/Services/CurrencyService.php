<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * Fetches live USD-based exchange rates and caches them in Redis for 1 hour.
 * Prices are stored in PKR; conversion is rate(target) / rate(PKR).
 */
class CurrencyService
{
    private const ENDPOINT = 'https://api.exchangerate-api.com/v4/latest/USD';
    private const CACHE_KEY = 'exchange_rates_usd';
    private const TTL = 3600; // 1 hour

    /** @return array<string,float> */
    public function rates(): array
    {
        return Cache::remember(self::CACHE_KEY, self::TTL, function () {
            $response = Http::timeout(8)->get(self::ENDPOINT);

            return $response->successful()
                ? $response->json('rates', [])
                : $this->fallbackRates();
        });
    }

    public function convert(float $amountPkr, string $target): float
    {
        $rates = $this->rates();
        $pkr = $rates['PKR'] ?? 278.0;
        $targetRate = $rates[strtoupper($target)] ?? $pkr;

        return round($amountPkr / $pkr * $targetRate, 2);
    }

    /** @return array<string,float> */
    private function fallbackRates(): array
    {
        return ['USD' => 1, 'PKR' => 278.0, 'GBP' => 0.79, 'AED' => 3.67, 'SAR' => 3.75, 'EUR' => 0.92];
    }
}
