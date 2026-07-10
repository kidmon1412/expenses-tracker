import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("savings_targets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ savingsTargets: data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, target_amount, current_amount, deadline } = body as {
      name: string;
      target_amount: number;
      current_amount?: number;
      deadline?: string | null;
    };

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (!target_amount || Number(target_amount) <= 0) {
      return NextResponse.json({ error: "target_amount must be greater than 0" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: target, error } = await supabase
      .from("savings_targets")
      .insert({
        user_id: user?.id ?? null,
        name: name.trim(),
        target_amount: Number(target_amount),
        current_amount: Number(current_amount) || 0,
        deadline: deadline || null,
      })
      .select()
      .single();

    if (error) {
      console.error("[api/savings-targets] insert failed:", error);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ savingsTarget: target }, { status: 201 });
  } catch (err) {
    console.error("[api/savings-targets] unexpected error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
