"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, ShieldAlert } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    registration_number: "",
    birth_date: "",
    is_private: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/join-queue", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to join queue");
      }

      // Save user ID to local storage for queue polling
      localStorage.setItem("queue_user_id", data.user.id);
      
      // Redirect to donate/boost page
      router.push("/donate");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-[#020817]">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      <div className="w-full max-w-md glass-card p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 tracking-tight">
            Livestream <span className="text-gradient">Queue</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Join the priority queue for the live announcement.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium leading-relaxed">{error}</p>
          </div>
        )}

        <form className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-200 ml-1">
              Registration Number
            </label>
            <input
              type="text"
              required
              placeholder="Enter your registration number"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={form.registration_number}
              onChange={(e) => setForm({ ...form, registration_number: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-200 ml-1">
              Birth Date
            </label>
            <input
              type="date"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={form.birth_date}
              onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-white/20 bg-black/50 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                checked={form.is_private}
                onChange={(e) => setForm({ ...form, is_private: e.target.checked })}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">Private Mode</span>
                <span className="text-xs text-gray-400">Do not show my details on livestream</span>
              </div>
            </label>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !form.registration_number || !form.birth_date}
            className="w-full mt-4 bg-white text-black font-semibold py-3.5 px-4 rounded-xl hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Join Queue
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
