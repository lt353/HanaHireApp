import React, { useEffect, useRef, useState } from "react";
import { CheckCircle, Loader2, MessageSquare, Mic, RotateCcw, Video, X } from "lucide-react";
import { VideoIntroModal } from "./VideoIntroModal";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

export interface ApplicationQuestionAnswer {
  question: string;
  answer_text?: string;
}

export interface ApplicationSubmissionPayload {
  mode: "video" | "text" | null;
  question_answers: ApplicationQuestionAnswer[];
  video_url?: string;
  video_thumbnail_url?: string;
}

interface ApplicationQuestionsModalProps {
  isOpen: boolean;
  questions: string[];
  jobTitle: string;
  onSubmit: (payload: ApplicationSubmissionPayload) => void;
  onSkip: () => void;
  candidateId: string;
  existingApplication?: {
    video_url?: string | null;
    video_thumbnail_url?: string | null;
    question_answers?: ApplicationQuestionAnswer[] | null;
  } | null;
}

export const ApplicationQuestionsModal: React.FC<ApplicationQuestionsModalProps> = ({
  isOpen,
  questions,
  jobTitle,
  onSubmit,
  onSkip,
  candidateId,
  existingApplication,
}) => {
  const [responseMode, setResponseMode] = useState<"video" | "text" | null>(null);
  const [textAnswers, setTextAnswers] = useState<string[]>([]);
  const [applicationVideoUrl, setApplicationVideoUrl] = useState<string | undefined>(undefined);
  const [applicationVideoThumbUrl, setApplicationVideoThumbUrl] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | undefined>(undefined);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const [activeSpeechIndex, setActiveSpeechIndex] = useState<number | null>(null);
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setHasSpeechSupport(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onend = () => setActiveSpeechIndex(null);
      recognitionRef.current = recognition;
      setHasSpeechSupport(true);
    } catch {
      setHasSpeechSupport(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const existingAnswers = Array.isArray(existingApplication?.question_answers)
      ? existingApplication.question_answers
      : [];
    const nextTextAnswers = questions.map((question) => {
      const match = existingAnswers.find((answer) => answer.question === question);
      return match?.answer_text ?? "";
    });

    const hasTextAnswers = nextTextAnswers.some((answer) => answer.trim().length > 0);
    const hasVideoAnswer = !!existingApplication?.video_url;

    setTextAnswers(nextTextAnswers);
    setApplicationVideoUrl(existingApplication?.video_url ?? undefined);
    setApplicationVideoThumbUrl(existingApplication?.video_thumbnail_url ?? undefined);
    setUploadProgress(0);
    setUploadError(undefined);
    setUploading(false);
    setShowVideoModal(false);
    setResponseMode(hasTextAnswers ? "text" : hasVideoAnswer ? "video" : null);
  }, [isOpen, questions, existingApplication]);

  const updateTextAnswer = (idx: number, value: string) => {
    setTextAnswers((prev) => prev.map((answer, i) => (i === idx ? value : answer)));
  };

  const switchToText = () => {
    setResponseMode("text");
    setApplicationVideoUrl(undefined);
    setApplicationVideoThumbUrl(undefined);
    setUploadProgress(0);
    setUploadError(undefined);
    setUploading(false);
  };

  const switchToVideo = () => {
    setResponseMode("video");
    setTextAnswers((prev) => prev.map(() => ""));
    setShowVideoModal(true);
  };

  const toggleSpeechToText = (idx: number) => {
    if (!recognitionRef.current || !hasSpeechSupport) return;

    const recognition = recognitionRef.current as any;
    if (activeSpeechIndex === idx) {
      recognition.stop();
      setActiveSpeechIndex(null);
      return;
    }

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          transcript += result[0].transcript;
        }
      }

      if (transcript) {
        updateTextAnswer(
          idx,
          textAnswers[idx]
            ? `${textAnswers[idx].trim()} ${transcript.trim()}`
            : transcript.trim(),
        );
      }
    };

    try {
      recognition.start();
      setActiveSpeechIndex(idx);
    } catch {
      setActiveSpeechIndex(null);
    }
  };

  const handleSubmit = () => {
    const normalizedAnswers = questions.map((question, idx) => {
      const answer = textAnswers[idx]?.trim();
      return {
        question,
        ...(responseMode === "text" && answer ? { answer_text: answer } : {}),
      };
    });

    onSubmit({
      mode: responseMode,
      question_answers: normalizedAnswers,
      ...(responseMode === "video" && applicationVideoUrl
        ? {
            video_url: applicationVideoUrl,
            video_thumbnail_url: applicationVideoThumbUrl,
          }
        : {}),
    });
  };

  const candidateIdNum = parseInt(candidateId, 10) || undefined;
  const hasExistingApplication =
    !!existingApplication?.video_url ||
    !!existingApplication?.video_thumbnail_url ||
    !!(Array.isArray(existingApplication?.question_answers) &&
      existingApplication.question_answers.some((answer) => !!answer.answer_text?.trim()));

  return (
    <>
      <Modal isOpen={isOpen} onClose={onSkip} title={hasExistingApplication ? "Update Application" : "Apply to Job"}>
        <div className="space-y-6">
          <div className="p-4 bg-[#148F8B]/5 border border-[#148F8B]/15 rounded-2xl space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-[#148F8B]">
              {jobTitle}
            </p>
            <p className="text-sm font-medium text-gray-700 leading-relaxed">
              Your intro video always stays on your profile. You can optionally add
              one personalized application video for this job, or answer the
              employer&apos;s questions in text instead.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={switchToVideo}
              className={`rounded-2xl border-2 p-4 text-left transition-all ${
                responseMode === "video"
                  ? "border-[#780262] bg-[#780262]/5"
                  : "border-gray-100 hover:border-[#780262]/30 hover:bg-[#780262]/5"
              }`}
            >
              <div className="flex items-center gap-2">
                <Video aria-hidden="true" size={18} className="text-[#780262] shrink-0" />
                <span className="text-xs font-black uppercase tracking-widest text-[#780262]">
                  Personalized Video
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600 font-medium">
                Record one job-specific video that employers will see alongside
                your intro video.
              </p>
            </button>

            <button
              type="button"
              onClick={switchToText}
              disabled={questions.length === 0}
              className={`rounded-2xl border-2 p-4 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                responseMode === "text"
                  ? "border-[#148F8B] bg-[#148F8B]/5"
                  : "border-gray-100 hover:border-[#148F8B]/30 hover:bg-[#148F8B]/5"
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare aria-hidden="true" size={18} className="text-[#148F8B] shrink-0" />
                <span className="text-xs font-black uppercase tracking-widest text-[#148F8B]">
                  Text Answers
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600 font-medium">
                Type answers to the employer&apos;s questions, or use speech to
                text if you prefer.
              </p>
            </button>
          </div>

          {responseMode === "video" && (
            <div className="space-y-4 rounded-[1.5rem] border-2 border-[#780262]/15 bg-[#780262]/5 p-5">
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-[#780262]">
                  Application Video
                </p>
                <p className="text-sm font-medium text-gray-600">
                  This is in addition to your intro video, not a replacement for it.
                </p>
              </div>

              {uploading ? (
                <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-[#780262] shrink-0" />
                    <span className="text-xs font-black uppercase tracking-widest text-gray-700">
                      Uploading {uploadProgress}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#780262] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : applicationVideoUrl ? (
                <div className="flex items-center gap-3 rounded-2xl border border-[#780262]/15 bg-white p-4">
                  {applicationVideoThumbUrl ? (
                    <img
                      src={applicationVideoThumbUrl}
                      alt=""
                      className="w-20 h-12 rounded-xl object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-12 rounded-xl bg-[#780262]/10 flex items-center justify-center shrink-0">
                      <Video size={18} className="text-[#780262]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-[#780262] shrink-0" />
                      <span className="text-xs font-black uppercase tracking-widest text-[#780262]">
                        Personalized video ready
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Re-record video"
                    onClick={() => setShowVideoModal(true)}
                    className="p-2 rounded-xl border border-[#780262]/20 text-[#780262] hover:bg-[#780262]/10 transition-colors"
                  >
                    <RotateCcw aria-hidden="true" size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label="Remove video"
                    onClick={() => {
                      setApplicationVideoUrl(undefined);
                      setApplicationVideoThumbUrl(undefined);
                      setResponseMode(null);
                    }}
                    className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
                  >
                    <X aria-hidden="true" size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowVideoModal(true)}
                  className="w-full rounded-2xl border-2 border-dashed border-[#780262]/20 bg-white p-6 flex flex-col items-center gap-2 hover:border-[#780262]/40 hover:bg-[#780262]/5 transition-all"
                >
                  <Video size={24} className="text-[#780262]" />
                  <span className="text-xs font-black uppercase tracking-widest text-[#780262]">
                    Record personalized video
                  </span>
                </button>
              )}

              {uploadError && (
                <p className="text-xs font-bold text-red-500">{uploadError}</p>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                Employer Questions
              </p>
              {questions.length > 0 && (
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                  {questions.length} total
                </span>
              )}
            </div>

            {questions.length === 0 ? (
              <div className="rounded-[1.5rem] border-2 border-gray-100 bg-gray-50 px-5 py-4">
                <p className="text-sm font-medium text-gray-500">
                  This employer didn&apos;t add custom questions for this role.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, idx) => (
                  <div
                    key={question}
                    className="rounded-[1.5rem] border-2 border-gray-100 overflow-hidden"
                  >
                    <div className="px-5 py-4 bg-gray-50 flex items-start gap-3">
                      <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-[#780262]/10 text-[#780262] text-[10px] font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <p className="text-sm font-bold text-gray-900 leading-snug flex-1">
                        {question}
                      </p>
                    </div>

                    <div className="px-5 py-4">
                      {responseMode === "text" ? (
                        <div className="space-y-3">
                          <textarea
                            value={textAnswers[idx] || ""}
                            onChange={(e) => updateTextAnswer(idx, e.target.value)}
                            placeholder="Type your answer here..."
                            aria-label={question}
                            rows={3}
                            className="w-full p-4 rounded-2xl bg-white border-2 border-gray-100 focus:border-[#148F8B] focus:ring-4 ring-[#148F8B]/10 outline-none font-medium text-sm text-gray-900 resize-none transition-colors placeholder:text-gray-300"
                          />
                          <div className="flex justify-end">
                            {hasSpeechSupport && (
                              <button
                                type="button"
                                onClick={() => toggleSpeechToText(idx)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black tracking-widest uppercase transition-all ${
                                  activeSpeechIndex === idx
                                    ? "border-[#148F8B] bg-[#148F8B]/10 text-[#148F8B]"
                                    : "border-gray-200 bg-white text-gray-500 hover:border-[#148F8B] hover:text-[#148F8B]"
                                }`}
                              >
                                <Mic size={12} />
                                <span>{activeSpeechIndex === idx ? "Stop" : "Speak"}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ) : responseMode === "video" ? (
                        <p className="text-sm font-medium text-gray-500">
                          You&apos;ll address this in your personalized application video.
                        </p>
                      ) : (
                        <p className="text-sm font-medium text-gray-400">
                          Choose whether you want to respond with one personalized
                          video or written answers.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button
              className="w-full h-16 sm:h-20 text-lg sm:text-xl rounded-[1.5rem] bg-[#148F8B] hover:bg-[#136068] text-white shadow-2xl shadow-[#148F8B]/30 hover:scale-105 active:scale-95 transition-all duration-200 tracking-tight"
              onClick={handleSubmit}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Uploading video…
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
            <button
              type="button"
              onClick={onSkip}
              className="w-full text-center text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors py-2"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      <VideoIntroModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        candidateId={candidateIdNum}
        uploadPrefix="application"
        onUploadStart={() => {
          setUploading(true);
          setUploadProgress(0);
          setUploadError(undefined);
        }}
        onUploadProgress={(progress) => setUploadProgress(progress)}
        onComplete={(videoUrl, videoThumbUrl) => {
          setApplicationVideoUrl(videoUrl);
          setApplicationVideoThumbUrl(videoThumbUrl);
          setUploading(false);
          setUploadProgress(100);
          setShowVideoModal(false);
        }}
        onThumbnailReady={(thumbUrl) => setApplicationVideoThumbUrl(thumbUrl)}
        onUploadError={(message) => {
          setUploading(false);
          setUploadError(message);
          setUploadProgress(0);
        }}
      />
    </>
  );
};
