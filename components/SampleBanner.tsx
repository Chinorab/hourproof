import { FlaskConical } from "lucide-react";

export function SampleBanner({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-attention-soft p-4 ring-1 ring-attention/30" data-testid="sample-banner">
      <FlaskConical className="mt-0.5 size-[18px] shrink-0 text-attention" strokeWidth={1.75} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">Sample data</p>
        <p className="mt-0.5 text-sm text-muted">These entries come from sample screenshots of fictional apps.</p>
        <button
          type="button"
          onClick={onClear}
          className="mt-3 h-9 rounded-lg border border-line bg-surface px-3 text-sm font-medium hover:bg-bg"
        >
          Clear sample data
        </button>
      </div>
    </div>
  );
}
