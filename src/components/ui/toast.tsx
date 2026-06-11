"use client";
import { create } from "zustand";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useEffect } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = "info") => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function toast(message: string, type: ToastType = "info") {
  useToastStore.getState().addToast(message, type);
}

const icons = { success: CheckCircle, error: AlertCircle, info: Info };
const styles = {
  success: "bg-green-50 border-green-500 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  error: "bg-red-50 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  info: "bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div key={t.id} className={cn("flex items-center gap-2 rounded-lg border-l-4 p-4 shadow-lg min-w-[300px]", styles[t.type])}>
            <Icon className="h-5 w-5 flex-shrink-0" />
            <p className="flex-1 text-sm font-medium">{t.message}</p>
            <button onClick={() => removeToast(t.id)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
