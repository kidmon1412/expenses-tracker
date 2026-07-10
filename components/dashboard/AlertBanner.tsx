import type { Alert } from "@/lib/types";

export function AlertBanner({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          <span aria-hidden>⚠️</span>
          <span>{alert.message}</span>
        </div>
      ))}
    </div>
  );
}
