export function getEducationRank(edu: string): number {
  if (!edu) return -1;
  if (edu.includes("Doctorate")) return 5;
  if (edu.includes("Master")) return 4;
  if (edu.includes("Bachelor")) return 3;
  if (edu.includes("Associate")) return 2;
  if (edu.includes("Vocational")) return 1;
  if (edu.includes("High School")) return 0;
  return -1;
}

export function matchesEducation(
  candidateEdu: string,
  selectedLevels: string[]
): boolean {
  if (selectedLevels.length === 0) return true;
  const candidateRank = getEducationRank(candidateEdu);
  return selectedLevels.some((level) => {
    const filterRank = getEducationRank(level);
    return candidateRank >= filterRank;
  });
}

export function matchesExperience(
  years: number | string,
  levels: string[]
): boolean {
  if (levels.length === 0) return true;

  let y = 0;
  if (typeof years === "number") {
    y = years;
  } else if (typeof years === "string") {
    const match = years.match(/\d+/);
    y = match ? parseInt(match[0], 10) : 0;
  }

  return levels.some((level) => {
    if (level === "0-2 years") return y <= 2;
    if (level === "2-5 years") return y > 2 && y <= 5;
    if (level === "5-10 years") return y > 5 && y <= 10;
    if (level === "10+ years") return y > 10;
    return false;
  });
}
