/**
 * Get current date string in local time format YYYY-MM-DD
 */
export const getTodayStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Calculates number of days remaining until the deadline date string.
 * Returns negative if the deadline is in the past.
 */
export const getDaysRemaining = (deadlineStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const deadline = new Date(deadlineStr);
  deadline.setHours(0, 0, 0, 0);
  
  const diffTime = deadline.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export interface UrgencyInfo {
  colorClass: string; // Tailwind color text and bg
  borderClass: string;
  dotClass: string;
  label: string;
  daysRemaining: number;
}

/**
 * Returns color-coded tailwind classes and label based on deadline urgency
 */
export const getUrgencyInfo = (deadlineStr: string, isFinishedOrSubmitted: boolean): UrgencyInfo => {
  const days = getDaysRemaining(deadlineStr);
  
  if (isFinishedOrSubmitted) {
    return {
      colorClass: "text-slate-400 bg-slate-800/40",
      borderClass: "border-slate-800",
      dotClass: "bg-slate-500",
      label: "Completed",
      daysRemaining: days
    };
  }
  
  if (days < 0) {
    return {
      colorClass: "text-rose-400 bg-rose-950/20",
      borderClass: "border-rose-900/45",
      dotClass: "bg-rose-500",
      label: `${Math.abs(days)}d Overdue`,
      daysRemaining: days
    };
  } else if (days <= 7) {
    return {
      colorClass: "text-amber-400 bg-amber-950/20",
      borderClass: "border-amber-900/45",
      dotClass: "bg-amber-500",
      label: `${days}d left`,
      daysRemaining: days
    };
  } else {
    return {
      colorClass: "text-emerald-400 bg-emerald-950/20",
      borderClass: "border-emerald-900/45",
      dotClass: "bg-emerald-500",
      label: `${days}d left`,
      daysRemaining: days
    };
  }
};
