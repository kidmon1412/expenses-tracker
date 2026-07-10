import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category, Transaction } from "@/lib/types";

export interface ReportRow {
  txn_date: string;
  type: string;
  category: string;
  channel: string;
  amount: number;
  note: string;
}

export interface ReportSummary {
  rows: ReportRow[];
  totalIncome: number;
  totalExpense: number;
  net: number;
  periodStart: string;
  periodEnd: string;
}

export async function fetchReportData(
  supabase: SupabaseClient,
  periodStart: string,
  periodEnd: string,
): Promise<ReportSummary> {
  const [{ data: transactions }, { data: categories }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .gte("txn_date", periodStart)
      .lte("txn_date", periodEnd)
      .order("txn_date", { ascending: true }),
    supabase.from("categories").select("*"),
  ]);

  const categoryMap = new Map<string, Category>((categories ?? []).map((c) => [c.id, c]));
  const txns = (transactions ?? []) as Transaction[];

  const rows: ReportRow[] = txns.map((t) => ({
    txn_date: t.txn_date,
    type: t.type,
    category: t.category_id ? (categoryMap.get(t.category_id)?.name ?? "Uncategorised") : "Uncategorised",
    channel: t.channel,
    amount: Number(t.amount),
    note: t.note ?? "",
  }));

  const totalIncome = rows.filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0);
  const totalExpense = rows.filter((r) => r.type === "expense").reduce((s, r) => s + r.amount, 0);

  return {
    rows,
    totalIncome,
    totalExpense,
    net: totalIncome - totalExpense,
    periodStart,
    periodEnd,
  };
}
