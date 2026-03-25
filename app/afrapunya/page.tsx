"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Play, SkipForward, CheckCircle2, RefreshCw } from "lucide-react";

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
    localStorage.setItem("adminAuth", JSON.stringify({ pwd: password, exp: Date.now() + 86400000 })); // 24 hours
  };

  useEffect(() => {
    if (!loggedIn) return;
    
    const fetchUsers = async () => {
      try {
        const res = await fetch(`/api/admin/users?pwd=${password}`);
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch (err) {}
    };

    fetchUsers();
    const int = setInterval(fetchUsers, 5000);
    return () => clearInterval(int);
  }, [loggedIn, password]);

  const handleAction = async (action: string, userId?: string) => {
    setLoading(true);
    try {
      await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId, password }),
      });
      // trigger immediate refetch handled by interval usually, but can explicitly fetch if needed
    } finally {
      setLoading(false);
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020817]">
        <div className="glass-card p-8 w-full max-w-sm flex flex-col items-center">
          <ShieldCheck className="w-12 h-12 text-blue-500 mb-4" />
          <h1 className="text-xl font-bold mb-6">Admin Access</h1>
          <input
            type="password"
            placeholder="Enter password..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const active = users.find(u => u.status === 'active');
  const waiting = users.filter(u => u.status === 'waiting');

  return (
    <main className="min-h-screen p-6 bg-[#020817] text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            {/* Promote Next button removed since it is now automated */ }
            <button 
              onClick={() => { if(confirm('Reset entire queue?')) handleAction('reset') }}
              disabled={loading}
              className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
              Current Active
            </h2>
            {active ? (
              <div className="glass p-5 rounded-xl border-blue-500/30">
                <p className="text-xs text-blue-400 font-mono mb-1">{active.id}</p>
                <div className="text-2xl font-bold font-mono text-white mb-2">{active.registration_number}</div>
                <div className="flex gap-4 text-sm text-gray-400 mb-4">
                  <span>DOB: {active.birth_date}</span>
                  <span className="text-yellow-500">Rp {active.donation_amount / 1000}k Donated</span>
                </div>
                {active.is_private && <span className="inline-block px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded mb-4">PRIVATE MODE</span>}
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleAction('complete', active.id)} className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 rounded flex items-center justify-center gap-1 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Complete
                  </button>
                  <button onClick={() => handleAction('skip', active.id)} className="px-3 py-2 bg-gray-500/20 text-gray-400 hover:bg-gray-500/40 rounded flex items-center justify-center gap-1 text-sm font-medium">
                    <SkipForward className="w-4 h-4" /> Skip
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass p-5 rounded-xl border-white/5 flex flex-col items-center justify-center text-center gap-3">
                <p className="text-gray-500 italic text-sm">Nobody is currently active.</p>
                <button 
                  onClick={() => handleAction('promote')}
                  disabled={loading || waiting.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-500 rounded-lg text-sm font-medium flex items-center justify-center gap-2 w-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Play className="w-4 h-4" /> Start Queue
                </button>
              </div>
            )}
            
            <div className="glass-card p-4 flex justify-between items-center text-sm">
              <span className="text-gray-400">Total Waiting</span>
              <span className="font-bold text-xl">{waiting.length} / 300</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-200 mb-4">Waiting Queue</h2>
            <div className="glass rounded-xl overflow-hidden border-white/5">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white/5 text-gray-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Priority</th>
                    <th className="px-4 py-3 font-medium">Registration</th>
                    <th className="px-4 py-3 font-medium">DOB</th>
                    <th className="px-4 py-3 font-medium">Donation</th>
                    <th className="px-4 py-3 font-medium">Private</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {waiting.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500 italic">Queue is empty</td></tr>
                  ) : waiting.map((u, i) => (
                    <tr key={u.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono text-xs opacity-50">{u.priority_score}</td>
                      <td className="px-4 py-3 font-mono font-medium">{u.registration_number}</td>
                      <td className="px-4 py-3 text-gray-400">{u.birth_date}</td>
                      <td className="px-4 py-3 text-yellow-500">{u.donation_amount > 0 ? `Rp ${u.donation_amount/1000}k` : '-'}</td>
                      <td className="px-4 py-3">{u.is_private ? <span className="text-purple-400 text-xs px-2 py-0.5 bg-purple-500/10 rounded">Yes</span> : '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleAction('skip', u.id)} className="text-gray-500 hover:text-white transition-colors">Skip</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
