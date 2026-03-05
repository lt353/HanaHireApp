import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Video, X, Loader2, CheckCircle, RotateCcw } from "lucide-react";
import { VideoIntroModal } from "./VideoIntroModal";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

export interface QuestionAnswer {
  question: string;
  answer_text?: string;
  answer_video_url?: string;
  answer_video_thumbnail?: string;
}

type AnswerMode = "text" | "video" | null;

interface AnswerState {
  mode: AnswerMode;
  text: string;
  videoUrl?: string;
  videoThumbUrl?: string;
  uploading: boolean;
  uploadProgress: number;
  uploadError?: string;
}

interface ApplicationQuestionsModalProps {
  isOpen: boolean;
  questions: string[];
  jobTitle: string;
  onSubmit: (answers: QuestionAnswer[]) => void;
  onSkip: () => void;
  candidateId: string;
}

const emptyAnswer = (): AnswerState => ({
  mode: null,
  text: "",
  uploading: false,
  uploadProgress: 0,
});

export const ApplicationQuestionsModal: React.FC<ApplicationQuestionsModalProps> = ({
  isOpen,
  questions,
  jobTitle,
  onSubmit,
  onSkip,
  candidateId,
}) => {
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [activeVideoQIdx, setActiveVideoQIdx] = useState<number | null>(null);
  // Ref keeps the active question index alive across async upload callbacks
  const videoQIdxRef = useRef<number | null>(null);

  // Reset answers each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setAnswers(questions.map(() => emptyAnswer()));
      setActiveVideoQIdx(null);
      videoQIdxRef.current = null;
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateAnswer = (idx: number, patch: Partial<AnswerState>) => {
    setAnswers((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, ...patch } : a))
    );
  };

  const openVideoModal = (qIdx: number) => {
    videoQIdxRef.current = qIdx;
    setActiveVideoQIdx(qIdx);
    updateAnswer(qIdx, {
      mode: "video",
      videoUrl: undefined,
      videoThumbUrl: undefined,
      uploadError: undefined,
    });
  };

  const anyUploading = answers.some((a) => a.uploading);

  const handleSubmit = () => {
    const result: QuestionAnswer[] = questions.map((q, i) => {
      const ans = answers[i];
      const qa: QuestionAnswer = { question: q };
      if (ans?.mode === "text" && ans.text.trim()) {
        qa.answer_text = ans.text.trim();
      } else if (ans?.mode === "video" && ans.videoUrl) {
        qa.answer_video_url = ans.videoUrl;
        if (ans.videoThumbUrl) qa.answer_video_thumbnail = ans.videoThumbUrl;
      }
      return qa;
    });
    onSubmit(result);
  };

  const candidateIdNum = parseInt(candidateId, 10) || undefined;
  const activePrefix = `answer_${videoQIdxRef.current ?? 0}`;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onSkip} title="Answer Questions">
        <div className="space-y-6">
          {/* Context banner */}
          <div className="p-4 bg-[#148F8B]/5 border border-[#148F8B]/15 rounded-2xl">
            <p className="text-xs font-black uppercase tracking-widest text-[#148F8B] mb-1">
              {jobTitle}
            </p>
            <p className="text-sm font-medium text-gray-600 leading-relaxed">
              The employer has {questions.length} question
              {questions.length !== 1 ? "s" : ""} for applicants. All answers
              are optional.
            </p>
          </div>

          {/* Question cards */}
          <div className="space-y-4">
            {questions.map((question, idx) => {
              const ans = answers[idx] || emptyAnswer();

              return (
                <div
                  key={idx}
                  className="rounded-[1.5rem] border-2 border-gray-100 overflow-hidden"
                >
                  {/* Question header */}
                  <div className="px-5 py-4 bg-gray-50 flex items-start gap-3">
                    <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-[#780262]/10 text-[#780262] text-[10px] font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-bold text-gray-900 leading-snug flex-1">
                      {question}
                    </p>
                  </div>

                  {/* Answer area */}
                  <div className="px-5 py-4 space-y-3">
                    {ans.mode === null && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => updateAnswer(idx, { mode: "text" })}
                            className="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-gray-100 hover:border-[#148F8B]/40 hover:bg-[#148F8B]/5 transition-all group"
                          >
                            <MessageSquare size={15} className="text-gray-400 group-hover:text-[#148F8B] transition-colors shrink-0" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 group-hover:text-[#148F8B] transition-colors">
                              Type Answer
                            </span>
                          </button>
                          <button
                            type="button"
                            disabled={anyUploading}
                            onClick={() => openVideoModal(idx)}
                            className="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-gray-100 hover:border-[#780262]/40 hover:bg-[#780262]/5 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Video size={15} className="text-gray-400 group-hover:text-[#780262] transition-colors shrink-0" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 group-hover:text-[#780262] transition-colors">
                              Record Video
                            </span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {/* no-op — null mode = skipped */}}
                          className="w-full text-center text-[10px] font-black uppercase tracking-widest text-gray-300 py-1 cursor-default"
                        >
                          Skip this question
                        </button>
                      </div>
                    )}

                    {ans.mode === "text" && (
                      <div className="space-y-2">
                        <textarea
                          value={ans.text}
                          onChange={(e) =>
                            updateAnswer(idx, { text: e.target.value })
                          }
                          placeholder="Type your answer here..."
                          rows={3}
                          className="w-full p-3 sm:p-4 rounded-2xl bg-white border-2 border-gray-100 focus:border-[#148F8B] focus:ring-4 ring-[#148F8B]/10 outline-none font-medium text-sm text-gray-900 resize-none transition-colors placeholder:text-gray-300"
                        />
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            disabled={anyUploading}
                            onClick={() => openVideoModal(idx)}
                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#780262] transition-colors disabled:opacity-40"
                          >
                            <Video size={10} /> Switch to video
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateAnswer(idx, { mode: null, text: "" })
                            }
                            className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-gray-500 transition-colors"
                          >
                            Skip question
                          </button>
                        </div>
                      </div>
                    )}

                    {ans.mode === "video" && (
                      <div className="space-y-2">
                        {ans.uploading ? (
                          <div className="p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl space-y-2">
                            <div className="flex items-center gap-2">
                              <Loader2
                                size={14}
                                className="text-[#780262] animate-spin shrink-0"
                              />
                              <span className="text-xs font-black uppercase tracking-widest text-gray-600">
                                Uploading {ans.uploadProgress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-[#780262] h-full rounded-full transition-all duration-300"
                                style={{ width: `${ans.uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        ) : ans.videoUrl ? (
                          <div className="p-4 bg-[#780262]/5 border-2 border-[#780262]/20 rounded-2xl flex items-center gap-3">
                            {ans.videoThumbUrl ? (
                              <img
                                src={ans.videoThumbUrl}
                                className="w-16 h-10 object-cover rounded-xl shrink-0"
                                alt=""
                              />
                            ) : (
                              <div className="w-16 h-10 rounded-xl bg-[#780262]/10 flex items-center justify-center shrink-0">
                                <Video size={16} className="text-[#780262]" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <CheckCircle
                                  size={12}
                                  className="text-[#780262] shrink-0"
                                />
                                <span className="text-xs font-black uppercase tracking-widest text-[#780262]">
                                  Video recorded
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              disabled={anyUploading}
                              onClick={() => openVideoModal(idx)}
                              className="p-2 rounded-xl border border-[#780262]/20 text-[#780262] hover:bg-[#780262]/10 transition-colors disabled:opacity-40"
                              title="Re-record"
                            >
                              <RotateCcw size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateAnswer(idx, {
                                  mode: null,
                                  videoUrl: undefined,
                                  videoThumbUrl: undefined,
                                })
                              }
                              className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200 transition-colors"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          /* Video mode chosen but not yet recorded */
                          <div className="space-y-2">
                            {ans.uploadError && (
                              <p className="text-xs font-bold text-red-500">
                                {ans.uploadError}
                              </p>
                            )}
                            <button
                              type="button"
                              disabled={anyUploading}
                              onClick={() => openVideoModal(idx)}
                              className="w-full p-5 border-2 border-dashed border-[#780262]/20 rounded-2xl flex flex-col items-center gap-2 hover:border-[#780262]/40 hover:bg-[#780262]/5 transition-all group disabled:opacity-40"
                            >
                              <Video
                                size={24}
                                className="text-[#780262]/40 group-hover:text-[#780262]/70 transition-colors"
                              />
                              <span className="text-xs font-black uppercase tracking-widest text-gray-500 group-hover:text-[#780262] transition-colors">
                                Start Recording
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateAnswer(idx, { mode: "text" })
                              }
                              className="w-full text-center text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#148F8B] transition-colors py-1"
                            >
                              Switch to text instead
                            </button>
                          </div>
                        )}

                        {!ans.uploading && !ans.videoUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              updateAnswer(idx, {
                                mode: null,
                                videoUrl: undefined,
                              })
                            }
                            className="w-full text-center text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-gray-500 transition-colors py-0.5"
                          >
                            Skip question
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              className="w-full h-16 sm:h-20 text-lg sm:text-xl rounded-[1.5rem] bg-[#148F8B] hover:bg-[#136068] text-white shadow-2xl shadow-[#148F8B]/30 hover:scale-105 active:scale-95 transition-all duration-200 tracking-tight"
              onClick={handleSubmit}
              disabled={anyUploading}
            >
              {anyUploading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" /> Uploading
                  video…
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
              Skip all questions and apply →
            </button>
          </div>
        </div>
      </Modal>

      {/* Single VideoIntroModal instance; opened per-question via activeVideoQIdx */}
      <VideoIntroModal
        isOpen={activeVideoQIdx !== null}
        onClose={() => setActiveVideoQIdx(null)}
        uploadPrefix={activePrefix}
        candidateId={candidateIdNum}
        onUploadStart={() => {
          const qIdx = videoQIdxRef.current;
          if (qIdx !== null) updateAnswer(qIdx, { uploading: true, uploadProgress: 0 });
        }}
        onUploadProgress={(p) => {
          const qIdx = videoQIdxRef.current;
          if (qIdx !== null) updateAnswer(qIdx, { uploadProgress: p });
        }}
        onComplete={(videoUrl) => {
          const qIdx = videoQIdxRef.current;
          if (qIdx !== null) {
            // videoThumbUrl starts as videoUrl placeholder; replaced by onThumbnailReady
            updateAnswer(qIdx, {
              videoUrl,
              videoThumbUrl: videoUrl,
              uploading: false,
              uploadProgress: 100,
            });
          }
        }}
        onThumbnailReady={(thumbUrl) => {
          const qIdx = videoQIdxRef.current;
          if (qIdx !== null) {
            updateAnswer(qIdx, { videoThumbUrl: thumbUrl });
            videoQIdxRef.current = null;
          }
        }}
        onUploadError={(msg) => {
          const qIdx = videoQIdxRef.current;
          if (qIdx !== null) {
            updateAnswer(qIdx, {
              uploading: false,
              uploadError: msg,
              videoUrl: undefined,
            });
            videoQIdxRef.current = null;
          }
        }}
      />
    </>
  );
};
