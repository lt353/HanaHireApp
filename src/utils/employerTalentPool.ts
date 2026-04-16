/** Per-job employer ↔ candidate scope (reviews, shortlists). `jobId` null = legacy global row. */
export function employerScopeKey(
	candidateId: number,
	jobId: number | null | undefined,
) {
	return `${Number(candidateId)}:${jobId == null ? "null" : Number(jobId)}`;
}

export function resolveTalentPoolReview(
	map: Record<string, any>,
	candidateId: number,
	jobId: number | null | undefined,
) {
	if (jobId != null && Number.isFinite(Number(jobId))) {
		const scoped = map[employerScopeKey(candidateId, jobId)];
		if (scoped) return scoped;
	}
	return map[employerScopeKey(candidateId, null)] ?? null;
}

export function candidateHasAnyShortlistKey(
	keys: Record<string, boolean>,
	candidateId: number,
) {
	const prefix = `${Number(candidateId)}:`;
	for (const k of Object.keys(keys)) {
		if (keys[k] && k.startsWith(prefix)) return true;
	}
	return false;
}

export function employerShortlistActiveForContext(
	keys: Record<string, boolean>,
	candidateId: number,
	jobId: number | null | undefined,
) {
	if (!Number.isFinite(candidateId)) return false;
	const j =
		jobId != null && Number.isFinite(Number(jobId)) ? Number(jobId) : null;
	if (keys[employerScopeKey(candidateId, j)]) return true;
	// Legacy global row (job_id NULL) only applies when no specific job is in context.
	if (j == null && keys[employerScopeKey(candidateId, null)]) return true;
	return false;
}

/** Job scope for shortlist/review when opening the employer candidate modal. */
export function employerModalReviewJobId(candidate: any): number | null {
	if (candidate?.application?.job_id != null)
		return Number(candidate.application.job_id);
	if (candidate?._employerReviewJobId != null)
		return Number(candidate._employerReviewJobId);
	return null;
}

export function employerModalShortlistActive(
	candidate: any,
	keys: Record<string, boolean>,
	fallbackCandidateIds: number[],
) {
	const cid = Number(candidate?.id);
	if (!Number.isFinite(cid)) return false;
	const j = employerModalReviewJobId(candidate);
	return (
		employerShortlistActiveForContext(keys, cid, j) ||
		(j == null &&
			Object.keys(keys).length === 0 &&
			fallbackCandidateIds.includes(cid))
	);
}

/** Prefer in-memory review from the open modal when it matches the current job scope. */
export function modalTalentPoolReviewRow(
	candidate: any,
	reviewsMap: Record<string, any>,
): any | null {
	if (candidate?.application) return null;
	const cid = Number(candidate?.id);
	if (!Number.isFinite(cid)) return null;
	const j = employerModalReviewJobId(candidate);
	const local = candidate?.employer_candidate_review;
	if (local) {
		const lj = local.job_id != null ? Number(local.job_id) : null;
		if (lj === j || (lj == null && j == null)) return local;
	}
	return resolveTalentPoolReview(reviewsMap, cid, j);
}

/** Shortlist chip for applicants: never use global ID list when a job is in context. */
export function employerModalApplicantShortlisted(
	candidate: any,
	keys: Record<string, boolean>,
	fallbackCandidateIds: number[],
) {
	const cid = Number(candidate?.id);
	if (!Number.isFinite(cid)) return false;
	const j = employerModalReviewJobId(candidate);
	return (
		candidate?.status === "shortlisted" ||
		employerShortlistActiveForContext(keys, cid, j) ||
		(j == null &&
			Object.keys(keys).length === 0 &&
			fallbackCandidateIds.includes(cid))
	);
}

/**
 * Shortlist chip for talent pool: pool review status wins over stale shortlist rows
 * (e.g. after marking reviewed, shortlist row should be gone — if not, still hide chip).
 */
export function employerModalTalentPoolShortlisted(
	candidate: any,
	keys: Record<string, boolean>,
	fallbackCandidateIds: number[],
	reviewsMap: Record<string, any>,
) {
	const pool = modalTalentPoolReviewRow(candidate, reviewsMap);
	if (pool?.status === "shortlisted") return true;
	if (
		pool?.status === "reviewed" ||
		pool?.status === "rejected" ||
		pool?.status === "hired"
	) {
		return false;
	}
	return employerModalShortlistActive(candidate, keys, fallbackCandidateIds);
}

export function employerModalShowShortlistedChip(
	candidate: any,
	keys: Record<string, boolean>,
	fallbackCandidateIds: number[],
	reviewsMap: Record<string, any>,
) {
	if (candidate?.application) {
		return employerModalApplicantShortlisted(
			candidate,
			keys,
			fallbackCandidateIds,
		);
	}
	return employerModalTalentPoolShortlisted(
		candidate,
		keys,
		fallbackCandidateIds,
		reviewsMap,
	);
}

/** Non-shortlist pipeline label for talent-pool modal (reviewed / hired / rejected). */
export function employerModalTalentPoolPipelineChip(
	candidate: any,
	reviewsMap: Record<string, any>,
): { label: string; className: string } | null {
	if (candidate?.application) return null;
	const row = modalTalentPoolReviewRow(candidate, reviewsMap);
	const s = row?.status as string | undefined;
	if (!s || s === "pending" || s === "shortlisted") return null;
	const styles: Record<string, string> = {
		reviewed:
			"bg-[#148F8B]/10 text-[#148F8B] border border-[#148F8B]/20",
		rejected: "bg-gray-100 text-gray-500 border border-gray-200",
		hired: "bg-emerald-100 text-emerald-700 border border-emerald-100",
	};
	const className = styles[s] ?? "bg-gray-100 text-gray-700 border border-gray-200";
	return { label: s, className };
}
