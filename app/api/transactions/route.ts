import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateBudgetUsage, evaluateBudgetAlerts } from "@/lib/server/budget-engine";
import { parseDateOnly, ymd } from "@/lib/date";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("txn_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ transactions: data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, type, category_id, channel, txn_date, note } = body as {
      amount: number;
      type: string;
      category_id: string;
      channel: string;
      txn_date: string;
      note: string | null;
    };

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "amount must be greater than 0" }, { status: 400 });
    }
    if (type !== "income" && type !== "expense") {
      return NextResponse.json({ error: "type must be income or expense" }, { status: 400 });
    }
    if (!channel || !txn_date) {
      return NextResponse.json({ error: "channel and txn_date are required" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: transaction, error } = await supabase
      .from("transactions")
      .insert({
        user_id: user?.id ?? null,
        category_id: category_id || null,
        type,
        channel,
        amount: Number(amount),
        txn_date,
        note,
        ai_category_suggestion: body.ai_category_suggestion ?? null,
        ai_category_source: body.ai_category_source ?? null,
        ai_category_confidence: body.ai_category_confidence ?? null,
        ai_category_review_status: body.ai_category_review_status ?? "unreviewed",
      })
      .select()
      .single();

    if (error) {
      console.error("[api/transactions] insert failed:", error);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }

    // Recalculate budget usage for the month and fire alerts at 80%/100% thresholds.
    let newAlerts: Awaited<ReturnType<typeof evaluateBudgetAlerts>> = [];
    if (type === "expense") {
      const { year, month } = parseDateOnly(txn_date);
      const usage = await calculateBudgetUsage(supabase, ymd(year, month, 1));
      newAlerts = await evaluateBudgetAlerts(supabase, usage, user?.id ?? null);
    }

    return NextResponse.json({ transaction, alerts: newAlerts }, { status: 201 });
  } catch (err) {
    console.error("[api/transactions] unexpected error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
