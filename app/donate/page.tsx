"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap, Coins, ChevronRight, TrendingUp, Clock } from "lucide-react";

export default function DonatePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  const presetAmounts = [
    { amount: 5000, label: "Rp 5k", boost: "+3 steps" },
    { amount: 10000, label: "Rp 10k", boost: "+7 steps" },
    { amount: 20000, label: "Rp 20k", boost: "+15 steps" },
  ];

  useEffect(() => {
    const id = localStorage.getItem("queue_user_id");
    if (!id) {
      router.push("/");
    } else {
      setUserId(id);
    }
  }, [router]);

  const handleDonate = async (amount: number) => {
    if (!userId) return;
    setLoading(true);
    setError("");

    try {
      const slug = process.env.NEXT_PUBLIC_PAKASIR_SLUG || "notifu";
      const origin = window.location.origin;
      const redirectUrl = `${origin}/api/donate/confirm?user_id=${userId}&amount=${amount}`;
      const pakasirUrl = `https://app.pakasir.com/pay/${slug}/${amount}?order_id=${userId}&qris_only=1&redirect=${encodeURIComponent(redirectUrl)}`;
      window.location.href = pakasirUrl;
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  const skipDonation = () => {
    router.push("/queue");
  };

  if (!userId) return null;

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[#020817]">
        <div className="absolute top-[10%] -left-[10%] w-[55%] h-[55%] rounded-full bg-amber-600/10 blur-[120px] animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute -bottom-[15%] -right-[5%] w-[45%] h-[45%] rounded-full bg-emerald-600/10 blur-[120px] animate-pulse" style={{ animationDuration: '9s', animationDelay: '3s' }} />
        <div className="absolute top-[50%] left-[30%] w-[25%] h-[25%] rounded-full bg-orange-600/8 blur-[80px]" />
      </div>

      <div
        className="w-full max-w-md animate-in zoom-in-95 duration-500"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #f97316)',
              boxShadow: '0 8px 24px rgba(245,158,11,0.4)',
            }}
          >
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2 tracking-tight text-white">Boost Your Priority</h1>
          <p style={{ color: 'rgba(148,163,184,0.85)', fontSize: '14px', lineHeight: 1.6 }}>
            Donasi untuk mendukung stream dan{" "}
            <span style={{ color: '#fbbf24', fontWeight: 600 }}>loncat lebih cepat</span>{" "}
            ke posisi atas antrian!
          </p>
        </div>

        {/* How it works banner */}
        <div
          className="mb-6 p-3.5 rounded-xl flex items-center gap-3"
          style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}
        >
          <TrendingUp className="w-5 h-5 flex-shrink-0" style={{ color: '#f59e0b' }} />
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(251,191,36,0.9)' }}>
            <span className="font-semibold">Cara kerja boost:</span> Semakin besar donasi, semakin
            tinggi posisi antrian kamu. Langsung naik tanpa perlu menunggu lama!
          </p>
        </div>

        {error && (
          <div
            className="mb-5 p-4 rounded-xl text-sm text-center"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
          >
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Preset amounts */}
          <div className="grid grid-cols-3 gap-3">
            {presetAmounts.map(({ amount, label, boost }) => (
              <button
                key={amount}
                onClick={() => { setSelectedPreset(amount); handleDonate(amount); }}
                disabled={loading}
                className="rounded-xl py-4 flex flex-col items-center justify-center transition-all disabled:opacity-50 relative overflow-hidden group"
                style={{
                  background: selectedPreset === amount
                    ? 'rgba(245,158,11,0.15)'
                    : 'rgba(255,255,255,0.04)',
                  border: selectedPreset === amount
                    ? '1px solid rgba(245,158,11,0.5)'
                    : '1px solid rgba(255,255,255,0.08)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,158,11,0.12)';
                  (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(245,158,11,0.35)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                }}
              >
                <Coins className="w-5 h-5 mb-2" style={{ color: '#fbbf24' }} />
                <span className="font-bold text-sm text-white">{label}</span>
                <span
                  className="text-xs mt-1 font-semibold"
                  style={{ color: '#34d399' }}
                >
                  {boost}
                </span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="relative flex items-center py-1">
            <div className="flex-grow" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
            <span className="flex-shrink-0 mx-4 text-xs uppercase tracking-widest" style={{ color: 'rgba(100,116,139,0.7)' }}>
              atau nominal lain
            </span>
            <div className="flex-grow" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
          </div>

          {/* Custom amount */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium" style={{ color: 'rgba(100,116,139,0.8)' }}>Rp</span>
              <input
                type="number"
                min="1000"
                placeholder="0"
                className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none transition-all text-white"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 2px rgba(245,158,11,0.4)')}
                onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
            </div>
            <button
              onClick={() => handleDonate(Number(customAmount))}
              disabled={loading || !customAmount || Number(customAmount) < 1000}
              className="px-6 font-bold rounded-xl transition-all disabled:opacity-40 flex items-center gap-1"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                color: '#fff',
                boxShadow: '0 6px 16px rgba(245,158,11,0.35)',
              }}
              onMouseEnter={e => { if (!(e.currentTarget as HTMLButtonElement).disabled) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Boost"}
            </button>
          </div>

          {/* Skip button - prominent */}
          <div className="pt-2">
            <button
              onClick={skipDonation}
              className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-medium text-sm transition-all group"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(148,163,184,0.8)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
                (e.currentTarget as HTMLButtonElement).style.color = '#fff';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(148,163,184,0.8)';
              }}
            >
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>Skip, I will wait in the standard queue</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="text-center text-xs mt-2" style={{ color: 'rgba(100,116,139,0.65)' }}>
              Kamu tetap masuk antrian standar — tanpa prioritas tambahan
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
