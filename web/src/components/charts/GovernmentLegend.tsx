"use client";

interface Government {
  label: string;
  color: string;
  startDate: string;
  endDate: string;
}

interface GovernmentLegendProps {
  governments: Government[];
}

export function GovernmentLegend({ governments }: GovernmentLegendProps) {
  if (governments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 mt-4 justify-center">
      {governments.map((gov) => (
        <div key={gov.label} className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: gov.color }} />
          <span className="text-xs text-muted-foreground">{gov.label}</span>
        </div>
      ))}
    </div>
  );
}
