"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  HelpCircle
} from "lucide-react";
import { useDatabase, ARC } from "@/context/DatabaseContext";
import { getUrgencyInfo } from "@/lib/dateUtils";
import BookCover from "@/components/BookCover";
import Logo from "@/components/Logo";

type KanbanColumnId = "to-read" | "currently-reading" | "finished" | "reviewed";

interface ColumnConfig {
  id: KanbanColumnId;
  title: string;
  headerColor: string; // Tailwind border/accent color
  badgeColor: string;  // Tailwind badge text/bg color
}

const COLUMNS: ColumnConfig[] = [
  {
    id: "to-read",
    title: "To Read",
    headerColor: "border-t-sky-500",
    badgeColor: "text-sky-400 bg-sky-950/20",
  },
  {
    id: "currently-reading",
    title: "Currently Reading",
    headerColor: "border-t-[#0a84ff]",
    badgeColor: "text-blue-400 bg-blue-950/20",
  },
  {
    id: "finished",
    title: "Finished",
    headerColor: "border-t-amber-500",
    badgeColor: "text-amber-400 bg-amber-950/20",
  },
  {
    id: "reviewed",
    title: "Reviewed",
    headerColor: "border-t-emerald-500",
    badgeColor: "text-emerald-400 bg-emerald-950/20",
  },
];

export default function KanbanPage() {
  const { arcs, loading, updateARC } = useDatabase();
  const router = useRouter();
  const [dragOverColumn, setDragOverColumn] = useState<KanbanColumnId | null>(null);

  // Filter books by column ID
  const getColumnBooks = (columnId: KanbanColumnId): ARC[] => {
    switch (columnId) {
      case "to-read":
        return arcs.filter(
          (a) => a.readingStatus === "To Read" && a.reviewStatus !== "Published"
        );
      case "currently-reading":
        return arcs.filter(
          (a) => a.readingStatus === "Currently Reading" && a.reviewStatus !== "Published"
        );
      case "finished":
        return arcs.filter(
          (a) => a.readingStatus === "Finished" && a.reviewStatus !== "Published"
        );
      case "reviewed":
        return arcs.filter((a) => a.reviewStatus === "Published");
      default:
        return [];
    }
  };

  // Drag start handler
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  // Drag over handler
  const handleDragOver = (e: React.DragEvent, columnId: KanbanColumnId) => {
    e.preventDefault();
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  // Drag leave handler
  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  // Drop handler
  const handleDrop = async (e: React.DragEvent, targetColumnId: KanbanColumnId) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    const arcId = e.dataTransfer.getData("text/plain");
    if (!arcId) return;

    // Determine target updates based on Kanban column
    let updates: Partial<ARC> = {};

    switch (targetColumnId) {
      case "to-read":
        updates = {
          readingStatus: "To Read",
          reviewStatus: "Not Started",
          progress: 0,
        };
        break;
      case "currently-reading":
        updates = {
          readingStatus: "Currently Reading",
          progress: 10, // initial progressive start if zero
        };
        // Retrieve the current arc to preserve reviewStatus if already set
        const currentCR = arcs.find((a) => a.id === arcId);
        if (currentCR && currentCR.progress && currentCR.progress > 0) {
          delete updates.progress; // keep existing progress
        }
        break;
      case "finished":
        updates = {
          readingStatus: "Finished",
          progress: 100,
        };
        // Set review status to Drafted if not started
        const currentF = arcs.find((a) => a.id === arcId);
        if (currentF && currentF.reviewStatus === "Not Started") {
          updates.reviewStatus = "Drafted";
        }
        break;
      case "reviewed":
        updates = {
          readingStatus: "Finished",
          reviewStatus: "Published",
          progress: 100,
        };
        break;
    }

    try {
      await updateARC(arcId, updates);
    } catch (error) {
      console.error("Error updating ARC position in Kanban: ", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-800/50 rounded-xl w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-96 bg-slate-800/25 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      <title>Review Board | Next Chapter ARC Tracker</title>
      <meta name="description" content="Track your reading progress and review status on our interactive drag-and-drop Kanban review board." />
      {/* Header Info */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans flex items-center space-x-3">
          <Logo size={32} showBackground={true} className="rounded-lg shrink-0 border border-white/5 shadow-sm" />
          <span>Review Board</span>
        </h1>
        <p className="text-slate-400 text-xs mt-1 font-body">
          Drag and drop books across cards to update reading pipeline and review states.
        </p>
      </div>

      {/* Grid wrapper for responsive scroll */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-6 -mx-5 px-5 no-scrollbar md:grid md:grid-cols-4 md:overflow-x-visible md:mx-0 md:px-0">
        
        {COLUMNS.map((col) => {
          const colBooks = getColumnBooks(col.id);
          const isOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col w-70 shrink-0 md:w-auto rounded-3xl bg-slate-900/10 p-5 transition-all duration-300 border border-white/5 ${
                isOver 
                  ? "bg-slate-900/45 border-blue-500/20 ring-2 ring-blue-500/5 shadow-xl scale-[1.01]" 
                  : "border-white/5"
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-white/5">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    col.id === "to-read" ? "bg-sky-400" :
                    col.id === "currently-reading" ? "bg-[#0a84ff]" :
                    col.id === "finished" ? "bg-amber-400" :
                    "bg-emerald-400"
                  }`}></span>
                  <h3 className="font-bold text-sm text-slate-200 font-sans tracking-wide">
                    {col.title}
                  </h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.badgeColor}`}>
                  {colBooks.length}
                </span>
              </div>

              {/* Cards list container */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-270px)] custom-scrollbar pr-1 min-h-75">
                {colBooks.length === 0 ? (
                  /* Empty Drop Placeholder */
                  <div className="h-28 rounded-xl border border-dashed border-slate-800/40 flex flex-col items-center justify-center text-slate-550 font-body text-xs p-4 text-center select-none bg-slate-950/10">
                    <HelpCircle className="w-5 h-5 mb-1.5 opacity-40 text-slate-500" />
                    <span>Drop books here</span>
                  </div>
                ) : (
                  colBooks.map((arc) => {
                    const urgency = getUrgencyInfo(arc.deadline, col.id === "reviewed");
                    
                    return (
                      <div
                        key={arc.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, arc.id)}
                        onClick={() => router.push(`/edit/${arc.id}`)}
                        className="p-3 rounded-xl bg-slate-950/40 border border-white/5 hover:border-slate-850 active:scale-[0.985] transition-all duration-300 cursor-grab flex items-center gap-3 select-none group shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:-translate-y-0.5"
                      >
                        {/* Mini book cover */}
                        <div className="w-9 h-12 rounded overflow-hidden shrink-0 border border-slate-850/50">
                          <BookCover title={arc.title} author={arc.author} coverUrl={arc.coverUrl} />
                        </div>
                        
                        {/* Summary details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-slate-200 group-hover:text-blue-400 transition-colors truncate font-sans leading-tight">
                            {arc.title}
                          </h4>
                          <p className="text-[10px] text-slate-455 truncate font-body mt-0.5">by {arc.author}</p>
                          
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-850/40">
                            {/* Simple Days remaining color indicator */}
                            <span className="flex items-center space-x-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${urgency.dotClass}`}></span>
                              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                                {urgency.label}
                              </span>
                            </span>
                            
                            {/* Star rating preview if review is published */}
                            {arc.rating && arc.rating > 0 && col.id === "reviewed" ? (
                              <span className="text-[9px] font-bold text-amber-400">★ {arc.rating}</span>
                            ) : null}

                            {/* Reading progress preview */}
                            {arc.readingStatus === "Currently Reading" && arc.progress ? (
                              <span className="text-[9px] text-slate-500 font-semibold">{arc.progress}%</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}

      </div>

    </div>
  );
}
