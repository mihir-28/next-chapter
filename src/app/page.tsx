"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  ChevronRight, 
  Plus,
  Layers
} from "lucide-react";
import { useDatabase } from "@/context/DatabaseContext";
import { useAuth } from "@/context/AuthContext";
import { getDaysRemaining, getUrgencyInfo } from "@/lib/dateUtils";
import BookCover from "@/components/BookCover";
import Logo from "@/components/Logo";

export default function DashboardPage() {
  const { arcs, loading } = useDatabase();
  const { user } = useAuth();
  const router = useRouter();

  // Loading skeleton screen
  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-slate-800/50 rounded-xl w-1/3"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-32 bg-slate-800/40 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 bg-slate-800/50 rounded-lg w-1/4"></div>
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-24 bg-slate-800/30 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-slate-800/30 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalActive = arcs.filter(
    (a) => a.readingStatus !== "DNF" && a.reviewStatus !== "Published"
  ).length;

  const readingCount = arcs.filter(
    (a) => a.readingStatus === "Currently Reading"
  ).length;

  const reviewsPendingCount = arcs.filter(
    (a) => a.readingStatus === "Finished" && a.reviewStatus !== "Published"
  ).length;

  const overdueCount = arcs.filter(
    (a) => getDaysRemaining(a.deadline) < 0 && a.reviewStatus !== "Published"
  ).length;

  // Deadline summaries (excluding published)
  const dueThisWeek = arcs.filter((a) => {
    const days = getDaysRemaining(a.deadline);
    return days >= 0 && days <= 7 && a.reviewStatus !== "Published";
  }).length;

  const dueThisMonth = arcs.filter((a) => {
    const days = getDaysRemaining(a.deadline);
    return days >= 0 && days <= 30 && a.reviewStatus !== "Published";
  }).length;

  // Next 5 upcoming review deadlines (sorted by urgency, excluding published)
  const upcomingARCs = arcs
    .filter((a) => a.reviewStatus !== "Published")
    .map((a) => ({
      ...a,
      daysLeft: getDaysRemaining(a.deadline),
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5);

  // Greeting based on time of day
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  };

  const todayDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      <title>Dashboard | Next Chapter ARC Tracker</title>
      <meta name="description" content="Manage your Advance Reader Copies, track review deadlines, and monitor your reading progress." />
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans sm:text-4xl">
            {getGreeting()}, {user?.displayName?.split(" ")[0] || "Reader"}!
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-body">
            Here is your review pipeline summary for {todayDateFormatted}.
          </p>
        </div>
        <Link
          href="/add"
          className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-[#0a84ff] hover:bg-[#0071e3] active:scale-[0.98] transition-all text-white font-semibold text-sm shadow-lg shadow-blue-500/10 cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add New ARC</span>
        </Link>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active */}
        <div className="p-5 rounded-3xl glass-card border border-slate-800/30 hover:border-blue-500/20 flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-[0_0_25px_0_rgba(10,132,255,0.06)]">
          <div className="absolute top-0 right-0 p-3 text-slate-655 group-hover:text-blue-500/35 transition-colors">
            <BookOpen className="w-7 h-7" />
          </div>
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Active ARCs</span>
          <span className="text-3xl font-extrabold text-white font-sans mt-2">{totalActive}</span>
        </div>

        {/* Currently Reading */}
        <div className="p-5 rounded-3xl glass-card border border-slate-800/30 hover:border-sky-500/20 flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-[0_0_25px_0_rgba(100,210,255,0.06)]">
          <div className="absolute top-0 right-0 p-3 text-slate-655 group-hover:text-sky-500/35 transition-colors">
            <Clock className="w-7 h-7" />
          </div>
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Reading Now</span>
          <span className="text-3xl font-extrabold text-white font-sans mt-2">{readingCount}</span>
        </div>

        {/* Reviews Pending */}
        <div className="p-5 rounded-3xl glass-card border border-slate-800/30 hover:border-emerald-500/20 flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-[0_0_25px_0_rgba(16,185,129,0.06)]">
          <div className="absolute top-0 right-0 p-3 text-slate-655 group-hover:text-emerald-500/35 transition-colors">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Reviews Pending</span>
          <span className="text-3xl font-extrabold text-white font-sans mt-2">{reviewsPendingCount}</span>
        </div>

        {/* Overdue Books */}
        <div className="p-5 rounded-3xl glass-card border border-rose-900/15 bg-rose-950/5 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-rose-500/30 hover:shadow-[0_0_25px_0_rgba(244,63,94,0.08)]">
          <div className="absolute top-0 right-0 p-3 text-rose-500/25 group-hover:text-rose-500/40 transition-colors">
            <AlertCircle className="w-7 h-7" />
          </div>
          <span className="text-rose-400/80 text-[10px] font-bold uppercase tracking-wider">Overdue</span>
          <span className="text-3xl font-extrabold text-rose-400 font-sans mt-2">{overdueCount}</span>
        </div>
      </div>

      {/* Deadline Summary Block */}
      <div className="p-6 rounded-3xl glass-panel border border-white/5">
        <h2 className="text-sm font-bold text-slate-350 font-sans mb-4 flex items-center space-x-2">
          <Calendar className="w-4.5 h-4.5 text-blue-400" />
          <span className="uppercase tracking-wider">Deadline Status Matrix</span>
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-950/30 border border-white/5 text-left relative overflow-hidden group flex flex-col justify-between h-28">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Overdue</p>
            <p className="text-2xl font-extrabold text-rose-400">{overdueCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/30 border border-white/5 text-left relative overflow-hidden group flex flex-col justify-between h-28">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Due This Week</p>
            <p className="text-2xl font-extrabold text-amber-400">{dueThisWeek}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/30 border border-white/5 text-left relative overflow-hidden group flex flex-col justify-between h-28">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Due This Month</p>
            <p className="text-2xl font-extrabold text-blue-400">{dueThisMonth}</p>
          </div>
        </div>
      </div>

      {/* Main Split Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Upcoming Deadlines */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white font-sans">
              Upcoming Deadlines
            </h2>
            <Link 
              href="/library" 
              className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center space-x-1"
            >
              <span>View Library</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {upcomingARCs.length === 0 ? (
            /* Empty State Container */
            <div className="p-8 rounded-2xl glass-panel border border-white/5 text-center flex flex-col items-center py-12 relative overflow-hidden">
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#0a84ff]/5 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#64d2ff]/5 rounded-full blur-2xl"></div>
              <Logo size={64} className="mb-4 rounded-2xl shadow-lg border border-white/5" />
              <h3 className="text-lg font-bold text-white font-sans mb-1">Your Shelf is Empty</h3>
              <p className="text-slate-400 text-sm max-w-sm mb-6 font-body">
                Add your first Advance Reader Copy to start tracking reading progress and deadlines.
              </p>
              <Link
                href="/add"
                className="py-3 px-6 rounded-xl bg-[#0a84ff] hover:bg-[#0071e3] active:scale-[0.98] transition-all text-white font-semibold text-sm shadow-md cursor-pointer"
              >
                Create ARC Entry
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingARCs.map((arc) => {
                const isFinishedOrSubmitted = arc.readingStatus === "Finished" || arc.reviewStatus === "Submitted";
                const urgency = getUrgencyInfo(arc.deadline, isFinishedOrSubmitted);
                
                return (
                  <div 
                    key={arc.id}
                    onClick={() => router.push(`/edit/${arc.id}`)}
                    className="p-4 rounded-2xl glass-card hover:border-blue-500/20 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    {/* Cover Mini */}
                    <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-850/65 shadow-md">
                      <BookCover title={arc.title} author={arc.author} coverUrl={arc.coverUrl} />
                    </div>
                    
                    {/* Book Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-white truncate leading-tight font-sans">{arc.title}</h4>
                      <p className="text-slate-455 text-xs truncate mt-0.5 font-body">by {arc.author}</p>
                      
                      {/* Progress bar inside card for simple tracking */}
                      {arc.readingStatus === "Currently Reading" && (
                        <div className="w-full max-w-30 mt-2">
                          <div className="flex justify-between items-center text-[8px] text-slate-550 font-bold mb-0.5">
                            <span>READING</span>
                            <span>{arc.progress || 0}%</span>
                          </div>
                          <div className="h-0.5 w-full bg-slate-850/60 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-linear-to-r from-[#0a84ff] to-[#64d2ff]" 
                              style={{ width: `${arc.progress || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Deadline & Status Badge */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${urgency.colorClass} ${urgency.borderClass}`}>
                        {urgency.label}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold font-body">
                        {arc.readingStatus}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Quick Action & Reading Progress */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-white font-sans">
            Reading Hub
          </h2>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800/40 space-y-5">
            <h3 className="text-sm font-bold text-slate-200 tracking-wide uppercase font-sans">
              Pipeline Links
            </h3>
            
            <div className="space-y-3">
              <Link
                href="/kanban"
                className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 hover:bg-slate-850/40 border border-slate-850 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">Review Kanban</p>
                    <p className="text-xs text-slate-400 mt-0.5">Drag & drop columns</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </Link>

              <Link
                href="/library"
                className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 hover:bg-slate-850/40 border border-slate-850 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">All ARCs</p>
                    <p className="text-xs text-slate-400 mt-0.5">Library card shelf</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </Link>
            </div>
            
            <div className="p-4 rounded-xl bg-blue-950/10 border border-blue-900/20 text-xs text-blue-300 font-body leading-relaxed">
              💡 <span className="font-semibold text-slate-200">Tip:</span> Ensure you update your review links once published! It keeps your Active ARC count clean.
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
