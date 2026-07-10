"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Report, ReportFormat } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { monthInclusiveRange } from "@/lib/date";

function currentMonthValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function GenerateReportForm({ onGenerated }: { onGenerated: () => void }) {
  const [month, setMonth] = useState(currentMonthValue());
  const [format, setFormat] = useState<ReportFormat>("pdf");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    setUpgradeRequired(false);
    try {
      const { start, end } = monthInclusiveRange(month);
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period_start: start, period_end: end, format }),
      });
      const data = await res.json();
      if (res.status === 403 && data.upgradeRequired) {
        setStatus("error");
        setUpgradeRequired(true);
        setError(data.error);
        return;
      }
      if (!res.ok) throw new Error("failed");
      window.location.href = data.downloadUrl;
      setStatus("idle");
      onGenerated();
    } catch {
      setStatus("error");
      setError("Report could not be generated. Try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs font-medium text-neutral-600">Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="mt-1 block rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-600">Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as ReportFormat)}
            className="mt-1 block rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {status === "submitting" ? "Generating…" : "Generate report"}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600">
          {error}
          {upgradeRequired && (
            <>
              {" "}
              <Link href="/upgrade" className="font-medium underline">
                Upgrade now
              </Link>
            </>
          )}
        </p>
      )}
    </form>
  );
}

export function ReportsClient({ initialReports }: { initialReports: Report[] }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <GenerateReportForm onGenerated={() => router.refresh()} />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900">History</h2>
        {initialReports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center">
            <p className="text-neutral-500">No reports yet — generate your first one above.</p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white shadow-sm">
            {initialReports.map((report) => (
              <li key={report.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="font-medium text-neutral-900">
                    {formatDate(report.period_start)} – {formatDate(report.period_end)}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {report.format.toUpperCase()} · generated {formatDate(report.created_at)}
                  </p>
                </div>
                <a
                  href={`/api/reports/${report.id}/download`}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
