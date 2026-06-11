"use client";

import React from "react";
import Link from "next/link";
import { Calendar, Edit2 } from "lucide-react";
import { ARC, ReadingStatus, ReviewStatus } from "@/context/DatabaseContext";
import { getUrgencyInfo } from "@/lib/dateUtils";
import BookCover from "./BookCover";

interface ARCCardProps {
  arc: ARC;
}

export default function ARCCard({ arc }: ARCCardProps) {
  const isFinishedOrSubmitted = arc.readingStatus === "Finished" || arc.reviewStatus === "Published";
  const urgency = getUrgencyInfo(arc.deadline, isFinishedOrSubmitted);

  // Helper colors for Reading Status dot/text
  const getReadingStatusMeta = (status: ReadingStatus) => {
    switch (status) {
      case "To Read":
        return { dot: "bg-amber-400", text: "text-amber-300" };
      case "Currently Reading":
        return { dot: "bg-blue-500 animate-pulse", text: "text-blue-400" };
      case "Finished":
        return { dot: "bg-emerald-400", text: "text-emerald-300" };
      case "DNF":
        return { dot: "bg-rose-500", text: "text-rose-400" };
      default:
        return { dot: "bg-slate-400", text: "text-slate-400" };
    }
  };

  // Helper colors for Review Status dot/text
  const getReviewStatusMeta = (status: ReviewStatus) => {
    switch (status) {
      case "Not Started":
        return { dot: "bg-slate-600", text: "text-slate-450" };
      case "Drafted":
        return { dot: "bg-amber-400", text: "text-amber-300" };
      case "Submitted":
        return { dot: "bg-blue-400", text: "text-blue-300" };
      case "Published":
        return { dot: "bg-teal-400", text: "text-teal-300" };
      default:
        return { dot: "bg-slate-400", text: "text-slate-400" };
    }
  };

  // Dynamic border glow highlight class based on urgency
  const getGlowClass = () => {
    if (isFinishedOrSubmitted) return "hover:border-slate-700/50";
    const days = urgency.daysRemaining;
    if (days < 0) return "hover:border-rose-500/30 hover:shadow-[0_0_20px_0_rgba(244,63,94,0.08)]";
    if (days <= 7) return "hover:border-amber-500/30 hover:shadow-[0_0_20px_0_rgba(245,158,11,0.08)]";
    return "hover:border-slate-700/50 hover:shadow-[0_0_20px_0_rgba(255,255,255,0.02)]";
  };

  return (
    <Link
      href={`/edit/${arc.id}`}
      className={`group block rounded-3xl glass-card border border-slate-800/35 overflow-hidden shadow-lg select-none relative cursor-pointer ${getGlowClass()}`}
    >
      <div className="flex h-36">
        {/* Left Side: Book Cover */}
        <div className="w-24 h-full shrink-0 border-r border-slate-850/60 overflow-hidden">
          <BookCover title={arc.title} author={arc.author} coverUrl={arc.coverUrl} size="md" />
        </div>

        {/* Right Side: Details */}
        <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex justify-between items-start gap-1">
              <h3 className="font-bold text-sm text-slate-100 group-hover:text-blue-400 transition-colors truncate font-sans leading-tight">
                {arc.title}
              </h3>
              <Edit2 className="w-3.5 h-3.5 text-slate-600 shrink-0 group-hover:text-slate-400 transition-colors mt-0.5" />
            </div>
            <p className="text-[10px] text-slate-400 truncate mt-0.5 font-body">by {arc.author}</p>
            
            {/* Status Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(() => {
                const readingMeta = getReadingStatusMeta(arc.readingStatus);
                const reviewMeta = getReviewStatusMeta(arc.reviewStatus);
                return (
                  <>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-900/40 border border-slate-850/40 ${readingMeta.text}`}>
                      <span className={`w-1 h-1 rounded-full ${readingMeta.dot}`}></span>
                      <span>{arc.readingStatus}</span>
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-900/40 border border-slate-850/40 ${reviewMeta.text}`}>
                      <span className={`w-1 h-1 rounded-full ${reviewMeta.dot}`}></span>
                      <span>{arc.reviewStatus}</span>
                    </span>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Bottom section: Progress bar and Deadline */}
          <div className="space-y-2">
            {/* Show progress bar if currently reading */}
            {arc.readingStatus === "Currently Reading" && (
              <div className="w-full">
                <div className="flex justify-between items-center text-[9px] text-slate-500 font-medium mb-0.5">
                  <span>Reading</span>
                  <span>{arc.progress || 0}%</span>
                </div>
                <div className="h-1 w-full bg-slate-850/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-[#0a84ff] to-[#64d2ff] rounded-full"
                    style={{ width: `${arc.progress || 0}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Deadline information */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-850/30 text-[10px] font-body text-slate-400">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-slate-550" />
                <span className="text-[10px] text-slate-450">{arc.deadline}</span>
              </div>
              <span className={`px-2 py-0.5 font-bold rounded-lg border text-[9px] uppercase tracking-wider ${urgency.colorClass} ${urgency.borderClass}`}>
                {urgency.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>

  );
}
