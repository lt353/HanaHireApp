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
