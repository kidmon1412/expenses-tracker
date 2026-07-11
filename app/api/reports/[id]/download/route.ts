import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchReportData } from "@/lib/server/report-data";
import { buildReportCsv } from "@/lib/server/report-csv";
import { buildReportPdf } from "@/lib/server/report-pdf";
import { canExport, getSubscriptionState } from "@/lib/server/subscription";
import { getPreferredCurrency } from "@/lib/server/currency";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const subState = await getSubscriptionState(supabase, user?.id ?? null);
  if (!canExport(subState)) {
    return NextResponse.json(
      { error: "Your trial has ended. Upgrade to continue exporting reports.", upgradeRequired: true },
      { status: 403 },
    );
  }

  const { data: report, error } = await supabase.from("reports").select("*").eq("id", id).single();

  if (error || !report) {
    return NextResponse.json({ error: "Report could not be generated. Try again." }, { status: 404 });
  }

  const summary = await fetchReportData(supabase, report.period_start, report.period_end);
  const currency = await getPreferredCurrency();
  const filename = `expense-report-${report.period_start}-to-${report.period_end}.${report.format}`;

  if (report.format === "csv") {
    const csv = buildReportCsv(summary, currency);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  const pdfBuffer = await buildReportPdf(summary, currency);
  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
