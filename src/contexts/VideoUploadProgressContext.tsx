import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

export type VideoUploadBarPhase = "idle" | "uploading" | "saving" | "done" | "error";

export type VideoUploadProgressContextValue = {
  phase: VideoUploadBarPhase;
  progress: number;
  message: string;
  /** Returns a job id; pass it to setProgress/setSaving/setDone/setError so stale work is ignored. */
  beginUpload: (message: string) => number;
  setProgress: (percent: number, jobId: number) => void;
  setSaving: (message: string | undefined, jobId: number) => void;
  setDone: (message: string | undefined, jobId: number) => void;
  setError: (message: string, jobId: number) => void;
  /** Clears the bar only if this job is still the active one (avoids wiping a newer upload). */
  dismissIfGeneration: (jobId: number) => void;
  dismiss: () => void;
};

const VideoUploadProgressContext =
  createContext<VideoUploadProgressContextValue | null>(null);

export function useVideoUploadProgress(): VideoUploadProgressContextValue | null {
  return useContext(VideoUploadProgressContext);
}

export function VideoUploadProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [phase, setPhase] = useState<VideoUploadBarPhase>("idle");
  const [progress, setProgressState] = useState(0);
  const [message, setMessage] = useState("");
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jobIdRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    clearTimer();
    setPhase("idle");
    setProgressState(0);
    setMessage("");
  }, [clearTimer]);

  const dismissIfGeneration = useCallback(
    (jobId: number) => {
      if (jobId !== jobIdRef.current) return;
      dismiss();
    },
    [dismiss],
  );

  const beginUpload = useCallback(
    (msg: string) => {
      clearTimer();
      jobIdRef.current += 1;
      const id = jobIdRef.current;
      setPhase("uploading");
      setProgressState(0);
      setMessage(msg);
      return id;
    },
    [clearTimer],
  );

  const setProgress = useCallback((percent: number, jobId: number) => {
    if (jobId !== jobIdRef.current) return;
    setPhase("uploading");
    setProgressState(Math.min(100, Math.max(0, percent)));
  }, []);

  const setSaving = useCallback(
    (msg: string | undefined, jobId: number) => {
      if (jobId !== jobIdRef.current) return;
      clearTimer();
      setPhase("saving");
      setProgressState(100);
      setMessage(msg ?? "Saving…");
    },
    [clearTimer],
  );

  const setDone = useCallback(
    (msg: string | undefined, jobId: number) => {
      if (jobId !== jobIdRef.current) return;
      clearTimer();
      setPhase("done");
      setProgressState(100);
      setMessage(msg ?? "Video saved");
      clearTimerRef.current = setTimeout(() => {
        dismiss();
      }, 2800);
    },
    [clearTimer, dismiss],
  );

  const setError = useCallback(
    (msg: string, jobId: number) => {
      if (jobId !== jobIdRef.current) return;
      clearTimer();
      setPhase("error");
      setProgressState(0);
      setMessage(msg);
      clearTimerRef.current = setTimeout(() => {
        dismiss();
      }, 7000);
    },
    [clearTimer, dismiss],
  );

  const value = useMemo<VideoUploadProgressContextValue>(
    () => ({
      phase,
      progress,
      message,
      beginUpload,
      setProgress,
      setSaving,
      setDone,
      setError,
      dismissIfGeneration,
      dismiss,
    }),
    [
      phase,
      progress,
      message,
      beginUpload,
      setProgress,
      setSaving,
      setDone,
      setError,
      dismissIfGeneration,
      dismiss,
    ],
  );

  return (
    <VideoUploadProgressContext.Provider value={value}>
      {children}
    </VideoUploadProgressContext.Provider>
  );
}
