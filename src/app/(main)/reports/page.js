import { redirect } from "next/navigation";
import { createClient, getUserProfile } from "@/lib/supabase/server";
import ReportsTable from "@/components/ReportsTable";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const { profile } = await getUserProfile();
  if (profile?.role !== "operational") redirect("/dashboard");

  const supabase = await createClient();
  const { data: receipts } = await supabase
    .from("receipts")
    .select(
      "*, cash_advances:cash_advance_id(purpose, profiles:requester_id(full_name))"
    )
    .order("created_at", { ascending: false });

  const rows = (receipts ?? []).map((r) => ({
    id: r.id,
    receiptDate: r.receipt_date,
    requesterName: r.cash_advances?.profiles?.full_name ?? "-",
    purpose: r.cash_advances?.purpose ?? "-",
    vendor: r.vendor,
    amount: r.amount,
    notes: r.notes,
    driveUrl: r.drive_view_url,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Laporan</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Rekap seluruh kwitansi realisasi Cash Advance.
        </p>
      </div>
      <ReportsTable rows={rows} />
    </div>
  );
}
