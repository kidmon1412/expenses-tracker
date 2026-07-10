import { createClient } from "@/lib/supabase/server";
import type { Report } from "@/lib/types";
import { ReportsClient } from "@/components/reports/ReportsClient";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto min-h-screen max-w-2xl space-y-8 p-6">
      <header className="space-y-1">
        <a href="/" className="text-sm text-neutral-500 hover:underline">
          ← Back to dashboard
        </a>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Reports</h1>
        <p className="text-sm text-neutral-500">Generate and download a monthly expense report.</p>
      </header>

      <ReportsClient initialReports={(reports ?? []) as Report[]} />
    </main>
  );
}
