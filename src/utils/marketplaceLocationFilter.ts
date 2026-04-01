import { LOCATIONS_BY_ISLAND } from "../data/mockData";

export function normalizeLocationText(value: string): string {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[ʻ’']/g, "")
    .replace(/[^a-z0-9,\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const normalizedIslandEntries = Object.entries(LOCATIONS_BY_ISLAND).map(
  ([islandName, towns]) => ({
    islandName,
    normalizedIsland: normalizeLocationText(islandName),
    normalizedTowns: towns.map((t) => normalizeLocationText(t)),
  })
);

function getIslandFromLocation(locationValue?: string): string {
  const normalized = normalizeLocationText(locationValue || "");
  if (!normalized) return "";
  for (const entry of normalizedIslandEntries) {
    if (normalized.includes(entry.normalizedIsland)) return entry.islandName;
    if (entry.normalizedTowns.some((town) => normalized.includes(town)))
      return entry.islandName;
  }
  return "";
}

function levenshteinDistance(a: string, b: string): number {
  if (!a) return b.length;
  if (!b) return a.length;
  const dp = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[a.length][b.length];
}

function isLikelyTypoMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  const dist = levenshteinDistance(a, b);
  if (a.length <= 4 || b.length <= 4) return dist <= 1;
  return dist <= 2;
}

export type LocationFilterParams = {
  selectedLocations: string[];
  islandFilters: string[];
};

/**
 * Returns a function that tests whether a job/candidate location string matches
 * the current island and location-chip filters.
 */
export function createLocationMatcher(params: LocationFilterParams) {
  const { selectedLocations, islandFilters } = params;

  return function locationMatchesFilters(recordLocation?: string): boolean {
    // With no location/island filters selected, show every row (including blank locations).
    // Previously we required a non-empty location string, which hid most of the pool.
    if (islandFilters.length === 0 && selectedLocations.length === 0) {
      return true;
    }

    const normalizedRecord = normalizeLocationText(recordLocation || "");
    if (!normalizedRecord) return false;

    if (islandFilters.length > 0) {
      const recordIsland = getIslandFromLocation(recordLocation);
      const islandMatch = islandFilters.some(
        (selectedIsland) =>
          normalizeLocationText(selectedIsland) ===
          normalizeLocationText(recordIsland)
      );
      if (!islandMatch) return false;
    }

    if (selectedLocations.length === 0) return true;

    const recordParts = normalizedRecord
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    const recordTokens = normalizedRecord.split(/\s+|,/).filter(Boolean);

    return selectedLocations.some((selectedLocation) => {
      const normalizedSelected = normalizeLocationText(selectedLocation);
      if (!normalizedSelected) return false;

      if (
        normalizedRecord === normalizedSelected ||
        normalizedRecord.includes(normalizedSelected) ||
        normalizedSelected.includes(normalizedRecord)
      ) {
        return true;
      }

      const selectedParts = normalizedSelected
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      if (
        selectedParts.length > 0 &&
        selectedParts.every((part) => normalizedRecord.includes(part))
      ) {
        return true;
      }
      if (
        recordParts.length > 0 &&
        recordParts.every((part) => normalizedSelected.includes(part))
      ) {
        return true;
      }

      const selectedTokens = normalizedSelected.split(/\s+|,/).filter(Boolean);
      if (selectedTokens.length === 0) return false;

      return selectedTokens.every((selectedToken) =>
        recordTokens.some(
          (recordToken) =>
            recordToken === selectedToken ||
            recordToken.includes(selectedToken) ||
            selectedToken.includes(recordToken) ||
            isLikelyTypoMatch(recordToken, selectedToken)
        )
      );
    });
  };
}
