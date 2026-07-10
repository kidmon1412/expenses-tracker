import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { period_start, period_end, format } = body as {
      period_start: string;
      period_end: string;
      format: "pdf" | "csv";
    };

    if (!period_start || !period_end) {
      return NextResponse.json({ error: "period_start and period_end are required" }, { status: 400 });
    }
    if (format !== "pdf" && format !== "csv") {
      return NextResponse.json({ error: "format must be pdf or csv" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: report, error } = await supabase
      .from("reports")
      .insert({
        user_id: user?.id ?? null,
        period_start,
        period_end,
        format,
        storage_path: null,
      })
      .select()
      .single();

    if (error) {
      console.error("[api/reports/generate] insert failed:", error);
      return NextResponse.json({ error: "Report could not be generated. Try again." }, { status: 500 });
    }

    return NextResponse.json(
      { report, downloadUrl: `/api/reports/${report.id}/download` },
      { status: 201 },
    );
  } catch (err) {
    console.error("[api/reports/generate] unexpected error:", err);
    return NextResponse.json({ error: "Report could not be generated. Try again." }, { status: 500 });
  }
}
