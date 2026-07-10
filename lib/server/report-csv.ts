import type { ReportSummary } from "@/lib/server/report-data";

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildReportCsv(summary: ReportSummary): string {
  const header = ["Date", "Type", "Category", "Channel", "Amount", "Note"];
  const lines = [header.join(",")];

  for (const row of summary.rows) {
    lines.push(
      [
        row.txn_date,
        row.type,
        escapeCsvField(row.category),
        row.channel,
        row.amount.toFixed(2),
        escapeCsvField(row.note),
      ].join(","),
    );
  }

  lines.push("");
  lines.push(`Total income,${summary.totalIncome.toFixed(2)}`);
  lines.push(`Total expense,${summary.totalExpense.toFixed(2)}`);
  lines.push(`Net,${summary.net.toFixed(2)}`);

  return lines.join("\n");
}
