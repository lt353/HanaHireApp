import React, { useRef, useState } from "react";
import { Sparkles, Upload, Loader2, X } from "lucide-react";
import { Button } from "../ui/Button.tsx";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-9b95b3f5`;

export type SeekerResumeDraft = {
	/** From resume header — used on sign-up only; omitted from onboarding profile payload. */
	fullName?: string;
	email?: string;
	phone?: string;
	bio: string;
	skills: string[];
	experience: string;
	availability: string;
	education: string[];
	industries: string[];
	workStyles: string[];
	jobTypesSeeking: string[];
	preferredJobCategories: string[];
	targetPay: string[];
	location: string;
	displayTitle: string;
	introVideoSuggestions: string[];
	/** Concrete titles from work history — shown as hints on onboarding. */
	suggestedJobTitles?: string[];
};

type Props = {
	variant: "primary" | "secondary";
	/** Second arg is the uploaded file name (for success UI in sign-up). */
	onApplied: (draft: SeekerResumeDraft, fileName: string) => void;
	onSkip: () => void;
};

export const SeekerResumeImportCard: React.FC<Props> = ({
	variant,
	onApplied,
	onSkip,
}) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);

	const runImport = async (file: File) => {
		setError(null);
		setLoading(true);
		setFileName(file.name);
		try {
			const fd = new FormData();
			fd.append("file", file);
			const res = await fetch(`${API_BASE}/seeker-resume-import`, {
				method: "POST",
				headers: {
					apikey: publicAnonKey,
					authorization: `Bearer ${publicAnonKey}`,
				},
				body: fd,
			});
			const json = await res.json().catch(() => ({}));
			if (!res.ok) {
				const msg = [json?.error, json?.details]
					.filter(Boolean)
					.join(" — ");
				throw new Error(msg || `Import failed (${res.status})`);
			}
			const draft = json?.draft as SeekerResumeDraft | undefined;
			if (!draft || typeof draft !== "object") {
				throw new Error("Invalid response from server");
			}
			onApplied(draft, file.name);
		} catch (e: any) {
			setError(e?.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	const primary =
		variant === "primary"
			? "border-2 border-[#148F8B]/30 bg-gradient-to-br from-[#148F8B]/8 to-[#A63F8E]/5 shadow-md"
			: "border border-gray-200 bg-white shadow-sm";

	return (
		<div
			className={`rounded-[2rem] p-6 space-y-4 ${primary}`}
			data-variant={variant}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="flex items-center gap-3 min-w-0">
					<div className="w-12 h-12 rounded-xl bg-[#148F8B]/15 flex items-center justify-center shrink-0">
						<Sparkles className="w-6 h-6 text-[#148F8B]" aria-hidden />
					</div>
					<div className="min-w-0">
						<h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.28em]">
							AI profile import
						</h2>
						<p className="text-sm font-bold text-gray-900 mt-1">
							{variant === "primary"
								? "Upload your resume — we’ll fill what we can"
								: "Try resume import — fills your profile below"}
						</p>
						<p className="text-xs text-gray-500 mt-1 font-medium">
							PDF or Word (.docx). Nothing is stored on our servers; your file is
							processed and discarded.
						</p>
					</div>
				</div>
				<button
					type="button"
					onClick={onSkip}
					className="shrink-0 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
					aria-label="Skip for now"
				>
					<X size={18} />
				</button>
			</div>

			<input
				ref={inputRef}
				type="file"
				accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
				className="hidden"
				onChange={(e) => {
					const f = e.target.files?.[0];
					e.target.value = "";
					if (f) void runImport(f);
				}}
			/>

			<div className="flex flex-col sm:flex-row gap-3 sm:items-center">
				<Button
					type="button"
					disabled={loading}
					onClick={() => inputRef.current?.click()}
					className="rounded-xl bg-[#148F8B] hover:bg-[#148F8B]/90 text-white font-black text-xs uppercase tracking-widest"
				>
					{loading ? (
						<>
							<Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
							Reading…
						</>
					) : (
						<>
							<Upload className="w-4 h-4 mr-2 inline" />
							Choose PDF or DOCX
						</>
					)}
				</Button>
				<button
					type="button"
					onClick={onSkip}
					className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600"
				>
					Skip for now
				</button>
			</div>

			{fileName && !error && !loading && (
				<p className="text-[10px] text-gray-400 font-medium">Last file: {fileName}</p>
			)}

			{error && (
				<p className="text-sm text-red-600 font-medium" role="alert">
					{error}
				</p>
			)}
		</div>
	);
};
