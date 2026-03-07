import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Camera, Upload, AlertCircle, Save } from "lucide-react";
import { supabase } from "../../utils/supabase/client";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { Check } from "lucide-react"; // Add this to your imports at the top


const MAX_DURATION = 60;
const MAX_FILE_BYTES = 50 * 1024 * 1024; // Supabase storage limit
const ACCEPT_VIDEO = "video/mp4,video/quicktime,video/webm";

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	const mb = bytes / (1024 * 1024);
	return `${mb.toFixed(1)} MB`;
}

type Step = "choose" | "record" | "upload" | "preview";

interface VideoIntroModalProps {
	isOpen: boolean;
	onClose: () => void;
	onComplete: (
		videoUrl: string,
		videoThumbnailUrl: string,
		durationSeconds: number,
	) => void;
	/** Called when thumbnail upload finishes (after modal closes). Use to update thumbnail display. */
	onThumbnailReady?: (thumbUrl: string) => void;
	/** Called as soon as the user hits Save so parent can show background upload progress. */
	onUploadStart?: (info: {
		estimatedSizeBytes: number;
		durationSeconds: number;
	}) => void;
	/** Called with 0–100 during upload for real progress. */
	onUploadProgress?: (progress: number) => void;
	/** Called if video upload ultimately fails (after modal has closed). */
	onUploadError?: (message: string) => void;
	candidateId?: number;
	/** Prefix for the storage file path, e.g. "intro" → "{id}_intro_{ts}.mp4". Defaults to "intro". */
	uploadPrefix?: string;
}

export const VideoIntroModal: React.FC<VideoIntroModalProps> = ({
	isOpen,
	onClose,
	onComplete,
	onThumbnailReady,
	onUploadStart,
	onUploadProgress,
	onUploadError,
	candidateId,
	uploadPrefix = "intro",
}) => {
	const [step, setStep] = useState<Step>("choose");
	const [error, setError] = useState<string | null>(null);

	const streamRef = useRef<MediaStream | null>(null);
	const recorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);
	const videoPreviewRef = useRef<HTMLVideoElement>(null);
	const thumbnailBlobUrlsRef = useRef<string[]>([]);

	const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
	const [recordedDuration, setRecordedDuration] = useState(0);
	const [elapsed, setElapsed] = useState(0);
	const [isRecording, setIsRecording] = useState(false);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const [uploadFile, setUploadFile] = useState<File | null>(null);
	const [uploadDuration, setUploadDuration] = useState(0);

	const [thumbnailTimeSeconds, setThumbnailTimeSeconds] = useState(2);
	const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(
		null,
	);

	useEffect(() => {
		if (!isOpen) {
			setStep("choose");
			setError(null);
			setRecordedBlob(null);
			setRecordedDuration(0);
			setElapsed(0);
			setUploadFile(null);
			setUploadDuration(0);
			setThumbnailTimeSeconds(2);
			setThumbnailPreviewUrl(null);
			stopStream();
		}
	}, [isOpen]);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	const stopStream = () => {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((t) => t.stop());
			streamRef.current = null;
		}
	};

	// Attach camera stream to video element when record view is shown (including when switching to "recording" UI)
	useEffect(() => {
		if (step !== "record" || !streamRef.current) return;
		const video = videoPreviewRef.current;
		if (!video) return;
		video.srcObject = streamRef.current;
		video.play().catch(() => {});
		return () => {
			video.srcObject = null;
		};
	}, [step, isRecording]);

	const openRecordView = async () => {
		setError(null);
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					width: { ideal: 1920 },
					height: { ideal: 1080 },
					frameRate: { ideal: 30 }, // 30 fps (browser default if not specified)
				},
				audio: true,
			});
			streamRef.current = stream;
			setStep("record");
		} catch (err: any) {
			setError(err?.message || "Could not access camera.");
		}
	};

	const startCapture = () => {
		const stream = streamRef.current;
		if (!stream) return;

		const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
			? "video/webm;codecs=vp9"
			: "video/webm";
		// 1080p: ~2.5 Mbps video + 128 kbps audio → ~20 MB for 60s (faster upload)
		const options: MediaRecorderOptions = {
			mimeType: mime,
			videoBitsPerSecond: 2_500_000,
			audioBitsPerSecond: 128_000,
		};
		let recorder: MediaRecorder;
		try {
			recorder = new MediaRecorder(stream, options);
		} catch {
			recorder = new MediaRecorder(stream);
		}
		recorderRef.current = recorder;
		chunksRef.current = [];

		recorder.ondataavailable = (e) => {
			if (e.data.size) chunksRef.current.push(e.data);
		};
		recorder.onstop = () => {
			stopStream();
			if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
			const blob = new Blob(chunksRef.current, { type: mime });
			setRecordedBlob(blob);
			setStep("preview");
		};

		recorder.start(1000);
		setIsRecording(true);
		setElapsed(0);
		timerRef.current = setInterval(() => {
			setElapsed((e) => {
				if (e >= MAX_DURATION - 1) {
					if (timerRef.current) clearInterval(timerRef.current);
					recorderRef.current?.stop();
					setIsRecording(false);
					setRecordedDuration(MAX_DURATION);
					return MAX_DURATION;
				}
				return e + 1;
			});
		}, 1000);
	};

	const stopRecording = () => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
		recorderRef.current?.stop();
		setIsRecording(false);
		setRecordedDuration(elapsed);
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		setError(null);
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > MAX_FILE_BYTES) {
			setError("File must be under 50 MB.");
			return;
		}
		const video = document.createElement("video");
		video.preload = "metadata";
		const objectUrl = URL.createObjectURL(file);
		video.onloadedmetadata = () => {
			const d = Math.round(video.duration);
			URL.revokeObjectURL(objectUrl);
			if (d > MAX_DURATION) {
				setError("Video must be up to 60 seconds.");
				setUploadFile(null);
				setUploadDuration(0);
				return;
			}
			setUploadDuration(d);
			setUploadFile(file);
			setStep("preview");
		};
		video.onerror = () => URL.revokeObjectURL(objectUrl);
		video.src = objectUrl;
	};

	const getPreviewBlob = (): { blob: Blob; duration: number } | null => {
		if (recordedBlob) return { blob: recordedBlob, duration: recordedDuration };
		if (uploadFile)
			return { blob: uploadFile as unknown as Blob, duration: uploadDuration };
		return null;
	};

	const generateThumbnail = (
		videoBlob: Blob,
		atTimeSeconds: number = 2,
	): Promise<Blob> => {
		return new Promise((resolve, reject) => {
			const url = URL.createObjectURL(videoBlob);
			const video = document.createElement("video");
			video.muted = true;
			video.playsInline = true;
			video.setAttribute("crossOrigin", "anonymous");
			const timeout = window.setTimeout(() => {
				URL.revokeObjectURL(url);
				reject(
					new Error("Thumbnail timed out. Try a different video or time."),
				);
			}, 10000);
			const cleanup = () => {
				window.clearTimeout(timeout);
				URL.revokeObjectURL(url);
			};
			video.onloadeddata = () => {
				const t = Math.min(Math.max(0, atTimeSeconds), video.duration || 0);
				video.currentTime = t;
			};
			video.onseeked = () => {
				const maxW = 640;
				const w = video.videoWidth;
				const h = video.videoHeight;
				const scale = w > maxW ? maxW / w : 1;
				const canvas = document.createElement("canvas");
				canvas.width = scale < 1 ? maxW : w;
				canvas.height = scale < 1 ? Math.round(h * scale) : h;
				const ctx = canvas.getContext("2d");
				if (!ctx) {
					cleanup();
					reject(new Error("Canvas context"));
					return;
				}
				ctx.drawImage(video, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
				canvas.toBlob(
					(b) => {
						cleanup();
						if (b) resolve(b);
						else reject(new Error("Thumbnail blob"));
					},
					"image/jpeg",
					0.8,
				);
			};
			video.onerror = () => {
				cleanup();
				reject(new Error("Video load for thumbnail"));
			};
			video.src = url;
		});
	};

	const uploadAndComplete = () => {
		const preview = getPreviewBlob();
		if (!preview) return;

		// Let parent know upload is starting so it can show progress while user continues the form
		onUploadStart?.({
			estimatedSizeBytes: preview.blob.size ?? 0,
			durationSeconds: preview.duration,
		});

		setError(null);
		// Close the modal immediately; the rest runs in the background
		onClose();

		(async () => {
			try {
				const userId = candidateId ?? Math.floor(Date.now() / 1000);
				const ts = Date.now();
				const videoExt = preview.blob.type.includes("webm") ? "webm" : "mp4";
				const videoPath = `${userId}_${uploadPrefix}_${ts}.${videoExt}`;
				const thumbPath = `${userId}_${uploadPrefix}_${ts}_thumb.jpg`;
				const bucket = "candidate-videos";
				const contentType =
					preview.blob.type ||
					(videoExt === "webm" ? "video/webm" : "video/mp4");

				const uploadWithProgress = (
					file: Blob,
					bucketName: string,
					path: string,
					contentType: string,
					onProgress: (percent: number) => void
				): Promise<string> => {
					return new Promise(async (resolve, reject) => {
						try {
							const { data: session } = await supabase.auth.getSession();
							const token = session?.session?.access_token ?? publicAnonKey;
							const supabaseUrl =
								import.meta.env.VITE_SUPABASE_URL ||
								`https://${projectId}.supabase.co`;
							const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/${path}`;
							const xhr = new XMLHttpRequest();

							xhr.upload.addEventListener("progress", (e) => {
								if (e.lengthComputable) {
									const percent = Math.round((e.loaded / e.total) * 100);
									onProgress(percent);
								}
							});

							xhr.addEventListener("load", () => {
								if (xhr.status >= 200 && xhr.status < 300) {
									const { data } = supabase.storage
										.from(bucketName)
										.getPublicUrl(path);
									resolve(data.publicUrl);
								} else {
									reject(new Error(`Upload failed: ${xhr.status}`));
								}
							});
							xhr.addEventListener("error", () =>
								reject(new Error("Upload failed"))
							);
							xhr.addEventListener("abort", () =>
								reject(new Error("Upload cancelled"))
							);

							xhr.open("POST", uploadUrl);
							xhr.setRequestHeader("Authorization", `Bearer ${token}`);
							xhr.setRequestHeader("Content-Type", contentType);
							xhr.setRequestHeader("x-upsert", "true");
							xhr.send(file);
						} catch (err) {
							reject(err);
						}
					});
				};

				const videoUrl = await uploadWithProgress(
					preview.blob,
					bucket,
					videoPath,
					contentType,
					(percent) => onUploadProgress?.(percent)
				);

				onComplete(videoUrl, videoUrl, preview.duration);

				const thumbBlob = await generateThumbnail(
					preview.blob,
					thumbnailTimeSeconds
				);
				const { error: uploadThumbError } = await supabase.storage
					.from(bucket)
					.upload(thumbPath, thumbBlob, {
						contentType: "image/jpeg",
						upsert: true,
					});
				if (uploadThumbError) {
					console.error("Thumbnail upload error:", uploadThumbError);
				} else if (onThumbnailReady) {
					const { data: thumbData } = supabase.storage
						.from(bucket)
						.getPublicUrl(thumbPath);
					onThumbnailReady(thumbData.publicUrl);
				}
			} catch (err: any) {
				const message =
					err?.message ||
					(typeof err === "string" ? err : "Upload failed. Try again.");
				console.error("Video save error:", err);
				onUploadError?.(message);
			}
		})();
	};

	const previewBlob = getPreviewBlob();
	const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);

	useEffect(() => {
		if (step === "preview" && previewBlob) {
			const url = URL.createObjectURL(previewBlob.blob);
			setPreviewObjectUrl(url);
			setThumbnailTimeSeconds((t) =>
				Math.min(t, Math.max(0, previewBlob.duration - 0.5)),
			);
			return () => {
				URL.revokeObjectURL(url);
				setPreviewObjectUrl(null);
			};
		} else {
			setPreviewObjectUrl(null);
		}
	}, [step, !!recordedBlob, !!uploadFile]);

	// Thumbnail preview image at chosen time (for preview step only). Revoke blob URLs only when leaving preview to avoid ERR_FILE_NOT_FOUND.
	useEffect(() => {
		if (step !== "preview" || !previewBlob) {
			thumbnailBlobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
			thumbnailBlobUrlsRef.current = [];
			setThumbnailPreviewUrl(null);
			return;
		}
		const url = URL.createObjectURL(previewBlob.blob);
		thumbnailBlobUrlsRef.current.push(url);
		const video = document.createElement("video");
		video.muted = true;
		video.playsInline = true;
		const time = Math.min(
			Math.max(0, thumbnailTimeSeconds),
			previewBlob.duration,
		);
		let cancelled = false;
		video.onseeked = () => {
			if (cancelled) return;
			const canvas = document.createElement("canvas");
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.drawImage(video, 0, 0);
			setThumbnailPreviewUrl(canvas.toDataURL("image/jpeg", 0.85));
		};
		video.src = url;
		video.currentTime = time;
		return () => {
			cancelled = true;
			setThumbnailPreviewUrl(null);
		};
	}, [step, thumbnailTimeSeconds, previewObjectUrl]);

	if (!isOpen) return null;

	const title =
		step === "choose"
			? "Record Your Video Intro"
			: step === "record"
				? isRecording
					? "Recording…"
					: "Get ready to record"
				: "Video Intro";

	return createPortal(
		<div
			className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				zIndex: 999999,
			}}
			onClick={(e) => {
				if (e.target === e.currentTarget) {
					if (step === "preview") {
						setStep("choose");
						setRecordedBlob(null);
						setUploadFile(null);
					} else {
						onClose();
					}
				}
			}}
		>
			<div
				className="bg-white rounded-[2rem] sm:rounded-[3rem] w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100"
				onClick={(e) => e.stopPropagation()}
				style={{ zIndex: 1000000 }}
			>
				<header className="shrink-0 flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-[#FAFAFA]">
					<h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
						{title}
					</h2>
					<button
						type="button"
						onClick={() => {
							if (step === "preview") {
								setStep("choose");
								setRecordedBlob(null);
								setUploadFile(null);
							} else {
								onClose();
							}
						}}
						aria-label={step === "preview" ? "Back to choose" : "Close"}
					className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
					>
						<X aria-hidden="true" size={22} />
					</button>
				</header>

				<div className="flex-1 flex flex-col min-h-0 overflow-hidden">
					<div className="flex-1 overflow-y-auto p-6 space-y-6">
						{step === "choose" && (
							<>
								<p className="text-gray-600 font-medium">
									Show employers your personality and what makes you great!
								</p>
								<div className="p-4 rounded-2xl bg-[#148F8B]/8 border border-[#148F8B]/20 space-y-2">
									<p className="text-[10px] font-black text-[#148F8B] uppercase tracking-widest">
										Tips
									</p>
									<ul className="space-y-2 text-sm text-gray-700 font-medium">
									<li className="flex items-start gap-2">
		<div className="w-5 h-5 rounded-full bg-[#148F8B] flex items-center justify-center shrink-0 mt-0.5">
			<Check size={12} className="text-white" strokeWidth={3} />
		</div>
		<span>Be yourself!</span>
	</li>
	<li className="flex items-start gap-2">
		<div className="w-5 h-5 rounded-full bg-[#148F8B] flex items-center justify-center shrink-0 mt-0.5">
			<Check size={12} className="text-white" strokeWidth={3} />
		</div>
		<span>Say exactly what you're looking for</span>
	</li>
	<li className="flex items-start gap-2">
		<div className="w-5 h-5 rounded-full bg-[#148F8B] flex items-center justify-center shrink-0 mt-0.5">
			<Check size={12} className="text-white" strokeWidth={3} />
		</div>
		<span>Talk about things the employer can't find in your profile</span>
	</li>
	<li className="flex items-start gap-2">
		<div className="w-5 h-5 rounded-full bg-[#148F8B] flex items-center justify-center shrink-0 mt-0.5">
			<Check size={12} className="text-white" strokeWidth={3} />
		</div>
		<span>Talk TO the camera like it's a person, not AT it like a presentation</span>
	</li>
	<li className="flex items-start gap-2">
		<div className="w-5 h-5 rounded-full bg-[#148F8B] flex items-center justify-center shrink-0 mt-0.5">
			<Check size={12} className="text-white" strokeWidth={3} />
		</div>
		<span>You have 60 seconds to let yourself shine!</span>
	</li>
	<li className="flex items-start gap-2">
		<div className="w-5 h-5 rounded-full bg-[#148F8B] flex items-center justify-center shrink-0 mt-0.5">
			<Check size={12} className="text-white" strokeWidth={3} />
		</div>
		<span>Showcase why they would want to work with you</span>
	</li>
</ul>
								</div>
								<div className="grid gap-3">
									<button
										type="button"
										onClick={openRecordView}
										className="flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-[#148F8B] bg-[#148F8B] text-white font-black hover:bg-[#136068] transition-colors shadow-lg shadow-[#148F8B]/20"
									>
										<Camera aria-hidden="true" size={24} />
										Record with Camera
									</button>
									<label className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-gray-200 bg-[#F3EAF5]/30 text-gray-800 font-bold hover:border-[#148F8B]/40 hover:bg-[#148F8B]/5 cursor-pointer transition-colors">
										<span className="flex items-center gap-3">
											<Upload size={24} className="text-[#148F8B]" />
											Upload Video File
										</span>
										<span className="text-xs font-medium text-gray-500 normal-case">
											Max size: 50 MB · up to 60 seconds
										</span>
										<input
											type="file"
											accept={ACCEPT_VIDEO}
											className="hidden"
											onChange={handleFileSelect}
										/>
									</label>
								</div>
							</>
						)}

						{step === "record" && (
							<div className="flex flex-col min-h-0 flex-1">
								{!isRecording ? (
									<>
										<p
											className="text-sm font-medium text-center shrink-0"
											style={{ color: "#374151" }}
										>
											Get ready, then press the red button below when
											you&apos;re ready to record.
										</p>
										<div className="p-3 rounded-xl bg-[#148F8B]/8 border border-[#148F8B]/20 space-y-1.5 shrink-0">
											<p className="text-[10px] font-black text-[#148F8B] uppercase tracking-widest">
												Tips
											</p>
											<ul className="space-y-2 text-sm text-gray-700 font-medium">
	<li className="flex items-start gap-2">
		<div className="w-5 h-5 rounded-full bg-[#148F8B] flex items-center justify-center shrink-0 mt-0.5">
			<Check size={12} className="text-white" strokeWidth={3} />
		</div>
		<span>Be yourself!</span>
	</li>
	<li className="flex items-start gap-2">
		<div className="w-5 h-5 rounded-full bg-[#148F8B] flex items-center justify-center shrink-0 mt-0.5">
			<Check size={12} className="text-white" strokeWidth={3} />
		</div>
		<span>Say exactly what you're looking for</span>
	</li>
	<li className="flex items-start gap-2">
		<div className="w-5 h-5 rounded-full bg-[#148F8B] flex items-center justify-center shrink-0 mt-0.5">
			<Check size={12} className="text-white" strokeWidth={3} />
		</div>
		<span>Talk about things the employer can't find in your profile</span>
	</li>
	<li className="flex items-start gap-2">
		<div className="w-5 h-5 rounded-full bg-[#148F8B] flex items-center justify-center shrink-0 mt-0.5">
			<Check size={12} className="text-white" strokeWidth={3} />
		</div>
		<span>Talk TO the camera like it's a person, not AT it like a presentation</span>
	</li>
	<li className="flex items-start gap-2">
		<div className="w-5 h-5 rounded-full bg-[#148F8B] flex items-center justify-center shrink-0 mt-0.5">
			<Check size={12} className="text-white" strokeWidth={3} />
		</div>
		<span>You have 60 seconds to let yourself shine!</span>
	</li>
	<li className="flex items-start gap-2">
		<div className="w-5 h-5 rounded-full bg-[#148F8B] flex items-center justify-center shrink-0 mt-0.5">
			<Check size={12} className="text-white" strokeWidth={3} />
		</div>
		<span>Showcase why they would want to work with you</span>
	</li>
  <li className="flex items-start gap-2">
	<div className="w-5 h-5 rounded-full bg-[#148F8B] flex items-center justify-center shrink-0 mt-0.5">
		<Check size={12} className="text-white" strokeWidth={3} />
	</div>
	<span>Find a quiet space with a simple background</span>
</li>
</ul>
										</div>
										<div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden relative shrink-0 min-h-0">
											<video
												ref={videoPreviewRef}
												autoPlay
												muted
												playsInline
												className="w-full h-full object-cover"
											/>
										</div>
									</>
								) : (
									<>
										<p className="text-xs font-medium text-gray-500 text-center">
											Recording stops automatically at 60 seconds.
										</p>
										<div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden relative">
											<video
												ref={videoPreviewRef}
												autoPlay
												muted
												playsInline
												className="w-full h-full object-cover"
											/>
											<div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
												<span 
		className="text-white font-black text-xl px-4 py-2 shadow-xl" 
		style={{
			backgroundColor: "rgba(0, 0, 0, 0.5)",
			backdropFilter: "blur(8px)",
			borderRadius: "12px",
			border: "2px solid rgba(255, 255, 255, 0.2)",
			textShadow: "0 2px 4px rgba(0,0,0,0.8)",
		} as React.CSSProperties}
                        >
													{Math.floor((MAX_DURATION - elapsed) / 60)}:
													{String((MAX_DURATION - elapsed) % 60).padStart(
														2,
														"0",
													)}{" "}
													left
												</span>
												<button
													type="button"
													onClick={stopRecording}
													className="px-5 py-2.5 rounded-xl font-bold transition-colors border-2 border-red-700 shadow-xl"
													style={{
														backgroundColor: "#dc2626",
														color: "#ffffff",
													}}
												>
													Stop
												</button>
											</div>
										</div>
										{elapsed >= MAX_DURATION && (
											<p className="text-center text-gray-500 text-sm font-medium">
												Recording stopped at 60 seconds.
											</p>
										)}
									</>
								)}
							</div>
						)}

						{step === "preview" && previewBlob && (
							<div className="space-y-4">
								<div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden">
									<video
										src={previewObjectUrl || undefined}
										controls
										className="w-full h-full object-contain"
									/>
								</div>
								<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-gray-600">
									<span>Duration: {previewBlob.duration}s</span>
									<span>Size: {formatBytes(previewBlob.blob.size)}</span>
									{previewBlob.blob.size > MAX_FILE_BYTES && (
										<span className="text-red-500">Max 50 MB</span>
									)}
								</div>
								<div className="space-y-2">
									<p className="text-sm font-medium text-gray-700">
										Choose thumbnail frame
									</p>
									<div className="flex gap-3 items-center">
										<input
											type="range"
											min={0}
											max={Math.max(0, previewBlob.duration - 0.5)}
											step={0.5}
											value={thumbnailTimeSeconds}
											aria-label="Choose thumbnail frame time"
											onChange={(e) =>
												setThumbnailTimeSeconds(Number(e.target.value))
											}
											className="flex-1 h-2 rounded-lg appearance-none bg-gray-200 accent-[#148F8B]"
										/>
										<span className="text-sm font-medium text-gray-600 tabular-nums shrink-0">
											{thumbnailTimeSeconds.toFixed(1)}s
										</span>
									</div>
									{thumbnailPreviewUrl && (
										<div className="flex items-center gap-2">
											<span className="text-xs text-gray-500">Preview:</span>
											<img
												src={thumbnailPreviewUrl}
												alt="Thumbnail preview"
												className="h-14 w-auto rounded-lg border border-gray-200 object-contain bg-gray-100"
											/>
										</div>
									)}
								</div>
								{previewBlob.duration <= MAX_DURATION ? (
									<div className="flex gap-3">
										<button
											type="button"
											onClick={async () => {
												setRecordedBlob(null);
												setRecordedDuration(0);
												setUploadFile(null);
												setUploadDuration(0);
												if (uploadFile) {
													setStep("choose");
												} else {
													await openRecordView();
												}
											}}
											className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
										>
											{uploadFile ? "Choose different file" : "Re-record"}
										</button>
										<button
											type="button"
											onClick={uploadAndComplete}
											className="flex-1 py-3 rounded-xl bg-[#148F8B] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#136068] disabled:opacity-50 transition-colors"
										>
											<>
												<Save aria-hidden="true" size={20} />
												Save
											</>
										</button>
									</div>
								) : (
									<button
										type="button"
										onClick={async () => {
											setRecordedBlob(null);
											setRecordedDuration(0);
											setUploadFile(null);
											setUploadDuration(0);
											if (uploadFile) {
												setStep("choose");
											} else {
												await openRecordView();
											}
										}}
										className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
									>
										{uploadFile ? "Choose different file" : "Re-record"} (up to
										60 seconds)
									</button>
								)}
							</div>
						)}

						{error && (
							<div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium">
								<AlertCircle size={18} className="shrink-0" />
								{error}
							</div>
						)}
					</div>
					{step === "record" && !isRecording && (
						<div className="shrink-0 p-6 pt-0 border-t border-gray-200 bg-white">
							<button
								type="button"
								onClick={startCapture}
								className="w-full py-4 rounded-2xl font-black transition-colors flex items-center justify-center gap-2 shadow-lg border-2 border-red-700"
								style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
							>
								<Camera aria-hidden="true" size={22} />
								Start recording
							</button>
						</div>
					)}
				</div>
			</div>
		</div>,
		document.body,
	);
};
