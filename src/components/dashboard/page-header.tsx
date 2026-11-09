export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-line bg-page px-4 py-5 sm:flex-row sm:items-center sm:justify-between md:px-10 md:py-6">
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] md:text-[24px]">{title}</h1>
        {description && <p className="mt-0.5 text-[14px] text-fg-2">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
