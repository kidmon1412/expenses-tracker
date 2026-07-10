import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { name, target_amount, current_amount, deadline, contribute } = body as {
      name?: string;
      target_amount?: number;
      current_amount?: number;
      deadline?: string | null;
      contribute?: number;
    };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const update: Record<string, unknown> = {};
    if (name !== undefined) update.name = name.trim();
    if (target_amount !== undefined) update.target_amount = Number(target_amount);
    if (deadline !== undefined) update.deadline = deadline || null;

    if (contribute !== undefined) {
      const { data: existing, error: fetchError } = await supabase
        .from("savings_targets")
        .select("current_amount, target_amount, name")
        .eq("id", id)
        .single();

      if (fetchError || !existing) {
        return NextResponse.json({ error: "Savings target not found." }, { status: 404 });
      }

      update.current_amount = Number(existing.current_amount) + Number(contribute);
    } else if (current_amount !== undefined) {
      update.current_amount = Number(current_amount);
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    const { data: target, error } = await supabase
      .from("savings_targets")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[api/savings-targets/:id] update failed:", error);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }

    if (target.current_amount >= target.target_amount) {
      const { data: existingAlert } = await supabase
        .from("alerts")
        .select("id")
        .eq("savings_target_id", id)
        .eq("alert_type", "target_met")
        .limit(1);

      if (!existingAlert || existingAlert.length === 0) {
        await supabase.from("alerts").insert({
          user_id: user?.id ?? null,
          savings_target_id: id,
          alert_type: "target_met",
          message: `You've reached your "${target.name}" savings target!`,
        });
      }
    }

    return NextResponse.json({ savingsTarget: target });
  } catch (err) {
    console.error("[api/savings-targets/:id] unexpected error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from("savings_targets").delete().eq("id", id);

  if (error) {
    console.error("[api/savings-targets/:id] delete failed:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
