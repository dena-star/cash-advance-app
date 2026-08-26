import Link from "next/link";
import { notFound } from "next/navigation";
import { Camera } from "lucide-react";
import { createClient, getUserProfile } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import StatusBadge from "@/components/StatusBadge";
import ReceiptCard from "@/components/ReceiptCard";
import ApprovalActions from "@/components/ApprovalActions";
import ReturnsSection from "@/components/ReturnsSection";

export const dynamic = "force-dynamic";

export default async function CashAdvanceDetailPage({ params }) {
  const { id } = await params;
  const { profile } = await getUserProfile();
  const supabase = await createClient();

  const { data: ca } = await supabase
    .from("cash_advances")
    .select("*, profiles:requester_id(full_name, email)")
    .eq("id", id)
    .single();

  if (!ca) notFound();

  const { data: balanceRow } = await supabase
    .from("cash_advance_balances")
    .select("balance, total_spent, total_returned, total_reimbursed")
    .eq("cash_advance_id", id)
    .single();

  const { data: receipts } = await supabase
    .from("receipts")
    .select("*")
    .eq("cash_advance_id", id)
    .order("created_at", { ascending: false });

  const { data: returns } = await supabase
    .from("cash_advance_returns")
    .select("*")
    .eq("cash_advance_id", id)
    .order("created_at", { ascending: false });

  const { data: reimbursements } = await supabase
    .from("cash_advance_reimbursements")
    .select("*")
    .eq("cash_advance_id", id)
    .order("created_at", { ascending: false });

  const isOwner = ca.requester_id === profile.id;
  const isOperational = profile.role === "operational";
  const balance = balanceRow?.balance ?? ca.amount_requested;
  const totalSpent = balanceRow?.total_spent ?? 0;
  const totalReturned = balanceRow?.total_returned ?? 0;
  const totalReimbursed = balanceRow?.total_reimbursed ?? 0;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-slate-900">{ca.purpose}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Diajukan oleh {ca.profiles?.full_name} &middot;{" "}
              {formatDate(ca.created_at)}
            </p>
          </div>
          <StatusBadge status={ca.status} />
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div>
            <p className="text-xs text-slate-500">Diajukan</p>
            <p className="font-semibold text-slate-900 text-sm mt-0.5">
              {formatCurrency(ca.amount_requested)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Terpakai</p>
            <p className="font-semibold text-slate-900 text-sm mt-0.5">
              {formatCurrency(totalSpent)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Sisa Saldo</p>
            <p
              className={`font-semibold text-sm mt-0.5 ${
                balance < 0 ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        {(ca.bank_name || ca.bank_account_number) && (
          <div className="mt-4 bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-xs text-slate-500">Rekening Tujuan Transfer</p>
            <p className="text-sm font-medium text-slate-900 mt-0.5">
              {ca.bank_name} &middot; {ca.bank_account_number}
            </p>
          </div>
        )}

        {ca.review_note && (
          <p className="text-xs text-slate-500 mt-4 bg-slate-50 rounded-lg px-3 py-2">
            Catatan: {ca.review_note}
          </p>
        )}
      </div>

      {isOperational && ca.status === "pending" && !isOwner && (
        <ApprovalActions cashAdvanceId={ca.id} />
      )}

      {isOwner && isOperational && ca.status === "pending" && (
        <div className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          Menunggu persetujuan admin lain. Anda tidak bisa menyetujui
          pengajuan sendiri.
        </div>
      )}

      {isOwner && ca.status === "approved" && (
        <Link
          href={`/cash-advances/${ca.id}/scan`}
          className="flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white rounded-xl py-3 font-medium"
        >
          <Camera size={18} />
          Scan Kwitansi
        </Link>
      )}

      <ReturnsSection
        cashAdvanceId={ca.id}
        status={ca.status}
        isOwner={isOwner}
        isOperational={isOperational}
        balance={balance}
        totalReturned={totalReturned}
        returns={returns}
        totalReimbursed={totalReimbursed}
        reimbursements={reimbursements}
      />

      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-2">
          Kwitansi ({receipts?.length ?? 0})
        </h2>
        <div className="space-y-2">
          {(!receipts || receipts.length === 0) && (
            <p className="text-sm text-slate-500">Belum ada kwitansi.</p>
          )}
          {receipts?.map((receipt) => (
            <ReceiptCard key={receipt.id} receipt={receipt} />
          ))}
        </div>
      </div>
    </div>
  );
}
