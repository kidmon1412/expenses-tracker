import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { monthStart } from "@/lib/format";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") ?? monthStart();

  const supabase = await createClient();
  const { data, error } = await supabase.from("budgets").select("*").eq("month", month);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ budgets: data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category_id, limit_amount, month } = body as {
      category_id: string;
      limit_amount: number;
      month?: string;
    };

    if (!category_id) {
      return NextResponse.json({ error: "category_id is required" }, { status: 400 });
    }
    if (!limit_amount || Number(limit_amount) <= 0) {
      return NextResponse.json({ error: "limit_amount must be greater than 0" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: budget, error } = await supabase
      .from("budgets")
      .insert({
        user_id: user?.id ?? null,
        category_id,
        month: month ?? monthStart(),
        limit_amount: Number(limit_amount),
      })
      .select()
      .single();

    if (error) {
      console.error("[api/budgets] insert failed:", error);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ budget }, { status: 201 });
  } catch (err) {
    console.error("[api/budgets] unexpected error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
