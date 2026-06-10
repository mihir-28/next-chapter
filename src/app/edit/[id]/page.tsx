"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { useDatabase, NewARCData } from "@/context/DatabaseContext";
import ARCForm from "@/components/ARCForm";
import { showAppToast, showConfirmToast } from "@/lib/toasts";

interface EditARCPageProps {
  params: Promise<{ id: string }>;
}

export default function EditARCPage({ params }: EditARCPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { arcs, updateARC, deleteARC, loading } = useDatabase();

  // Find corresponding book
  const arc = arcs.find((a) => a.id === id);

  const handleUpdate = async (data: NewARCData) => {
    await updateARC(id, data);
  };

  const handleDelete = async () => {
    showConfirmToast({
      title: "Delete this ARC?",
      description: `"${arc?.title}" will be removed from your pipeline.`,
      confirmLabel: "Delete ARC",
      onConfirm: async () => {
        try {
          await deleteARC(id);
          router.push("/");
        } catch (err) {
          console.error("Failed to delete ARC: ", err);
          showAppToast({
            type: "error",
            title: "Failed to delete ARC",
            description: "Please try again in a moment.",
          });
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-75 text-slate-400">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-[#0a84ff] rounded-full animate-spin"></div>
        <p className="text-xs font-body tracking-wider mt-3 uppercase">Retrieving ARC details...</p>
      </div>
    );
  }

  if (!arc) {
    return (
      <div className="max-w-md mx-auto p-6 rounded-2xl glass-panel border border-slate-800/40 text-center space-y-4">
        <h2 className="text-lg font-bold text-white font-sans">ARC Not Found</h2>
        <p className="text-slate-450 text-xs font-body">
          The book you are trying to edit does not exist or you do not have permission to view it.
        </p>
        <button
          onClick={() => router.push("/")}
          className="py-2.5 px-5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-slate-100 text-xs font-semibold cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <>
      <title>Edit ARC Details | Next Chapter ARC Tracker</title>
      <meta name="description" content="Update reading progress, rating, and review status for this ARC book." />
      <ARCForm
        initialData={arc}
        onSubmit={handleUpdate}
        onDelete={handleDelete}
        submitLabel="Update Book details"
        title="Edit ARC Details"
      />
    </>
  );
}
