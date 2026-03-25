"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap, ArrowRight, Coins } from "lucide-react";

export default function DonatePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState("");

  const presetAmounts = [5000, 10000, 20000];

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
      
      // Redirect to Pakasir
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
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-[#020817]">
        <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-600/20 blur-[120px]" />
      </div>

      <div className="w-full max-w-md glass-card p-8 animate-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-4 border border-yellow-500/20">
            <Zap className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Boost Your Priority</h1>
          <p className="text-muted-foreground text-sm">
            Support the stream and jump ahead in the queue!
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 text-red-400 text-sm text-center border border-red-500/20">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {presetAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => handleDonate(amt)}
                disabled={loading}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-4 flex flex-col items-center justify-center transition-all disabled:opacity-50"
              >
                <Coins className="w-5 h-5 mb-2 text-yellow-400" />
                <span className="font-semibold text-sm">Rp {amt / 1000}k</span>
              </button>
            ))}
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-wider">or custom amount</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Rp</span>
              <input
                type="number"
                min="1000"
                placeholder="0"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all text-white"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
            </div>
            <button
              onClick={() => handleDonate(Number(customAmount))}
              disabled={loading || !customAmount || Number(customAmount) < 1000}
              className="bg-yellow-500 text-yellow-950 px-6 font-semibold rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Boost"}
            </button>
          </div>

          <button
            onClick={skipDonation}
            className="w-full mt-6 py-4 flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium group"
          >
            Skip, I will wait in the standard queue
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </main>
  );
}
