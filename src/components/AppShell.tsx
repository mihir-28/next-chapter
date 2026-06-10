"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  BookOpen, 
  Kanban, 
  PlusCircle, 
  LogOut, 
  Sparkles,
  Plus
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";
import InstallToast from "@/components/InstallToast";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, signInWithGoogle, logOut } = useAuth();
  const pathname = usePathname();

  // Navigation config
  const navItems = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Library", href: "/library", icon: BookOpen },
    { name: "Kanban", href: "/kanban", icon: Kanban },
    { name: "Add ARC", href: "/add", icon: PlusCircle },
  ];

  // If auth is loading, show a premium loading experience
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#070b13] text-slate-100">
        <div className="relative w-20 h-20 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-[#0a84ff] animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-sky-500/10 border-b-[#64d2ff] animate-spin duration-1000"></div>
        </div>
        <p className="text-sm tracking-widest text-slate-400 font-sans uppercase animate-pulse">Loading Next Chapter...</p>
      </div>
    );
  }

  // If not logged in, render a stunning login page
  if (!user) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden bg-[#070b13]">
        {/* Glow Orbs in background */}
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#0a84ff]/5 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#64d2ff]/5 blur-[120px] pointer-events-none"></div>
        
        {/* Login Card */}
        <div className="w-full max-w-md p-8 rounded-3xl glass-panel relative z-10 border border-slate-800/60 shadow-2xl flex flex-col items-center">
          {/* Logo */}
          <div className="mb-6 relative group transition-transform duration-500 hover:scale-105 active:scale-95 cursor-pointer">
            <div className="absolute inset-0 bg-linear-to-tr from-[#0a84ff] to-[#64d2ff] rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity z-0"></div>
            <Logo size={72} showBackground={true} className="relative z-10 rounded-3xl border border-white/10 shadow-2xl" />
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 text-center font-sans">
            Next Chapter
          </h1>
          <p className="text-slate-400 text-sm text-center mb-8 font-body max-w-xs">
            Reviewer&apos;s personal dashboard for Advance Reader Copies (ARCs).
          </p>

          {/* Quick value proposition */}
          <div className="w-full space-y-4 mb-8">
            <div className="flex items-start space-x-3 text-slate-300">
              <Sparkles className="w-5 h-5 text-[#0a84ff] shrink-0 mt-0.5" />
              <div className="text-sm font-body">
                <span className="font-semibold text-slate-100">Never Miss a Review:</span> Track deadlines with automatic color-coded urgency indicators.
              </div>
            </div>
            <div className="flex items-start space-x-3 text-slate-300">
              <Sparkles className="w-5 h-5 text-[#64d2ff] shrink-0 mt-0.5" />
              <div className="text-sm font-body">
                <span className="font-semibold text-slate-100">Reading Pipeline:</span> Manage progress with our drag-and-drop Kanban board.
              </div>
            </div>
          </div>

          <button
            onClick={signInWithGoogle}
            className="w-full py-4.5 px-6 rounded-2xl bg-white hover:bg-slate-100 active:scale-[0.98] transition-all text-slate-900 font-semibold text-base flex items-center justify-center space-x-3 shadow-lg cursor-pointer"
          >
            {/* Google Icon SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.68 1.41 7.59l3.85 2.99C6.22 7.15 8.89 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.44c-.28 1.47-1.11 2.72-2.36 3.56l3.66 2.84c2.14-1.98 3.39-4.89 3.39-8.51z"
              />
              <path
                fill="#FBBC05"
                d="M5.26 14.77c-.25-.75-.39-1.56-.39-2.4 0-.84.14-1.65.39-2.4L1.41 6.98C.51 8.79 0 10.82 0 12.98c0 2.16.51 4.19 1.41 6l3.85-2.99c-.25-.49-.39-1.28-.39-2.23z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-3.9 1.09-3.11 0-5.78-2.11-6.73-5.54l-3.85 2.99C3.37 20.32 7.35 23 12 23z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
          
          <p className="text-slate-500 text-xs mt-6 text-center">
            PWA enabled. Installable directly on mobile and desktop.
          </p>
        </div>
        <InstallToast />
      </div>
    );
  }

  // If logged in, render app shell
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-slate-200 font-body relative overflow-hidden">
      {/* Background extension / Ambient liquid colors */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-white/2 blur-[130px]"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-slate-500/2 blur-[140px]"></div>
        <div className="absolute top-[35%] right-[15%] w-[40vw] h-[40vw] rounded-full bg-zinc-600/1 blur-[120px]"></div>
      </div>
      
      {/* Sidebar for Desktop / Tablet */}
      <aside className="hidden md:flex md:w-64 flex-col fixed top-6 bottom-6 left-6 glass-nav border border-white/5 rounded-3xl p-6 z-30 shadow-2xl shadow-black/45">
        {/* Header Logo */}
        <div className="flex items-center space-x-3 mb-10 mt-2 group cursor-pointer">
            <Logo size={36} showBackground={true} className="rounded-xl border border-white/5 shadow-md shrink-0" />
          <span className="text-xl font-bold tracking-tight text-white font-sans bg-clip-text bg-linear-to-r from-white via-slate-100 to-sky-200">Next Chapter</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1.5 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer font-bold text-sm group z-10 ${
                  isActive 
                    ? "text-white" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeDesktopTab"
                    className="absolute inset-0 bg-white/15 border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_2px_rgba(0,0,0,0.15)] rounded-xl -z-10 backdrop-blur-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? "text-[#0a84ff]" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile Card / Log Out */}
        <div className="border-t border-slate-800/40 pt-5 mt-auto flex flex-col gap-4">
          <div className="flex items-center space-x-3 px-2">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className="w-9 h-9 rounded-full ring-2 ring-blue-500/20"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-semibold uppercase">
                {user.displayName?.charAt(0) || "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user.displayName || "Active Reviewer"}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          
          <button
            onClick={logOut}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/10 border border-transparent hover:border-rose-900/20 transition-all text-sm font-medium cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:pl-76">
        {/* Header for Mobile only (hidden on Desktop) */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-white/5 glass-nav sticky top-0 z-40">
          <div className="flex items-center space-x-2.5">
            <Logo size={28} showBackground={true} className="rounded-lg border border-white/5 shadow-sm shrink-0" />
            <span className="text-lg font-bold tracking-tight text-white font-sans bg-clip-text bg-linear-to-r from-white via-slate-100 to-sky-200">Next Chapter</span>
          </div>
          <div className="flex items-center bg-slate-900/60 border border-white/5 rounded-full px-2.5 py-1.5 gap-2 shadow-sm">
            <Link 
              href="/add" 
              title="Track New ARC" 
              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5" />
            </Link>
            <div className="w-px h-3.5 bg-white/10"></div>
            <button 
              onClick={logOut} 
              title="Sign Out" 
              className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        {/* Pages injection */}
        <main className="flex-1 p-5 md:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Floating Navigation Dock for Mobile Devices (visionOS style) */}
      <div className="md:hidden fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-full glass-nav shadow-2xl border border-white/10 max-w-sm w-full justify-between pointer-events-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive 
                    ? "text-white font-bold" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {/* Active background capsule with spring motion */}
                {isActive && (
                  <motion.div
                    layoutId="activeMobileTab"
                    className="absolute inset-0 bg-white/15 border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_2px_rgba(0,0,0,0.15)] rounded-full backdrop-blur-sm"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", stiffness: 350, damping: 26 }}
                  />
                )}
                <Icon className="w-5.5 h-5.5" />
                <span className="text-[8px] mt-0.5 font-bold uppercase tracking-wider scale-90">{item.name.replace("Dashboard", "Home").replace("Add ARC", "New")}</span>
              </Link>
            );
          })}
        </div>
      </div>
      <InstallToast />
    </div>
  );
}
