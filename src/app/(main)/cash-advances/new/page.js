"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CurrencyInput from "@/components/CurrencyInput";

export default function NewCashAdvancePage() {
  const router = useRouter();
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError("Nominal harus lebih dari 0.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("cash_advances")
      .insert({
        requester_id: user.id,
        purpose,
        amount_requested: numericAmount,
        bank_name: bankName,
        bank_account_number: bankAccountNumber,
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      setError("Gagal mengajukan Cash Advance. Coba lagi.");
      return;
    }

    router.push(`/cash-advances/${data.id}`);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          Ajukan Cash Advance
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Pengajuan akan dikirim ke Tim Operasional untuk disetujui.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4"
      >
        {error && (
          <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Keperluan
          </label>
          <textarea
            required
            rows={3}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            placeholder="Contoh: Operasional perjalanan dinas ke Surabaya"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nominal Diajukan (Rp)
          </label>
          <CurrencyInput
            required
            value={amount}
            onValueChange={setAmount}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Bank Tujuan Transfer
          </label>
          <input
            type="text"
            required
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            placeholder="Contoh: BCA, Mandiri, BRI"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nomor Rekening
          </label>
          <input
            type="text"
            required
            inputMode="numeric"
            value={bankAccountNumber}
            onChange={(e) =>
              setBankAccountNumber(e.target.value.replace(/\D/g, ""))
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            placeholder="Nomor rekening penerima"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-medium rounded-lg py-2.5 transition-colors"
        >
          {loading ? "Mengirim..." : "Kirim Pengajuan"}
        </button>
      </form>
    </div>
  );
}
