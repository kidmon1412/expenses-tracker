import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { limit_amount } = body as { limit_amount: number };

    if (!limit_amount || Number(limit_amount) <= 0) {
      return NextResponse.json({ error: "limit_amount must be greater than 0" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: budget, error } = await supabase
      .from("budgets")
      .update({ limit_amount: Number(limit_amount) })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[api/budgets/:id] update failed:", error);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ budget });
  } catch (err) {
    console.error("[api/budgets/:id] unexpected error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from("budgets").delete().eq("id", id);

  if (error) {
    console.error("[api/budgets/:id] delete failed:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
