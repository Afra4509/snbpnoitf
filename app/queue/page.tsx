"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Clock, Trophy, Users } from "lucide-react";

export default function QueueStatusPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("queue_user_id");
    if (!userId) {
      router.push("/");
      return;
    }

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/status?userId=${userId}`);
        const json = await res.json();
        
        if (!res.ok) throw new Error(json.error);
        setData(json);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchStatus();
    // Poll every 3 seconds
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [router]);

  if (!data && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020817]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { user, position, estimated_wait_time, activeUser } = data || {};

  const formatWaitTime = (seconds: number) => {
    if (!seconds) return "Checking...";
    if (seconds < 60) return `${seconds} secs`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-[#020817] flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6 animate-in fade-in duration-700">
        
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl tracking-tight font-bold mb-2">Live Queue Status</h1>
          <p className="text-gray-400">Your registration: <span className="text-white font-mono">{user?.registration_number}</span></p>
        </div>

        {user?.status === "completed" ? (
          <div className="glass-card p-8 text-center border-emerald-500/20 bg-emerald-500/5">
            <Trophy className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-emerald-400 mb-2">You're All Done!</h2>
            <p className="text-emerald-200/70">Your process has been completed successfully.</p>
          </div>
        ) : user?.status === "active" ? (
          <div className="glass-card p-8 text-center relative overflow-hidden ring-2 ring-blue-500 ring-offset-2 ring-offset-[#020817] shadow-[0_0_40px_rgba(59,130,246,0.3)]">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 animate-pulse"></div>
            <Activity className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold text-white mb-2 relative z-10">It's Your Turn!</h2>
            <p className="text-blue-200 relative z-10">Pay attention to the livestream.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Position Card */}
            <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-gray-400 text-sm font-medium mb-1">Queue Position</p>
              <h3 className="text-5xl font-bold text-white tabular-nums tracking-tighter">
                {position ? `#${position}` : "-"}
              </h3>
            </div>
            
            {/* Wait Card */}
            <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-gray-400 text-sm font-medium mb-1">Estimated Wait</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">
                {formatWaitTime(estimated_wait_time)}
              </h3>
            </div>
          </div>
        )}

        {/* Current Active User display on stream */}
        <div className="mt-8">
          <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 px-2">Currently on stream</h4>
          <div className="glass p-4 rounded-xl flex items-center justify-between opacity-80">
            {activeUser ? (
              <>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Reg No</span>
                  <span className="font-mono text-lg font-bold text-white">
                    {activeUser.is_private ? "HIDDEN (Private)" : activeUser.registration_number}
                  </span>
                </div>
                <div className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
              </>
            ) : (
              <p className="text-gray-500 w-full text-center py-2 text-sm italic">No active user currently</p>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
