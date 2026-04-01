/**
 * Employer talent pool: require intro video + the same core fields as seeker onboarding.
 * Candidate rows always exist for login/editing; pool visibility is stricter.
 */

export function hasIntroVideoUrl(videoUrl: string | null | undefined): boolean {
  return typeof videoUrl === "string" && videoUrl.trim().length > 0;
}

function hasMeaningfulExperience(yearsExperience: unknown): boolean {
  if (yearsExperience == null) return false;
  if (typeof yearsExperience === "number" && !Number.isNaN(yearsExperience)) return true;
  if (typeof yearsExperience === "string" && yearsExperience.trim().length > 0) {
    const n = parseInt(yearsExperience, 10);
    return !Number.isNaN(n);
  }
  return false;
}

export type CandidatePoolEligibilityInput = {
  video_url?: string | null;
  videoUrl?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  location?: string | null;
  industries_interested?: string[] | null;
  industries?: string[] | null;
  availability?: string | null;
  preferred_pay_range?: string | null;
  targetPay?: string | null;
  preferred_job_categories?: string[] | null;
  preferredJobCategories?: string[] | null;
  job_types_seeking?: string[] | null;
  jobTypesSeeking?: string[] | null;
  years_experience?: number | string | null;
  experience?: string | number | null;
};

/**
 * True when the candidate should appear in the employer talent pool.
 * Keep `is_profile_complete` in Supabase in sync with this on every write.
 */
export function candidateMeetsTalentPoolRequirements(
  c: CandidatePoolEligibilityInput
): boolean {
  const video = c.video_url ?? c.videoUrl;
  if (!hasIntroVideoUrl(video)) return false;
  if (!(c.bio ?? "").trim()) return false;
  const skills = c.skills ?? [];
  if (!Array.isArray(skills) || skills.length === 0) return false;
  if (!(c.location ?? "").trim()) return false;
  const industries = c.industries_interested ?? c.industries ?? [];
  if (!Array.isArray(industries) || industries.length === 0) return false;
  if (!(c.availability ?? "").trim()) return false;

  const pay =
    (typeof c.preferred_pay_range === "string" && c.preferred_pay_range.trim()) ||
    (typeof c.targetPay === "string" && c.targetPay.trim()) ||
    "";
  if (!pay) return false;

  const jobCats = c.preferred_job_categories ?? c.preferredJobCategories ?? [];
  if (!Array.isArray(jobCats) || jobCats.length === 0) return false;

  const jobTypes = c.job_types_seeking ?? c.jobTypesSeeking ?? [];
  if (!Array.isArray(jobTypes) || jobTypes.length === 0) return false;

  const years = c.years_experience ?? c.experience;
  if (!hasMeaningfulExperience(years)) return false;

  return true;
}

/** Narrow row from Supabase / API to eligibility input. */
export function rowToPoolEligibilityInput(row: Record<string, unknown>): CandidatePoolEligibilityInput {
  return {
    video_url: row.video_url as string | null,
    bio: row.bio as string | null,
    skills: row.skills as string[] | null,
    location: row.location as string | null,
    industries_interested: row.industries_interested as string[] | null,
    availability: row.availability as string | null,
    preferred_pay_range: row.preferred_pay_range as string | null,
    preferred_job_categories: row.preferred_job_categories as string[] | null,
    job_types_seeking: row.job_types_seeking as string[] | null,
    years_experience: row.years_experience as number | null,
  };
}
