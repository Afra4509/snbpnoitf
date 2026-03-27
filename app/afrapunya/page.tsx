"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ShieldCheck, Play, SkipForward, CheckCircle2, RefreshCw, Users, Zap, Clock } from "lucide-react";

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const fetchRef = useRef<() => void>(() => {});

  useEffect(() => {
    const savedAuth = localStorage.getItem("adminAuth");
    if (savedAuth) {
      try {
        const { pwd, exp } = JSON.parse(savedAuth);
        if (Date.now() < exp) {
          setPassword(pwd);
          setLoggedIn(true);
        } else {
          localStorage.removeItem("adminAuth");
        }
      } catch (e) {}
    }
  }, []);

  const handleLogin = () => {
    if (!password) return;
    setLoggedIn(true);
    localStorage.setItem("adminAuth", JSON.stringify({ pwd: password, exp: Date.now() + 86400000 }));
  };

  const fetchUsers = useCallback(async () => {
    if (!loggedIn) return;
    try {
      const res = await fetch(`/api/admin/users?pwd=${password}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {}
  }, [loggedIn, password]);

  // Store latest fetchUsers in a ref to avoid stale closures
  useEffect(() => {
    fetchRef.current = fetchUsers;
  }, [fetchUsers]);

  useEffect(() => {
    if (!loggedIn) return;
    fetchUsers();
    const int = setInterval(() => fetchRef.current(), 5000);
    return () => clearInterval(int);
  }, [loggedIn, fetchUsers]);

  const handleAction = async (action: string, userId?: string) => {
    const loadingKey = userId ? `${action}-${userId}` : action;
    setActionLoading(loadingKey);

    // --- OPTIMISTIC UPDATE ---
    setUsers((prev) => {
      if (action === "complete" || action === "skip") {
        const status = action === "complete" ? "completed" : "skipped";
        const updated = prev.map((u) => (u.id === userId ? { ...u, status } : u));
        // Auto-promote: if the completed/skipped user was active, promote next
        const wasActive = prev.find((u) => u.id === userId)?.status === "active";
        if (wasActive) {
          const nextWaiting = updated
            .filter((u) => u.status === "waiting")
            .sort((a, b) => b.priority_score - a.priority_score)[0];
          if (nextWaiting) {
            return updated.map((u) => (u.id === nextWaiting.id ? { ...u, status: "active" } : u));
          }
        }
        return updated;
      }
      if (action === "promote") {
        const completed = prev.map((u) => (u.status === "active" ? { ...u, status: "completed" } : u));
        const nextWaiting = completed
          .filter((u) => u.status === "waiting")
          .sort((a, b) => b.priority_score - a.priority_score)[0];
        if (nextWaiting) return completed.map((u) => (u.id === nextWaiting.id ? { ...u, status: "active" } : u));
        return completed;
      }
      if (action === "reset") {
        return prev.map((u) =>
          u.status === "waiting" || u.status === "active" ? { ...u, status: "completed" } : u
        );
      }
      return prev;
    });

    // Fire actual API call in background
    try {
      await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId, password }),
      });
    } finally {
      setActionLoading(null);
      // Sync from server after action
      setTimeout(() => fetchRef.current(), 600);
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020817] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px]" />
          <div className="absolute bottom-[10%] right-[5%] w-[35%] h-[35%] rounded-full bg-violet-600/10 blur-[100px]" />
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '20px',
          padding: '32px',
          width: '100%',
          maxWidth: '360px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
        }}>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 8px 20px rgba(99,102,241,0.4)' }}>
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold mb-1 text-white">Admin Access</h1>
            <p className="text-sm mb-6" style={{ color: 'rgba(100,116,139,0.8)' }}>Masukkan password untuk melanjutkan</p>
            <input
              type="password"
              placeholder="Password..."
              className="w-full rounded-xl px-4 py-3 mb-4 focus:outline-none text-white"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                colorScheme: 'dark',
              }}
              onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 2px rgba(99,102,241,0.5)')}
              onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <button
              onClick={handleLogin}
              className="w-full font-semibold py-3 rounded-xl transition-all text-white"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                boxShadow: '0 6px 16px rgba(99,102,241,0.35)',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const active = users.find((u) => u.status === "active");
  const waiting = users.filter((u) => u.status === "waiting");

  return (
    <main className="min-h-screen p-6 bg-[#020817] text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Admin Dashboard</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(100,116,139,0.8)' }}>Kelola antrian livestream secara real-time</p>
          </div>
          <button
            onClick={() => { if (confirm("Reset seluruh antrian?")) handleAction("reset"); }}
            disabled={actionLoading === "reset"}
            className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
            style={{
              background: 'rgba(239,68,68,0.1)',
              color: '#f87171',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.2)')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)')}
          >
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left panel */}
          <div className="md:col-span-1 space-y-4">
            {/* Current Active */}
            <h2 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: '#60a5fa' }}>
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Current Active
            </h2>

            {active ? (
              <div className="rounded-2xl p-5 space-y-4" style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(99,102,241,0.25)',
                boxShadow: '0 4px 16px rgba(99,102,241,0.08)',
              }}>
                <p className="text-xs font-mono" style={{ color: 'rgba(99,102,241,0.7)' }}>{active.id}</p>
                <div>
                  <div className="text-2xl font-bold font-mono text-white">{active.registration_number}</div>
                  {active.sender_name && (
                    <div className="text-sm font-medium mt-0.5" style={{ color: '#a5b4fc' }}>{active.sender_name}</div>
                  )}
                </div>
                <div className="flex gap-4 text-xs" style={{ color: 'rgba(100,116,139,0.9)' }}>
                  <span>DOB: {active.birth_date}</span>
                  <span style={{ color: active.donation_amount > 0 ? '#fbbf24' : 'inherit' }}>
                    {active.donation_amount > 0 ? `⚡ Rp ${active.donation_amount / 1000}k Donated` : 'Rp 0 Donated'}
                  </span>
                </div>
                {active.is_private && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium"
                    style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}>
                    🔒 PRIVATE MODE
                  </span>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleAction("complete", active.id)}
                    disabled={!!actionLoading}
                    className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold transition-all disabled:opacity-40"
                    style={{
                      background: 'rgba(52,211,153,0.15)',
                      color: '#34d399',
                      border: '1px solid rgba(52,211,153,0.25)',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(52,211,153,0.25)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(52,211,153,0.15)')}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Complete
                  </button>
                  <button
                    onClick={() => handleAction("skip", active.id)}
                    disabled={!!actionLoading}
                    className="px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold transition-all disabled:opacity-40"
                    style={{
                      background: 'rgba(100,116,139,0.15)',
                      color: '#94a3b8',
                      border: '1px solid rgba(100,116,139,0.2)',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(100,116,139,0.25)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(100,116,139,0.15)')}
                  >
                    <SkipForward className="w-4 h-4" /> Skip
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-4" style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                minHeight: '160px',
              }}>
                <p className="text-sm italic" style={{ color: 'rgba(100,116,139,0.7)' }}>Tidak ada antrian aktif.</p>
                <button
                  onClick={() => handleAction("promote")}
                  disabled={!!actionLoading || waiting.length === 0}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-40 text-white"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')}
                >
                  <Play className="w-4 h-4" /> Mulai Antrian
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4 flex flex-col gap-1" style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div className="flex items-center gap-1.5" style={{ color: 'rgba(100,116,139,0.8)' }}>
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs">Menunggu</span>
                </div>
                <span className="text-2xl font-bold text-white">{waiting.length}</span>
                <span className="text-xs" style={{ color: 'rgba(100,116,139,0.6)' }}>/ 300 max</span>
              </div>
              <div className="rounded-xl p-4 flex flex-col gap-1" style={{
                background: 'rgba(245,158,11,0.06)',
                border: '1px solid rgba(245,158,11,0.15)',
              }}>
                <div className="flex items-center gap-1.5" style={{ color: 'rgba(251,191,36,0.8)' }}>
                  <Zap className="w-3.5 h-3.5" />
                  <span className="text-xs">VIP</span>
                </div>
                <span className="text-2xl font-bold" style={{ color: '#fbbf24' }}>
                  {waiting.filter(u => u.donation_amount > 0).length}
                </span>
                <span className="text-xs" style={{ color: 'rgba(251,191,36,0.5)' }}>boosted</span>
              </div>
            </div>
          </div>

          {/* Right panel - Waiting Queue */}
          <div className="md:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'rgba(226,232,240,0.7)' }}>
              <Users className="w-4 h-4" />
              Waiting Queue
            </h2>
            <div className="rounded-2xl overflow-hidden" style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <table className="w-full text-left text-sm">
                <thead style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <tr>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: 'rgba(100,116,139,0.8)' }}>Priority</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: 'rgba(100,116,139,0.8)' }}>Nama</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: 'rgba(100,116,139,0.8)' }}>Registration</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: 'rgba(100,116,139,0.8)' }}>DOB</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: 'rgba(100,116,139,0.8)' }}>Donasi</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-right" style={{ color: 'rgba(100,116,139,0.8)' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {waiting.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center italic text-sm" style={{ color: 'rgba(100,116,139,0.6)' }}>
                        Antrian kosong
                      </td>
                    </tr>
                  ) : (
                    waiting.map((u) => (
                      <tr
                        key={u.id}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLTableRowElement).style.background = 'transparent')}
                      >
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: 'rgba(100,116,139,0.5)' }}>
                          {u.priority_score}
                        </td>
                        <td className="px-4 py-3 font-medium text-white">
                          {u.sender_name || <span style={{ color: 'rgba(100,116,139,0.5)' }}>-</span>}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: 'rgba(226,232,240,0.7)' }}>
                          {u.registration_number}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'rgba(100,116,139,0.8)' }}>{u.birth_date}</td>
                        <td className="px-4 py-3">
                          {u.donation_amount > 0 ? (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>
                              ⚡ Rp {u.donation_amount / 1000}k
                            </span>
                          ) : (
                            <span style={{ color: 'rgba(100,116,139,0.4)' }}>—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleAction("skip", u.id)}
                            disabled={!!actionLoading}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all disabled:opacity-40"
                            style={{
                              background: 'rgba(100,116,139,0.1)',
                              color: 'rgba(148,163,184,0.8)',
                              border: '1px solid rgba(100,116,139,0.15)',
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(100,116,139,0.2)';
                              (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(100,116,139,0.1)';
                              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(148,163,184,0.8)';
                            }}
                          >
                            Skip
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
