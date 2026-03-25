"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";

export default function OverlayPage() {
  const [activeUser, setActiveUser] = useState<any>(null);

  useEffect(() => {
    const fetchOverlay = async () => {
      try {
        const res = await fetch(`/api/overlay?t=${Date.now()}`, { cache: "no-store" });
        const data = await res.json();
        setActiveUser(data.activeUser || null);
      } catch (err) {}
    };

    fetchOverlay();
    const int = setInterval(fetchOverlay, 3000);
    return () => clearInterval(int);
  }, []);

  if (!activeUser) return null; // Transparent in OBS when no user

  return (
    <main className="w-screen h-screen bg-transparent overflow-hidden font-sans">
      <div className="absolute top-12 left-1/2 -translate-x-1/2 flex justify-center w-full max-w-2xl px-8 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-700 ease-out">
        
        {/* Dynamic Island Style Container - Lightweight for OBS */}
        <div className="relative rounded-full bg-[#0a0a0a] border border-white/10 shadow-2xl flex items-center p-2.5 gap-5 overflow-hidden pr-10 min-w-[320px]">
          
          {/* Subtle static gradient background instead of heavy blur */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-emerald-900/40 opacity-50 pointer-events-none"></div>

          {/* Profile/Avatar Circle */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center shrink-0 shadow-inner relative z-10 border border-white/10">
            <User className="w-6 h-6 text-white" />
            {/* Pulsing ring around avatar - lightweight CSS scale/fade */}
            <div className="absolute inset-[-4px] rounded-full border border-white/20 animate-pulse pointer-events-none opacity-50"></div>
          </div>
          
          {/* Details Section */}
          <div className="flex flex-col z-10 justify-center">
            <div className="flex items-center gap-2.5 mb-0.5">
              <span className="flex items-center gap-1.5 px-2 py-[2px] bg-red-950/50 border border-red-500/30 text-red-500 text-[9px] font-bold uppercase tracking-[0.1em] rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                Live Now
              </span>
              {activeUser.donation_amount > 0 && (
                <span className="flex items-center gap-1.5 px-2 py-[2px] bg-amber-950/50 border border-amber-500/30 text-amber-500 text-[9px] font-bold uppercase tracking-[0.1em] rounded-full">
                  ★ VIP
                </span>
              )}
            </div>
            
            <h1 className="text-xl font-semibold text-white tracking-tight leading-tight">
              {activeUser.registration_number}
            </h1>
          </div>
          
        </div>
      </div>
    </main>
  );
}
