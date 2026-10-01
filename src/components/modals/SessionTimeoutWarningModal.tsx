import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Clock, LogOut, RefreshCw } from 'lucide-react';

// 3 minutes inactivity threshold as requested
const INACTIVITY_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes = 180,000 ms
const WARNING_WINDOW_MS = 30 * 1000; // 30 seconds countdown warning modal
const ACTIVITY_STORAGE_KEY = 'shh_last_activity';

export const SessionTimeoutWarningModal: React.FC = () => {
  const { currentUser, logout } = useApp();
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const lastActivityRef = useRef<number>(Date.now());
  const throttleRef = useRef<number>(0);

  const resetActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    try {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, String(now));
    } catch {
      // Ignore localStorage access restrictions
    }
    setShowWarning(false);
  }, []);

  // Monitor user events for activity across all authenticated views
  useEffect(() => {
    // Only track inactivity when user is actively logged in
    if (!currentUser) {
      setShowWarning(false);
      return;
    }

    // Initialize with current time or sync from shared storage
    const now = Date.now();
    let initialTimestamp = now;
    try {
      const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
      if (stored) {
        const parsed = Number(stored);
        if (!isNaN(parsed) && parsed <= now && now - parsed < INACTIVITY_TIMEOUT_MS) {
          initialTimestamp = parsed;
        } else {
          localStorage.setItem(ACTIVITY_STORAGE_KEY, String(now));
        }
      } else {
        localStorage.setItem(ACTIVITY_STORAGE_KEY, String(now));
      }
    } catch {
      // Ignore
    }
    lastActivityRef.current = initialTimestamp;

    const handleUserActivity = () => {
      const currentTime = Date.now();
      // Throttle event handling to at most once every 500ms
      if (currentTime - throttleRef.current > 500) {
        throttleRef.current = currentTime;
        lastActivityRef.current = currentTime;
        try {
          localStorage.setItem(ACTIVITY_STORAGE_KEY, String(currentTime));
        } catch {
          // Ignore
        }
        setShowWarning(false);
      }
    };

    const activityEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'keyup',
      'touchstart',
      'touchmove',
      'scroll',
      'wheel',
      'click',
      'pointerdown'
    ];

    activityEvents.forEach(eventType => {
      window.addEventListener(eventType, handleUserActivity, { passive: true });
    });

    const checkTimeout = () => {
      let lastActive = lastActivityRef.current;
      try {
        const saved = localStorage.getItem(ACTIVITY_STORAGE_KEY);
        if (saved) {
          const parsed = Number(saved);
          if (!isNaN(parsed) && parsed > lastActive) {
            lastActive = parsed;
            lastActivityRef.current = parsed;
          }
        }
      } catch {
        // Ignore
      }

      const elapsed = Date.now() - lastActive;
      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        setShowWarning(false);
        logout('login', 'Session Expired: You were automatically signed out due to 3 minutes of inactivity for your security.');
        return true;
      }
      return false;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkTimeout();
      }
    };

    const handleWindowFocus = () => {
      checkTimeout();
    };

    // Synchronize user activity and session changes across browser tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ACTIVITY_STORAGE_KEY && e.newValue) {
        const foreignTime = Number(e.newValue);
        if (!isNaN(foreignTime) && foreignTime > lastActivityRef.current) {
          lastActivityRef.current = foreignTime;
          setShowWarning(false);
        }
      } else if (e.key === 'shh_current_user' && !e.newValue) {
        setShowWarning(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    // Heartbeat check every 1 second
    const interval = setInterval(() => {
      let lastActive = lastActivityRef.current;
      try {
        const saved = localStorage.getItem(ACTIVITY_STORAGE_KEY);
        if (saved) {
          const parsed = Number(saved);
          if (!isNaN(parsed) && parsed > lastActive) {
            lastActive = parsed;
            lastActivityRef.current = parsed;
          }
        }
      } catch {
        // Ignore
      }

      const elapsed = Date.now() - lastActive;
      const remainingMs = INACTIVITY_TIMEOUT_MS - elapsed;

      if (remainingMs <= 0) {
        setShowWarning(false);
        logout('login', 'Session Expired: You were automatically signed out due to 3 minutes of inactivity for your security.');
      } else if (remainingMs <= WARNING_WINDOW_MS) {
        setShowWarning(true);
        setSecondsRemaining(Math.max(1, Math.ceil(remainingMs / 1000)));
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      activityEvents.forEach(eventType => {
        window.removeEventListener(eventType, handleUserActivity);
      });
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(interval);
    };
  }, [currentUser, logout]);

  if (!showWarning || !currentUser) {
    return null;
  }

  const progressPercent = Math.max(0, Math.min(100, (secondsRemaining / 30) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
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
            Your session has been idle. For healthcare data privacy and security compliance, active users are automatically signed out after 3 minutes of inactivity. You will be signed out in:
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
            onClick={() => logout('login', 'You signed out from your session.')}
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
