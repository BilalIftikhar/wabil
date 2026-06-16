export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-heading text-4xl font-semibold">{title}</h1>
        {subtitle && <p className="text-sm text-foreground/50">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
