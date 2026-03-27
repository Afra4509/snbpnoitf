"use client";

import { useEffect, useState, useRef } from "react";

export default function OverlayPage() {
  const [activeUser, setActiveUser] = useState<any>(null);
  const [show, setShow] = useState(false);
  const prevRegRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchOverlay = async () => {
      try {
        const res = await fetch(`/api/overlay?t=${Date.now()}`, { cache: "no-store" });
        const data = await res.json();
        const user = data.activeUser || null;
        const newReg = user?.registration_number || null;
        const oldReg = prevRegRef.current;

        if (newReg !== oldReg) {
          // User changed — animate out then in
          setShow(false);
          setTimeout(() => {
            setActiveUser(user);
            prevRegRef.current = newReg;
            if (user) setTimeout(() => setShow(true), 60);
          }, 400);
        } else {
          setActiveUser(user);
          if (user && !show) setTimeout(() => setShow(true), 60);
        }
      } catch (err) {}
    };

    fetchOverlay();
    const int = setInterval(fetchOverlay, 3000);
    return () => clearInterval(int);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isVip = activeUser?.donation_amount > 0;
  const displayName = activeUser?.sender_name || activeUser?.registration_number || "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body, html {
          background: #00FF00;
          overflow: hidden;
        }

        .overlay-container {
          position: fixed;
          top: 28px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
        }

        /* ---- Pill ---- */
        .pill {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 8px 28px 8px 8px;
          border-radius: 60px;
          background: #0d0d0d;
          border: 1.5px solid rgba(255,255,255,0.08);
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.6),
            0 12px 40px rgba(0,0,0,0.7),
            0 2px 8px rgba(0,0,0,0.5);
          min-width: 280px;

          /* Transition */
          opacity: 0;
          transform: translateY(-20px) scale(0.92);
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pill.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* VIP variant */
        .pill.vip {
          border-color: rgba(251, 191, 36, 0.25);
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.6),
            0 12px 40px rgba(0,0,0,0.7),
            0 0 30px rgba(251, 191, 36, 0.08);
        }

        /* ---- Avatar ---- */
        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
          background: linear-gradient(145deg, #5b21b6, #7c3aed);
          box-shadow: 0 0 12px rgba(124, 58, 237, 0.35);
        }
        .pill.vip .avatar {
          background: linear-gradient(145deg, #d97706, #f59e0b);
          box-shadow: 0 0 14px rgba(245, 158, 11, 0.4);
        }

        .avatar-icon {
          width: 22px;
          height: 22px;
          fill: none;
          stroke: white;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* Pulse ring */
        .avatar::after {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 1.5px solid rgba(124, 58, 237, 0.4);
          animation: ring-pulse 2s ease-in-out infinite;
        }
        .pill.vip .avatar::after {
          border-color: rgba(251, 191, 36, 0.35);
        }

        @keyframes ring-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.08); opacity: 0; }
        }

        /* ---- Content ---- */
        .content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        /* Badge row */
        .badges {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .badge-live {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 2px 8px 2px 6px;
          border-radius: 20px;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.25);
          font-size: 9px;
          font-weight: 700;
          color: #ef4444;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .live-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #ef4444;
          animation: dot-blink 1.5s ease-in-out infinite;
        }

        @keyframes dot-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .badge-vip {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 2px 8px;
          border-radius: 20px;
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.3);
          font-size: 9px;
          font-weight: 700;
          color: #fbbf24;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* Name */
        .display-name {
          font-size: 19px;
          font-weight: 800;
          color: #f1f5f9;
          line-height: 1.15;
          letter-spacing: -0.01em;
        }
        .pill.vip .display-name {
          background: linear-gradient(90deg, #fde68a, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      <div className="overlay-container">
        {activeUser && (
          <div className={`pill ${show ? 'visible' : ''} ${isVip ? 'vip' : ''}`}>
            {/* Avatar */}
            <div className="avatar">
              {isVip ? (
                <svg className="avatar-icon" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="rgba(255,255,255,0.15)" stroke="white" />
                </svg>
              ) : (
                <svg className="avatar-icon" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </div>

            {/* Content */}
            <div className="content">
              <div className="badges">
                <span className="badge-live">
                  <span className="live-dot" />
                  LIVE
                </span>
                {isVip && (
                  <span className="badge-vip">⚡ VIP</span>
                )}
              </div>
              <span className="display-name">{displayName}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
