"use client";

import { AlertTriangle, CheckCircle2, Info, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";

type AppToastType = "info" | "success" | "error" | "warning";

const iconByType = {
  info: Info,
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
};

const colorByType = {
  info: "text-sky-400 bg-sky-500/10",
  success: "text-emerald-400 bg-emerald-500/10",
  error: "text-rose-400 bg-rose-500/10",
  warning: "text-amber-400 bg-amber-500/10",
};

interface AppToastOptions {
  title: string;
  description?: string;
  type?: AppToastType;
  duration?: number;
}

export function showAppToast({
  title,
  description,
  type = "info",
  duration = 4500,
}: AppToastOptions) {
  const Icon = iconByType[type];

  return toast.custom(
    () => (
      <div className="mx-auto flex w-[calc(100vw-2rem)] max-w-sm gap-3 rounded-3xl border border-white/10 bg-[#0e121d]/95 p-4 text-left shadow-2xl backdrop-blur-md">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${colorByType[type]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-sans text-sm font-bold text-white">{title}</p>
          {description ? (
            <p className="mt-1 font-body text-xs leading-relaxed text-slate-400">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    ),
    {
      duration,
      position: "top-center",
    }
  );
}

interface ConfirmToastOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
}

export function showConfirmToast({
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
}: ConfirmToastOptions) {
  return toast.custom(
    (t) => (
      <div className="mx-auto w-[calc(100vw-2rem)] max-w-sm rounded-3xl border border-white/10 bg-[#0e121d]/95 p-4 text-left shadow-2xl backdrop-blur-md">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
            <Trash2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-sans text-sm font-bold text-white">{title}</p>
            {description ? (
              <p className="mt-1 font-body text-xs leading-relaxed text-slate-400">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => toast.dismiss(t)}
            className="rounded-full px-4 py-2 text-xs font-semibold text-slate-400 transition-colors hover:text-white"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={async () => {
              toast.dismiss(t);
              await onConfirm();
            }}
            className="rounded-full bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-950/30 transition-colors hover:bg-rose-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    ),
    {
      duration: Infinity,
      position: "top-center",
    }
  );
}
