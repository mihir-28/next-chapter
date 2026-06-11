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
    Check,
    Loader2,
} from "lucide-react";
import { useDatabase, ARC } from "@/context/DatabaseContext";
import { useAuth } from "@/context/AuthContext";
import { getDaysRemaining, getUrgencyInfo } from "@/lib/dateUtils";
import BookCover from "@/components/BookCover";
import Logo from "@/components/Logo";

export default function DashboardPage() {
    const { arcs, loading, updateARC } = useDatabase();
    const { user } = useAuth();
    const router = useRouter();

    const handleUpdateProgress = async (
        id: string,
        progress: number,
        status?: "Currently Reading" | "Finished",
    ) => {
        try {
            const updateData: Partial<ARC> = { progress };
            if (status) {
                updateData.readingStatus = status;
                if (status === "Finished") {
                    updateData.dateFinished = new Date()
                        .toISOString()
                        .split("T")[0];
                }
            }
            await updateARC(id, updateData);
        } catch (error) {
            console.error("Failed to update progress:", error);
        }
    };

    // Loading skeleton screen
    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-10 bg-slate-800/50 rounded-xl w-1/3"></div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((n) => (
                        <div
                            key={n}
                            className="h-32 bg-slate-800/40 rounded-2xl"
                        ></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="h-8 bg-slate-800/50 rounded-lg w-1/4"></div>
                        {[1, 2, 3].map((n) => (
                            <div
                                key={n}
                                className="h-24 bg-slate-800/30 rounded-xl"
                            ></div>
                        ))}
                    </div>
                    <div className="h-64 bg-slate-800/30 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    // Calculate statistics
    const totalActive = arcs.filter(
        (a) => a.readingStatus !== "DNF" && a.reviewStatus !== "Published",
    ).length;

    const currentlyReadingARCs = arcs.filter(
        (a) => a.readingStatus === "Currently Reading",
    );

    const readingCount = currentlyReadingARCs.length;

    const reviewsPendingCount = arcs.filter(
        (a) => a.readingStatus === "Finished" && a.reviewStatus !== "Published",
    ).length;

    const overdueCount = arcs.filter(
        (a) =>
            getDaysRemaining(a.deadline) < 0 && a.reviewStatus !== "Published",
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
        if (hr < 12) return "Good Morning";
        if (hr < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const todayDateFormatted = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
    });

    return (
        <div className="space-y-8 pb-6">
            <title>Dashboard | Next Chapter ARC Tracker</title>
            <meta
                name="description"
                content="Manage your Advance Reader Copies, track review deadlines, and monitor your reading progress."
            />
            {/* Top Welcome Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans sm:text-4xl">
                    {getGreeting()},{" "}
                    {user?.displayName?.split(" ")[0] || "Reader"}!
                </h1>
                <p className="text-slate-400 text-sm mt-1 font-body">
                    Here is your review summary for {todayDateFormatted}.
                </p>
            </div>

            {/* Grid of stats */}
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {/* Total Active */}
                <div className="p-3 sm:p-4 rounded-2xl glass-card-static border border-slate-800/30 flex flex-col justify-between h-24 relative overflow-hidden transition-all duration-300">
                    <div className="absolute top-0 right-0 p-2 sm:p-3">
                        <BookOpen className="w-4.5 h-4.5 text-purple-400/80" />
                    </div>
                    <div className="pr-6 sm:pr-8">
                        <span className="text-[#fbdf93] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider block wrap-break-word">
                            Active ARCs
                        </span>
                    </div>
                    <span className="text-xl sm:text-2xl font-extrabold text-white font-sans mt-2">
                        {totalActive}
                    </span>
                </div>

                {/* Currently Reading */}
                <div className="p-3 sm:p-4 rounded-2xl glass-card-static border border-slate-800/30 flex flex-col justify-between h-24 relative overflow-hidden transition-all duration-300">
                    <div className="absolute top-0 right-0 p-2 sm:p-3">
                        <Clock className="w-4.5 h-4.5 text-sky-400/80" />
                    </div>
                    <div className="pr-6 sm:pr-8">
                        <span className="text-[#fbdf93] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider block wrap-break-words">
                            Reading Now
                        </span>
                    </div>
                    <span className="text-xl sm:text-2xl font-extrabold text-white font-sans mt-2">
                        {readingCount}
                    </span>
                </div>

                {/* Reviews Pending */}
                <div className="p-3 sm:p-4 rounded-2xl glass-card-static border border-slate-800/30 flex flex-col justify-between h-24 relative overflow-hidden transition-all duration-300">
                    <div className="absolute top-0 right-0 p-2 sm:p-3">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400/80" />
                    </div>
                    <div className="pr-6 sm:pr-8">
                        <span className="text-[#fbdf93] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider block wrap-break-words">
                            Reviews Pending
                        </span>
                    </div>
                    <span className="text-xl sm:text-2xl font-extrabold text-white font-sans mt-2">
                        {reviewsPendingCount}
                    </span>
                </div>

                {/* Due This Month */}
                <div className="p-3 sm:p-4 rounded-2xl glass-card-static border border-slate-800/30 flex flex-col justify-between h-24 relative overflow-hidden transition-all duration-300">
                    <div className="absolute top-0 right-0 p-2 sm:p-3">
                        <Calendar className="w-4.5 h-4.5 text-blue-400/80" />
                    </div>
                    <div className="pr-6 sm:pr-8">
                        <span className="text-[#fbdf93] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider block wrap-break-words">
                            Due This Month
                        </span>
                    </div>
                    <span className="text-xl sm:text-2xl font-extrabold text-white font-sans mt-2">
                        {dueThisMonth}
                    </span>
                </div>

                {/* Due This Week */}
                <div
                    className={`p-3 sm:p-4 rounded-2xl border flex flex-col justify-between h-24 relative overflow-hidden transition-all duration-300 ${
                        dueThisWeek > 0
                            ? "border-amber-900/30 glass-card-week"
                            : "border-slate-800/30 glass-card-static"
                    }`}
                >
                    <div className="absolute top-0 right-0 p-2 sm:p-3">
                        <Calendar
                            className={`w-4.5 h-4.5 ${dueThisWeek > 0 ? "text-amber-400/90" : "text-slate-500/80"}`}
                        />
                    </div>
                    <div className="pr-6 sm:pr-8">
                        <span className="text-[#fbdf93] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider block wrap-break-words">
                            Due This Week
                        </span>
                    </div>
                    <span
                        className={`text-xl sm:text-2xl font-extrabold font-sans mt-2 ${dueThisWeek > 0 ? "text-amber-400" : "text-white"}`}
                    >
                        {dueThisWeek}
                    </span>
                </div>

                {/* Overdue Books */}
                <div
                    className={`p-3 sm:p-4 rounded-2xl border flex flex-col justify-between h-24 relative overflow-hidden transition-all duration-300 ${
                        overdueCount > 0
                            ? "border-rose-900/30 glass-card-overdue"
                            : "border-slate-800/30 glass-card-static"
                    }`}
                >
                    <div className="absolute top-0 right-0 p-2 sm:p-3">
                        <AlertCircle
                            className={`w-4.5 h-4.5 ${overdueCount > 0 ? "text-rose-400/90" : "text-slate-500/80"}`}
                        />
                    </div>
                    <div className="pr-6 sm:pr-8">
                        <span className="text-[#fbdf93] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider block wrap-break-words">
                            Overdue
                        </span>
                    </div>
                    <span
                        className={`text-xl sm:text-2xl font-extrabold font-sans mt-2 ${overdueCount > 0 ? "text-rose-400" : "text-white"}`}
                    >
                        {overdueCount}
                    </span>
                </div>
            </div>

            {/* Main Split Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: Upcoming Deadlines */}
                <div className="order-2 lg:order-1 lg:col-span-2 space-y-4">
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
                            <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#e5b842]/5 rounded-full blur-2xl"></div>
                            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#7c3aed]/5 rounded-full blur-2xl"></div>
                            <Logo
                                size={64}
                                className="mb-4 rounded-2xl shadow-lg border border-white/5"
                            />
                            <h3 className="text-lg font-bold text-white font-sans mb-1">
                                Your Shelf is Empty
                            </h3>
                            <p className="text-slate-400 text-sm max-w-sm mb-6 font-body">
                                Add your first Advance Reader Copy to start
                                tracking reading progress and deadlines.
                            </p>
                            <Link
                                href="/add"
                                className="py-3 px-6 rounded-full bg-linear-to-r from-[#2e0854] via-[#5b1b9e] to-[#7c3aed] bg-clip-padding border border-[#e5b842]/30 hover:border-[#fbdf93]/80 text-[#fbdf93] font-semibold text-sm tracking-wide shadow-md hover:shadow-[0_0_22px_rgba(124,58,237,0.3)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 cursor-pointer"
                            >
                                Create ARC Entry
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcomingARCs.map((arc) => {
                                const isFinishedOrSubmitted =
                                    arc.readingStatus === "Finished" ||
                                    arc.reviewStatus === "Submitted";
                                const urgency = getUrgencyInfo(
                                    arc.deadline,
                                    isFinishedOrSubmitted,
                                );

                                return (
                                    <div
                                        key={arc.id}
                                        onClick={() =>
                                            router.push(`/edit/${arc.id}`)
                                        }
                                        className="p-3.5 h-24 rounded-2xl glass-card hover:border-blue-500/20 flex items-center justify-between gap-4 cursor-pointer"
                                    >
                                        {/* Cover Mini */}
                                        <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-850/65 shadow-md">
                                            <BookCover
                                                title={arc.title}
                                                author={arc.author}
                                                coverUrl={arc.coverUrl}
                                                size="sm"
                                            />
                                        </div>

                                        {/* Book Details */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                                            <h4 className="font-bold text-sm text-white truncate leading-tight font-sans">
                                                {arc.title}
                                            </h4>
                                            <p className="text-slate-455 text-xs truncate mt-0.5 font-body">
                                                by {arc.author}
                                            </p>

                                            {/* Progress bar inside card for simple tracking */}
                                            {arc.readingStatus ===
                                                "Currently Reading" && (
                                                <div className="w-full max-w-30 mt-1.5">
                                                    <div className="flex justify-between items-center text-[8px] text-slate-550 font-bold mb-0.5">
                                                        <span>READING</span>
                                                        <span>
                                                            {arc.progress || 0}%
                                                        </span>
                                                    </div>
                                                    <div className="h-0.5 w-full bg-slate-850/60 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-linear-to-r from-[#0a84ff] to-[#64d2ff]"
                                                            style={{
                                                                width: `${arc.progress || 0}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Deadline & Status Badge */}
                                        <div className="flex flex-col items-end gap-1 shrink-0 justify-center h-full">
                                            <span
                                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${urgency.colorClass} ${urgency.borderClass}`}
                                            >
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

                {/* Right Side: Currently Reading */}
                <div className="order-1 lg:order-2 lg:col-span-1 space-y-4 animate-fade-in">
                    <h2 className="text-xl font-bold tracking-tight text-white font-sans">
                        Currently Reading
                    </h2>

                    {currentlyReadingARCs.length === 0 ? (
                        <div className="p-6 rounded-2xl glass-panel border border-white/5 text-center flex flex-col items-center py-8 relative overflow-hidden">
                            <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#7c3aed]/5 rounded-full blur-xl"></div>
                            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-[#e5b842]/5 rounded-full blur-xl"></div>
                            <BookOpen className="w-10 h-10 text-slate-500 mb-3" />
                            <h3 className="text-sm font-bold text-white font-sans mb-1">
                                No Active Books
                            </h3>
                            <p className="text-slate-400 text-xs max-w-50 mb-4 font-body leading-normal">
                                You aren&apos;t reading any books right now. Set
                                a book to &quot;Currently Reading&quot; to track
                                progress here.
                            </p>
                            <Link
                                href="/library"
                                className="py-2 px-4 rounded-full bg-linear-to-r from-[#7c3aed]/20 to-[#e5b842]/20 hover:from-[#7c3aed]/30 hover:to-[#e5b842]/30 border border-[#e5b842]/30 hover:border-[#fbdf93]/60 text-[#fbdf93] font-bold text-xs transition-all duration-300 cursor-pointer"
                            >
                                Browse Shelf
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {currentlyReadingARCs.map((arc) => (
                                <CurrentlyReadingCard
                                    key={arc.id}
                                    arc={arc}
                                    onUpdate={handleUpdateProgress}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface CurrentlyReadingCardProps {
    arc: ARC;
    onUpdate: (
        id: string,
        progress: number,
        status?: "Currently Reading" | "Finished",
    ) => Promise<void>;
}

function CurrentlyReadingCard({ arc, onUpdate }: CurrentlyReadingCardProps) {
    const [inputValue, setInputValue] = React.useState<string>(
        String(arc.progress || 0),
    );
    const [prevProgress, setPrevProgress] = React.useState<number>(
        arc.progress || 0,
    );
    const [isSaving, setIsSaving] = React.useState(false);
    const [isSaved, setIsSaved] = React.useState(false);

    // Sync state if database progress changes
    if ((arc.progress || 0) !== prevProgress) {
        setPrevProgress(arc.progress || 0);
        setInputValue(String(arc.progress || 0));
    }

    const progressNum = parseInt(inputValue, 10);
    const hasChanged =
        !isNaN(progressNum) &&
        progressNum !== (arc.progress || 0) &&
        progressNum >= 0 &&
        progressNum <= 100;

    const handleSave = async () => {
        if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) return;

        setIsSaving(true);
        try {
            if (progressNum === 100) {
                await onUpdate(arc.id, 100, "Finished");
            } else {
                await onUpdate(arc.id, progressNum, "Currently Reading");
            }
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && hasChanged) {
            handleSave();
        }
    };

    const urgency = getUrgencyInfo(arc.deadline, false);

    return (
        <div className="p-3.5 h-24 rounded-2xl glass-card hover:border-[#7c3aed]/30 flex items-center justify-between gap-4">
            {/* Cover Mini */}
            <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-800/40 shadow-md">
                <BookCover
                    title={arc.title}
                    author={arc.author}
                    coverUrl={arc.coverUrl}
                    size="sm"
                />
            </div>

            {/* Book Details & Progress Input */}
            <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                <h4 className="font-bold text-sm text-white truncate leading-tight font-sans">
                    {arc.title}
                </h4>
                <p className="text-slate-400 text-xs truncate mt-0.5 font-body">
                    by {arc.author}
                </p>

                {/* Progress Input Row */}
                <div className="flex items-center space-x-2 mt-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">
                        Progress:
                    </span>
                    <div className="relative flex items-center">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isSaving}
                            className="w-12 bg-slate-950/60 border border-[#e5b842]/20 focus:border-[#7c3aed] text-white text-xs font-bold px-1.5 py-1 rounded-lg focus:outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-xs text-slate-400 font-bold ml-1">
                            %
                        </span>
                    </div>

                    {/* Tick Save Button */}
                    {hasChanged && (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="p-1 rounded-lg bg-[#7c3aed]/20 hover:bg-[#7c3aed]/40 border border-[#e5b842]/40 hover:border-[#fbdf93]/80 text-[#fbdf93] active:scale-95 shadow-sm transition-all cursor-pointer flex items-center justify-center w-6 h-6 shrink-0"
                            title="Save changes"
                        >
                            {isSaving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Check
                                    className="w-3.5 h-3.5"
                                    style={{ strokeWidth: 3.5 }}
                                />
                            )}
                        </button>
                    )}

                    {/* Saved Indicator */}
                    {isSaved && !hasChanged && (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Saved</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Days left badge / Complete Trigger */}
            <div className="flex flex-col items-end shrink-0 gap-1.5 justify-center h-full">
                <span
                    className={`text-[8px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${urgency.colorClass} ${urgency.borderClass}`}
                >
                    {urgency.label}
                </span>
                {progressNum === 100 && hasChanged && (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="text-[9px] font-extrabold text-[#fbdf93] bg-[#7c3aed]/20 hover:bg-[#7c3aed]/40 border border-[#e5b842]/45 rounded-full px-2 py-0.5 cursor-pointer transition-colors"
                    >
                        Finish Book
                    </button>
                )}
            </div>
        </div>
    );
}
