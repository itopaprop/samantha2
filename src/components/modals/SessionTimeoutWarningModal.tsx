import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Clock, LogOut, RefreshCw } from 'lucide-react';

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes = 300,000 ms
const WARNING_WINDOW_MS = 30 * 1000; // 30 seconds warning modal

export const SessionTimeoutWarningModal: React.FC = () => {
  const { currentUser, currentPage, logout } = useApp();
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const lastActivityRef = useRef<number>(Date.now());
  const throttleRef = useRef<number>(0);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
    }
  }, [showWarning]);

  // Monitor user events for activity
  useEffect(() => {
    // Only track inactivity when user is logged in and actively on the dashboard
    if (!currentUser || currentPage !== 'dashboard') {
      setShowWarning(false);
      return;
    }

    lastActivityRef.current = Date.now();

    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle event handling to at most once every 500ms
      if (now - throttleRef.current > 500) {
        throttleRef.current = now;
        lastActivityRef.current = now;
        setShowWarning(prev => {
          if (prev) return false;
          return false;
        });
      }
    };

    const activityEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'wheel',
      'click',
      'pointerdown'
    ];

    activityEvents.forEach(eventType => {
      window.addEventListener(eventType, handleUserActivity, { passive: true });
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const elapsed = Date.now() - lastActivityRef.current;
        if (elapsed >= INACTIVITY_TIMEOUT_MS) {
          logout('login', 'Session Expired: You were automatically logged out due to 5 minutes of inactivity for your security.');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Heartbeat check every 1 second
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remainingMs = INACTIVITY_TIMEOUT_MS - elapsed;

      if (remainingMs <= 0) {
        setShowWarning(false);
        logout('login', 'Session Expired: You were automatically logged out due to 5 minutes of inactivity for your security.');
      } else if (remainingMs <= WARNING_WINDOW_MS) {
        setShowWarning(true);
        setSecondsRemaining(Math.ceil(remainingMs / 1000));
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      activityEvents.forEach(eventType => {
        window.removeEventListener(eventType, handleUserActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [currentUser, currentPage, logout]);

  if (!showWarning || !currentUser || currentPage !== 'dashboard') {
    return null;
  }

  const progressPercent = Math.max(0, Math.min(100, (secondsRemaining / 30) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-amber-200 text-center space-y-6 animate-in zoom-in-95 duration-200"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="timeout-dialog-title"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200/70 relative shadow-inner">
          <ShieldAlert className="w-8 h-8" />
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
          </span>
        </div>

        <div className="space-y-2">
          <h3 id="timeout-dialog-title" className="text-xl font-extrabold text-slate-900 tracking-tight">
            Session Inactivity Warning
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            Your dashboard session has been idle. For healthcare data privacy and compliance, you will be automatically signed out in:
          </p>
        </div>

        {/* Countdown display */}
        <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200/80 space-y-2.5">
          <div className="flex items-center justify-center gap-2 text-amber-900 font-extrabold text-2xl">
            <Clock className="w-6 h-6 text-amber-600 animate-pulse" />
            <span>{secondsRemaining} <span className="text-xs font-bold text-amber-700 tracking-normal uppercase">seconds</span></span>
          </div>

          <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={resetActivity}
            className="w-full py-3 px-4 bg-sky-700 hover:bg-sky-800 active:bg-sky-900 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Stay Signed In</span>
          </button>
          
          <button
            onClick={() => logout('login', 'You signed out from your dashboard session.')}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer order-2 sm:order-1"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>Log Out Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
