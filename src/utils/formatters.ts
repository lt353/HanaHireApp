/**
 * Parse a timestamp from Supabase/API as UTC so it displays correctly in the user's local timezone.
 * Supabase often returns timestamptz without "Z" (e.g. "2025-03-15T22:24:00.000000"), and JS then
 * parses that as local time, which shows the wrong time (e.g. 10:24 PM instead of 12:24 PM in HST).
 */
export function parseUtcTimestamp(value: string | null | undefined): Date | null {
  if (value == null || value === "") return null;
  const s = String(value).trim();
  if (!s) return null;
  const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(s);
  const normalized = hasTimezone ? s : s.replace(/\.\d+$/, "").replace(" ", "T") + "Z";
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format phone as (XXX) XXX-XXXX. Input: raw string (digits or existing formatted). Output: formatted, max 10 digits. */
export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// Utility function to format candidate titles based on Supabase table fields
export const formatCandidateTitle = (candidate: any): string => {
  if (!candidate) return "Verified Talent";

  // 1. If display_title is explicitly provided in the DB, use it
  if (candidate.display_title) {
    return candidate.display_title;
  }

  // 2. Otherwise, construct from title components
  const descriptor = candidate.title_descriptor || "";
  const primary = candidate.title_primary_skill || candidate.profession || "";
  const secondary = candidate.title_secondary_skill || "";

  if (descriptor || primary || secondary) {
    const parts = [descriptor, primary];
    const mainTitle = parts.filter(Boolean).join(" ");
    
    if (secondary) {
      return `${mainTitle} & ${secondary}`;
    }
    return mainTitle || "Professional Talent";
  }

  // 3. Fallback logic for legacy or missing data
  const years = typeof candidate.years_experience === 'string' 
    ? parseInt(candidate.years_experience, 10) 
    : (candidate.years_experience || 0);
  
  let experienceLevel = 'Professional';
  if (years >= 5) experienceLevel = 'Experienced';
  else if (years >= 2) experienceLevel = 'Intermediate';
  else if (years > 0) experienceLevel = 'Entry-Level';

  const skills = Array.isArray(candidate.skills) ? candidate.skills : [];
  const fallbackPrimary = skills[0] || "Specialist";
  
  return `${experienceLevel} ${fallbackPrimary}`;
};
