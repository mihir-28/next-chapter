"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Home,
    BookOpen,
    Kanban,
    PlusCircle,
    Plus,
    LogOut,
    ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";
import InstallToast from "@/components/InstallToast";

function GoogleMark({ className = "w-5 h-5" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
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
    );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { user, loading, signInWithGoogle, logOut } = useAuth();
    const pathname = usePathname();
    const activeIndex = ["/", "/library", "/kanban", "/add"].indexOf(pathname);

    // Reset scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

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
                    <div className="absolute inset-0 rounded-full border-4 border-[#5b1b9e]/20 border-t-[#7c3aed] animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-4 border-[#e5b842]/15 border-b-[#fbdf93] animate-spin duration-1000"></div>
                </div>
                <p className="text-sm tracking-widest text-slate-400 font-sans uppercase animate-pulse">
                    Loading Next Chapter...
                </p>
            </div>
        );
    }

    // If not logged in, render a focused sign-in experience
    if (!user) {
        return (
            <div className="relative flex h-dvh overflow-hidden bg-[#070b13] px-6 py-8 text-slate-100 sm:px-8">
                <div className="absolute inset-0 bg-linear-to-b from-[#0b1624] via-[#070b13] to-[#04070d] pointer-events-none"></div>

                <main className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col justify-between gap-8 md:grid md:grid-cols-[1fr_340px] md:items-center md:justify-normal lg:grid-cols-[1fr_390px]">
                    <section className="flex flex-col items-center pt-10 text-center md:max-w-xl md:items-start md:pt-0 md:text-left">
                        <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-5xl lg:text-6xl">
                            Your next review, already organized.
                        </h1>
                        <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
                            Sign in once and jump straight back to deadlines,
                            reading status, and your ARC library.
                        </p>
                    </section>

                    <section className="flex w-full flex-col items-center pb-4 md:pb-0">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 rounded-[28px] bg-[#0a84ff]/35 blur-2xl"></div>
                            <Logo
                                size={78}
                                showBackground={true}
                                className="relative rounded-3xl border border-white/10 shadow-2xl"
                            />
                        </div>

                        <h2 className="text-center text-3xl font-extrabold tracking-tight text-white">
                            Next Chapter
                        </h2>
                        <p className="mt-3 max-w-60 text-center text-sm leading-6 text-slate-400">
                            Track your ARC reading queue.
                        </p>

                        <button
                            onClick={signInWithGoogle}
                            className="mt-9 flex h-14 w-full max-w-sm items-center justify-between rounded-full bg-white px-5 text-base font-bold text-slate-950 shadow-lg shadow-black/30 transition-all hover:bg-slate-100 active:scale-[0.98] cursor-pointer"
                        >
                            <span className="flex items-center gap-3">
                                <GoogleMark />
                                Continue
                            </span>
                            <ChevronRight className="h-5 w-5 text-slate-500" />
                        </button>

                        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
                            Google handles account selection securely.
                        </p>
                    </section>
                </main>
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
                    <Logo
                        size={36}
                        showBackground={true}
                        className="rounded-xl border border-white/5 shadow-md shrink-0"
                    />
                    <span className="text-xl font-bold tracking-tight text-white font-sans bg-clip-text bg-linear-to-r from-white via-slate-100 to-sky-200">
                        Next Chapter
                    </span>
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
                                        transition={{
                                            type: "spring",
                                            stiffness: 380,
                                            damping: 30,
                                        }}
                                    />
                                )}
                                <Icon
                                    className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? "text-[#0a84ff]" : "text-slate-400"}`}
                                />
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
                            <p className="text-xs font-semibold text-slate-200 truncate">
                                {user.displayName || "Active Reviewer"}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                                {user.email}
                            </p>
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
                <header className="md:hidden flex items-center justify-between px-6 py-4 sticky top-0 z-40">
                    <div className="flex items-center space-x-2.5">
                        <Logo
                            size={38}
                            showBackground={true}
                            className="rounded-full border border-white/5 shadow-sm shrink-0"
                        />
                        <span className="text-lg font-bold tracking-tight text-white font-sans bg-clip-text bg-linear-to-r from-white via-slate-100 to-sky-200">
                            Next Chapter
                        </span>
                    </div>
                    <div className="flex items-center bg-slate-900/60 border border-white/5 rounded-full px-1.5 py-1.5 gap-2 shadow-sm">
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
                <main className="flex-1 px-7 py-5 md:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>

            {/* Floating Navigation Dock for Mobile Devices (visionOS style) */}
            <div className="md:hidden fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
                <div 
                    className="relative flex items-center gap-3.5 max-w-sm w-full pointer-events-auto h-16"
                    style={{ containerType: "inline-size" }}
                >
                    {/* Glass Panel Background for Main Navigation Pill */}
                    <div className="absolute left-0 top-0 bottom-0 w-[calc(100%-78px)] glass-panel backdrop-blur-sm shadow-2xl border border-white/10 rounded-full! pointer-events-none" style={{ zIndex: 0 }} />

                    {/* Glass Panel Background for Solo Add Button */}
                    <div className="absolute right-0 top-0 bottom-0 w-16 glass-panel backdrop-blur-sm shadow-2xl border border-white/10 rounded-full! pointer-events-none" style={{ zIndex: 0 }} />

                    {/* Active background capsule with GPU-accelerated translate3d */}
                    {activeIndex !== -1 && (
                        <div
                            className="absolute bg-white/15 border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_2px_rgba(0,0,0,0.15)] rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[transform,width,height] pointer-events-none"
                            style={{
                                zIndex: 1,
                                height: "48px",
                                width: activeIndex === 3 ? "48px" : "calc((100cqw - 114px) / 3)",
                                top: "8px",
                                transform: activeIndex === 3
                                    ? "translate3d(calc(100cqw - 56px), 0, 0)"
                                    : `translate3d(calc(12px + ${activeIndex} * (100cqw - 114px) / 3 + ${activeIndex} * 6px), 0, 0)`,
                            }}
                        />
                    )}

                    {/* Main Navigation Pill Content Wrapper */}
                    <div className="relative flex-1 flex items-center gap-1.5 px-3 py-2 rounded-full! justify-between" style={{ zIndex: 2 }}>
                        {navItems
                            .filter((item) => item.href !== "/add")
                            .map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                 // Color mapping for icons (Dashboard: Rose/Pink, Library: Sky Blue, Kanban: Emerald)
                                 let iconColor = "text-slate-400";
                                 if (item.name === "Dashboard") {
                                     iconColor = isActive ? "text-[#f472b6]" : "text-[#f472b6]/50";
                                 } else if (item.name === "Library") {
                                     iconColor = isActive ? "text-[#64d2ff]" : "text-[#64d2ff]/50";
                                 } else if (item.name === "Kanban") {
                                     iconColor = isActive ? "text-[#34d399]" : "text-[#34d399]/50";
                                 }

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-full transition-all duration-300 cursor-pointer ${
                                            isActive
                                                ? "text-[#fbdf93] font-bold"
                                                : "text-[#fbdf93]/50 hover:text-[#fbdf93]/80"
                                        }`}
                                        style={isActive ? { textShadow: "0 0 8px rgba(251, 223, 147, 0.25)" } : undefined}
                                    >
                                        <Icon className={`w-5.5 h-5.5 transition-all duration-300 ${iconColor} ${isActive ? "scale-110 drop-shadow-[0_0_6px_rgba(251,223,147,0.15)]" : "scale-100"}`} />
                                        <span className="text-[8px] mt-0.5 font-bold uppercase tracking-wider scale-90">
                                            {item.name.replace("Dashboard", "Home")}
                                        </span>
                                    </Link>
                                );
                            })}
                    </div>

                    {/* Solo Add Button Content Wrapper */}
                    <div className="relative w-16 h-16 flex items-center justify-center shrink-0" style={{ zIndex: 2 }}>
                        <Link
                            href="/add"
                            className="relative w-full h-full rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer"
                            title="Add ARC"
                        >
                            <Plus 
                                className={`w-6 h-6 transition-all duration-300 text-[#b58dfa] ${
                                    pathname === "/add" 
                                        ? "scale-110 drop-shadow-[0_0_6px_rgba(181,141,250,0.2)]" 
                                        : "opacity-55 hover:opacity-85"
                                }`} 
                                style={{ strokeWidth: 2.5 }}
                            />
                        </Link>
                    </div>
                </div>
            </div>
            <InstallToast />
        </div>
    );
}
