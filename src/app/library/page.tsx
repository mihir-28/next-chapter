"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { useDatabase, ReadingStatus, ReviewStatus, ARC } from "@/context/DatabaseContext";
import ARCCard from "@/components/ARCCard";
import { getDaysRemaining } from "@/lib/dateUtils";
import Logo from "@/components/Logo";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type SortOption = "nearest-deadline" | "furthest-deadline" | "release-date" | "recently-added";

export default function LibraryPage() {
  const { arcs, loading } = useDatabase();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReadingStatus, setSelectedReadingStatus] = useState<ReadingStatus | "All">("All");
  const [selectedReviewStatus, setSelectedReviewStatus] = useState<ReviewStatus | "All">("All");
  const [sortBy, setSortBy] = useState<SortOption>("nearest-deadline");
  const [showFilters, setShowFilters] = useState(false);

  // Filter and Sort ARC list
  const filteredAndSortedARCs = useMemo(() => {
    let result = [...arcs];

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (arc) =>
          arc.title.toLowerCase().includes(query) ||
          arc.author.toLowerCase().includes(query)
      );
    }

    // 2. Reading Status Filter
    if (selectedReadingStatus !== "All") {
      result = result.filter((arc) => arc.readingStatus === selectedReadingStatus);
    }

    // 3. Review Status Filter
    if (selectedReviewStatus !== "All") {
      result = result.filter((arc) => arc.reviewStatus === selectedReviewStatus);
    }

    // Helper to determine status category weight for ordering
    const getCategoryWeight = (arc: ARC) => {
      const isFinished = arc.readingStatus === "Finished" || arc.reviewStatus === "Published";
      if (isFinished) {
        return arc.readingStatus === "DNF" ? 5 : 4;
      }
      
      const daysRemaining = getDaysRemaining(arc.deadline);
      if (daysRemaining < 0) {
        return 1; // Overdue
      }
      
      if (arc.readingStatus === "Currently Reading") {
        return 2; // Currently Reading
      }
      
      return 3; // To Read (includes other active states like To Read)
    };

    // 4. Sorting logic
    result.sort((a, b) => {
      const weightA = getCategoryWeight(a);
      const weightB = getCategoryWeight(b);

      // Group by status hierarchy first
      if (weightA !== weightB) {
        return weightA - weightB;
      }

      // If they belong to the same category, apply the sorting logic within that category
      if (weightA === 4) {
        // Finished books: sort by recently finished to older ones (newest finished first)
        if (a.dateFinished && b.dateFinished) {
          return b.dateFinished.localeCompare(a.dateFinished);
        }
        // Fallback: recently updated or created
        const timeA = a.updatedAt instanceof Date ? a.updatedAt.getTime() : 0;
        const timeB = b.updatedAt instanceof Date ? b.updatedAt.getTime() : 0;
        if (timeA !== timeB) return timeB - timeA;

        const createA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const createB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return createB - createA;
      }

      // DNF books (weight 5): sort by recently updated/created
      if (weightA === 5) {
        const timeA = a.updatedAt instanceof Date ? a.updatedAt.getTime() : 0;
        const timeB = b.updatedAt instanceof Date ? b.updatedAt.getTime() : 0;
        if (timeA !== timeB) return timeB - timeA;

        const createA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const createB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return createB - createA;
      }

      // Active categories (Overdue, Currently Reading, To Read): sort by chosen sortBy
      switch (sortBy) {
        case "nearest-deadline":
          return getDaysRemaining(a.deadline) - getDaysRemaining(b.deadline);
        
        case "furthest-deadline":
          return getDaysRemaining(b.deadline) - getDaysRemaining(a.deadline);
        
        case "release-date":
          if (!a.releaseDate) return 1;
          if (!b.releaseDate) return -1;
          return a.releaseDate.localeCompare(b.releaseDate);
        
        case "recently-added":
        default:
          const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
          const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
          return timeB - timeA;
      }
    });

    return result;
  }, [arcs, searchQuery, selectedReadingStatus, selectedReviewStatus, sortBy]);

  // Reading Status Options for tabs
  const readingStatusOptions: (ReadingStatus | "All")[] = [
    "All",
    "To Read",
    "Currently Reading",
    "Finished",
    "DNF",
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-10 bg-slate-800/50 rounded-xl w-1/4"></div>
          <div className="h-10 bg-slate-800/50 rounded-xl w-24"></div>
        </div>
        <div className="h-12 bg-slate-800/40 rounded-xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-36 bg-slate-800/30 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <title>Library | Next Chapter ARC Tracker</title>
      <meta name="description" content="Browse, search, filter, and sort your entire Advance Reader Copy (ARC) collection." />
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
          ARC Library
        </h1>
        <p className="text-slate-400 text-xs mt-1 font-body">
          Manage and filter your entire {arcs.length} book collection.
        </p>
      </div>

      {/* Search Bar & Filter Toggle */}
      <div className="flex gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4.5 py-3.5 rounded-full bg-slate-950/20 border border-white/5 focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 outline-none text-slate-100 placeholder-slate-500 transition-all font-body text-sm shadow-inner"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3.5 rounded-full border transition-all cursor-pointer ${
            showFilters || selectedReviewStatus !== "All" || sortBy !== "nearest-deadline"
              ? "bg-blue-600/20 border-blue-500/40 text-blue-400"
              : "bg-slate-950/25 border-white/5 text-slate-400 hover:text-slate-250"
          }`}
          title="Toggle filters"
        >
          <SlidersHorizontal className="w-5.5 h-5.5" />
        </button>
      </div>

      {/* Reading Status horizontal scroll pills */}
      <div className="flex overflow-x-auto gap-1.5 pb-2 -mx-5 px-5 no-scrollbar scroll-smooth">
        {readingStatusOptions.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedReadingStatus(status)}
            className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap border cursor-pointer transition-all duration-300 ${
              selectedReadingStatus === status
                ? status === "All" ? "bg-white/10 text-white border-white/10 shadow" :
                  status === "To Read" ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-sm" :
                  status === "Currently Reading" ? "bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-sm" :
                  status === "Finished" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm" :
                  status === "DNF" ? "bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-sm" :
                  "bg-slate-700/20 text-slate-400 border-slate-700/30 shadow-sm"
                : "bg-slate-950/20 text-slate-400 border-white/5 hover:border-slate-800 hover:text-slate-200"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Collapsible filters menu */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-5 rounded-2xl glass-panel border border-slate-800/55 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
              {/* Review Status Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">
                  Review Status
                </label>
                <div className="relative">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 outline-none text-slate-200 text-sm font-body cursor-pointer text-left flex justify-between items-center transition-all hover:border-slate-700">
                        <span>{selectedReviewStatus === "All" ? "All Reviews" : selectedReviewStatus}</span>
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-1 bg-slate-950 border border-slate-800 rounded-xl shadow-xl z-50" align="start">
                      <div className="flex flex-col gap-0.5">
                        {["All", "Not Started", "Drafted", "Submitted", "Published"].map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setSelectedReviewStatus(status as ReviewStatus | "All")}
                            className={`w-full px-3 py-2 text-left text-xs font-semibold rounded-lg hover:bg-white/5 transition-all cursor-pointer ${
                              status === selectedReviewStatus
                                ? "bg-blue-500/10 text-blue-400"
                                : "text-slate-350"
                            }`}
                          >
                            {status === "All" ? "All Reviews" : status}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Sort Order Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">
                  Sort By
                </label>
                <div className="relative">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 outline-none text-slate-200 text-sm font-body cursor-pointer text-left flex justify-between items-center transition-all hover:border-slate-700">
                        <span>{
                          sortBy === "nearest-deadline" ? "Nearest Deadline" :
                          sortBy === "furthest-deadline" ? "Furthest Deadline" :
                          sortBy === "release-date" ? "Release Date (A-Z)" :
                          "Recently Added"
                        }</span>
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-1 bg-slate-950 border border-slate-800 rounded-xl shadow-xl z-50" align="start">
                      <div className="flex flex-col gap-0.5">
                        {[
                          { value: "nearest-deadline", label: "Nearest Deadline" },
                          { value: "furthest-deadline", label: "Furthest Deadline" },
                          { value: "release-date", label: "Release Date (A-Z)" },
                          { value: "recently-added", label: "Recently Added" }
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setSortBy(opt.value as SortOption)}
                            className={`w-full px-3 py-2 text-left text-xs font-semibold rounded-lg hover:bg-white/5 transition-all cursor-pointer ${
                              sortBy === opt.value
                                ? "bg-blue-500/10 text-blue-400"
                                : "text-slate-350"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search results total counts indicator */}
      {filteredAndSortedARCs.length > 0 && searchQuery && (
        <p className="text-xs text-slate-400 font-body">
          Found {filteredAndSortedARCs.length} books matching &ldquo;{searchQuery}&rdquo;.
        </p>
      )}

      {/* ARCs list grid */}
      {filteredAndSortedARCs.length === 0 ? (
        /* Empty results container */
        <div className="p-8 rounded-2xl glass-panel border border-white/5 text-center py-16 flex flex-col items-center relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#e5b842]/5 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#7c3aed]/5 rounded-full blur-2xl"></div>
          <Logo size={64} className="mb-4 rounded-2xl shadow-lg border border-white/5" />
          <h3 className="text-lg font-bold text-white font-sans">No ARCs Found</h3>
          <p className="text-slate-400 text-sm max-w-xs mt-1 mb-6 font-body">
            {arcs.length === 0 
              ? "Your library is empty. Click the button below to add your first ARC."
              : "No books match the selected search terms or status filters."}
          </p>
          {arcs.length === 0 ? (
            <Link
              href="/add"
              className="py-3 px-6 rounded-full bg-linear-to-r from-[#2e0854] via-[#5b1b9e] to-[#7c3aed] bg-clip-padding border border-[#e5b842]/30 hover:border-[#fbdf93]/80 text-[#fbdf93] font-semibold text-sm tracking-wide shadow-md hover:shadow-[0_0_22px_rgba(124,58,237,0.3)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 cursor-pointer"
            >
              Add ARC Book
            </Link>
          ) : (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedReadingStatus("All");
                setSelectedReviewStatus("All");
                setSortBy("nearest-deadline");
              }}
              className="py-3 px-6 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700 text-sm font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 relative">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedARCs.map((arc) => (
              <motion.div
                key={arc.id}
                layout
                initial={{ opacity: 0, y: 15, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.96 }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 28,
                  mass: 0.8
                }}
              >
                <ARCCard arc={arc} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
