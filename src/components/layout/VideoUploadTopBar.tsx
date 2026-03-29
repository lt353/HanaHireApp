import React from "react";
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useVideoUploadProgress } from "../../contexts/VideoUploadProgressContext";

export function VideoUploadTopBar() {
  const ctx = useVideoUploadProgress();
  if (!ctx || ctx.phase === "idle") return null;

  const { phase, progress, message, dismiss } = ctx;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[1000020] pointer-events-none flex justify-center px-3 pt-[max(0.5rem,env(safe-area-inset-top))]"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto w-full max-w-3xl rounded-b-2xl border border-b-2 border-gray-200/90 bg-white/95 shadow-xl backdrop-blur-md overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
          <div className="shrink-0 text-[#148F8B]">
            {phase === "error" ? (
              <AlertCircle className="w-5 h-5" aria-hidden />
            ) : phase === "done" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden />
            ) : (
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <p className="text-sm font-bold text-gray-900 truncate">{message}</p>
            {phase !== "error" && phase !== "done" && (
              <div
                className="h-1.5 rounded-full bg-gray-200 overflow-hidden"
                role="progressbar"
                aria-valuenow={phase === "saving" ? 100 : progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-[#148F8B] transition-[width] duration-300 ease-out"
                  style={{
                    width: `${phase === "saving" ? 100 : progress}%`,
                  }}
                />
              </div>
            )}
            {phase === "uploading" && (
              <p className="text-xs font-medium text-gray-500 tabular-nums">
                {progress}%
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismiss()}
            className="shrink-0 p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            aria-label="Dismiss upload status"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
