"use client";

import React, { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import Logo from "./Logo";
import { Share2, Download } from "lucide-react";

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 days

export default function InstallToast() {
  const [promptEvent, setPromptEvent] = useState<any>(null);
  const toastRef = useRef<string | number | null>(null);

  // Helper check for standalone display mode
  const isStandalone = () => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    );
  };

  // Helper check for recently dismissed prompt
  const checkDismissed = () => {
    if (typeof window === "undefined") return true;
    const dismissedTime = window.localStorage.getItem(DISMISS_KEY);
    if (!dismissedTime) return false;
    return Date.now() - parseInt(dismissedTime, 10) < DISMISS_DURATION;
  };

  const setDismissed = () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  // Helper check for iOS
  const isIOS = () => {
    if (typeof window === "undefined") return false;
    const ua = window.navigator.userAgent;
    const isIPad = !!ua.match(/iPad/i);
    const isIPhone = !!ua.match(/iPhone/i);
    const isMacTouch = window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
    return isIPad || isIPhone || isMacTouch;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    if (checkDismissed()) return;

    // Handle Chromium PWA Install event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e);
      
      // Delay showing toast by 3 seconds for better UX
      const timer = setTimeout(() => {
        showInstallToast(e);
      }, 3000);

      return () => clearTimeout(timer);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Handle app installed event
    const handleAppInstalled = () => {
      if (toastRef.current) {
        toast.dismiss(toastRef.current);
        toastRef.current = null;
      }
      setPromptEvent(null);
    };
    
    window.addEventListener("appinstalled", handleAppInstalled);

    // iOS Specific Logic (as beforeinstallprompt won't trigger)
    if (isIOS()) {
      const iosTimer = setTimeout(() => {
        showIosToast();
      }, 5000); // Wait 5 seconds to show iOS manual prompt

      return () => {
        clearTimeout(iosTimer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const showIosToast = () => {
    if (toastRef.current) return;

    toastRef.current = toast.custom((t) => (
      <div className="w-full max-w-sm glass-panel border border-white/10 shadow-2xl p-4 flex gap-3 text-left relative overflow-hidden bg-[#0e121d]/95 backdrop-blur-md">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-[#0a84ff]/10 blur-xl pointer-events-none"></div>
        
        <Logo size={42} showBackground={true} className="rounded-xl border border-white/5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white font-sans">
            Add to Home Screen
          </h4>
          <p className="text-xs text-slate-400 font-body mt-1 leading-relaxed">
            Tap the <span className="inline-flex items-center justify-center p-1 bg-white/10 rounded-md text-sky-400 mx-0.5"><Share2 className="w-3 h-3" /></span> share button in Safari, then select <strong>Add to Home Screen</strong>.
          </p>
          <div className="flex gap-2.5 mt-3 justify-end">
            <button
              onClick={() => {
                setDismissed();
                toast.dismiss(t);
                toastRef.current = null;
              }}
              className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
            <button
              onClick={() => {
                toast.dismiss(t);
                toastRef.current = null;
              }}
              className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-[11px] font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: "top-right",
    });
  };

  const showInstallToast = (event: any) => {
    if (toastRef.current) return;

    toastRef.current = toast.custom((t) => (
      <div className="w-full max-w-sm glass-panel border border-white/10 shadow-2xl p-4 flex gap-3 text-left relative overflow-hidden bg-[#0e121d]/95 backdrop-blur-md">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-[#0a84ff]/10 blur-xl pointer-events-none"></div>
        
        <Logo size={42} showBackground={true} className="rounded-xl border border-white/5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white font-sans">
            Install Next Chapter
          </h4>
          <p className="text-xs text-slate-400 font-body mt-1 leading-relaxed">
            Install our app for quick access, offline reading tracking, and a native experience.
          </p>
          <div className="flex gap-2.5 mt-3 justify-end">
            <button
              onClick={() => {
                setDismissed();
                toast.dismiss(t);
                toastRef.current = null;
              }}
              className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
            <button
              onClick={async () => {
                if (!event) return;
                event.prompt();
                const { outcome } = await event.userChoice;
                console.log(`Install choice: ${outcome}`);
                toast.dismiss(t);
                toastRef.current = null;
              }}
              className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-[11px] font-bold transition-all shadow-md active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Install</span>
            </button>
          </div>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: "top-right",
    });
  };

  return null;
}
