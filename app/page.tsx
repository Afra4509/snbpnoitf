"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, ShieldAlert, User } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    sender_name: "",
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
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to join queue");
      }

      localStorage.setItem("queue_user_id", data.user.id);
      router.push("/donate");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10 bg-[#020817]">
        <div className="absolute -top-[20%] -left-[10%] w-[55%] h-[55%] rounded-full bg-blue-600/15 blur-[130px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-[55%] -right-[10%] w-[45%] h-[45%] rounded-full bg-violet-600/15 blur-[130px] animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
        <div className="absolute bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700" style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset',
      }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', boxShadow: '0 8px 24px rgba(99,102,241,0.35)' }}>
            <User className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">
            Livestream{" "}
            <span style={{
              background: 'linear-gradient(90deg, #60a5fa, #818cf8, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Queue</span>
          </h1>
          <p style={{ color: 'rgba(148,163,184,0.8)', fontSize: '14px' }}>
            Daftarkan dirimu untuk bergabung ke antrian siaran langsung.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl flex items-start gap-3"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium leading-relaxed">{error}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Sender Name - FIRST */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium ml-1" style={{ color: 'rgba(226,232,240,0.9)' }}>
              Nama Pengirim <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Masukkan nama Anda"
              className="w-full rounded-xl px-4 py-3 text-white transition-all focus:outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 2px rgba(99,102,241,0.5)')}
              onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
              value={form.sender_name}
              onChange={(e) => setForm({ ...form, sender_name: e.target.value })}
            />
            <p className="text-xs ml-1" style={{ color: 'rgba(100,116,139,0.8)' }}>
              Nama ini yang akan tampil di layar livestream
            </p>
          </div>

          {/* Registration Number */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium ml-1" style={{ color: 'rgba(226,232,240,0.9)' }}>
              Nomor Registrasi <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Masukkan nomor registrasi"
              className="w-full rounded-xl px-4 py-3 text-white transition-all focus:outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 2px rgba(99,102,241,0.5)')}
              onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
              value={form.registration_number}
              onChange={(e) => setForm({ ...form, registration_number: e.target.value })}
            />
          </div>

          {/* Birth Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium ml-1" style={{ color: 'rgba(226,232,240,0.9)' }}>
              Tanggal Lahir <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              type="date"
              required
              className="w-full rounded-xl px-4 py-3 text-white focus:outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                colorScheme: 'dark',
              }}
              onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 2px rgba(99,102,241,0.5)')}
              onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
              value={form.birth_date}
              onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
            />
          </div>

          {/* Private Mode */}
          <div className="pt-1">
            <label className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
            >
              <input
                type="checkbox"
                className="w-5 h-5 rounded"
                style={{ accentColor: '#6366f1' }}
                checked={form.is_private}
                onChange={(e) => setForm({ ...form, is_private: e.target.checked })}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">Mode Privat</span>
                <span className="text-xs" style={{ color: 'rgba(100,116,139,0.9)' }}>
                  Detail saya tidak akan ditampilkan di layar livestream
                </span>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !form.sender_name || !form.registration_number || !form.birth_date}
            className="w-full mt-2 font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              color: '#fff',
              boxShadow: '0 8px 20px rgba(99,102,241,0.3)',
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget.style.transform = 'scale(1.02)'); }}
            onMouseLeave={e => { (e.currentTarget.style.transform = 'scale(1)'); }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Gabung Antrian
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
