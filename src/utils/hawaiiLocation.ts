import { LOCATIONS_BY_ISLAND } from "../data/mockData";

/** Internal token (never persist to DB) meaning “manual town selected, user still typing”. */
export const HAWAII_LOCATION_MANUAL_TOKEN = "__manual__";

export function normalizeHawaiiLocationMatch(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[ʻ''']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export type ParsedHawaiiLocation = {
  island: string;
  /** List town name, "" (not chosen), or HAWAII_LOCATION_MANUAL_TOKEN */
  area: string;
  /** Custom town text when area is manual (never the internal token) */
  otherTown: string;
};

/**
 * Parse a stored location for UI (signup / onboarding pickers).
 * Supports: "Town, Island", island-only, legacy "Town, HI", custom "Village, Island",
 * and internal " __manual__, Island" while the user types manual town.
 */
export function parseHawaiiLocationString(location: string): ParsedHawaiiLocation {
  if (!location.trim()) {
    return { island: "", area: "", otherTown: "" };
  }
  const locNorm = normalizeHawaiiLocationMatch(location);
  const parts = location.split(",").map((p) => p.trim()).filter(Boolean);

  if (parts.length >= 2) {
    const maybeArea = parts[0];
    const maybeIsland = parts.slice(1).join(", ").trim();

    if (
      maybeArea === HAWAII_LOCATION_MANUAL_TOKEN &&
      LOCATIONS_BY_ISLAND[maybeIsland]
    ) {
      return {
        island: maybeIsland,
        area: HAWAII_LOCATION_MANUAL_TOKEN,
        otherTown: "",
      };
    }

    if (LOCATIONS_BY_ISLAND[maybeIsland]) {
      const matchArea = LOCATIONS_BY_ISLAND[maybeIsland].find(
        (a) => normalizeHawaiiLocationMatch(a) === normalizeHawaiiLocationMatch(maybeArea),
      );
      if (matchArea) {
        return { island: maybeIsland, area: matchArea, otherTown: "" };
      }
      return {
        island: maybeIsland,
        area: HAWAII_LOCATION_MANUAL_TOKEN,
        otherTown: maybeArea,
      };
    }
  }

  if (parts.length === 1) {
    const sole = parts[0];
    for (const isl of Object.keys(LOCATIONS_BY_ISLAND)) {
      if (normalizeHawaiiLocationMatch(sole) === normalizeHawaiiLocationMatch(isl)) {
        return { island: isl, area: "", otherTown: "" };
      }
    }
  }

  for (const [isl, areas] of Object.entries(LOCATIONS_BY_ISLAND)) {
    for (const a of areas) {
      const aNorm = normalizeHawaiiLocationMatch(a);
      if (aNorm.length >= 2 && locNorm.includes(aNorm)) {
        return { island: isl, area: a, otherTown: "" };
      }
    }
  }

  for (const isl of Object.keys(LOCATIONS_BY_ISLAND)) {
    const islNorm = normalizeHawaiiLocationMatch(isl);
    if (islNorm.length >= 2 && locNorm.includes(islNorm)) {
      const guessTown = parts.length >= 2 ? parts[0] : "";
      return {
        island: isl,
        area: HAWAII_LOCATION_MANUAL_TOKEN,
        otherTown: guessTown || "",
      };
    }
  }

  return { island: "", area: "", otherTown: location };
}

/** True when user chose manual entry but has not typed a town yet (internal sentinel only). */
export function isIncompleteManualHawaiiLocation(location: string): boolean {
  const p = parseHawaiiLocationString(location);
  return p.area === HAWAII_LOCATION_MANUAL_TOKEN && !p.otherTown.trim();
}
