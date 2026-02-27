/**
 * Maps jobs.job_category (DB value) to slug, styles (background, border, badge), and illustration path.
 * SVG paths: public/job-categories/{slug}.svg or custom path for Education/Fitness & Recreation.
 */

export const JOB_CATEGORY_TO_SLUG: Record<string, string> = {
  "Food Service": "food-service",
  "Retail & Sales": "retail-sales",
  "Customer Service": "customer-service",
  "Hospitality Services": "hospitality-services",
  "Tourism & Recreation": "tourism-recreation",
  "Trades & Construction": "trades-construction",
  "Office & Admin": "office-admin",
  "Accounting & Finance": "accounting-finance",
  "Healthcare & Wellness": "healthcare-wellness",
  "Marketing & Creative": "marketing-creative",
  "Tech & IT": "tech-it",
  "Management & Leadership": "management-leadership",
  "Maintenance & Facilities": "maintenance-facilities",
  "Transportation & Logistics": "transportation-logistics",
  "Education": "education",
  "Fitness & Recreation": "fitness-recreation",
};

/** Custom illustration path (relative to base, no leading slash). If set, used instead of job-categories/{slug}.svg */
const CUSTOM_SVG_PATHS: Record<string, string> = {
  "Education": "illustrations/education.svg",
  "Fitness & Recreation": "illustrations/fitness-recreation.svg",
};

type CategoryStyleEntry = {
  background: string;
  borderColor: string;
  badgeBackground?: string;
  textColor?: string;
};

const STYLES: Record<string, CategoryStyleEntry> = {
  "Food Service": { background: "rgba(255, 107, 74, 0.08)", borderColor: "#FF6B4A" },
  "Retail & Sales": { background: "rgba(251, 146, 60, 0.08)", borderColor: "#FB923C" },
  "Customer Service": { background: "rgba(20, 184, 166, 0.08)", borderColor: "#14B8A6" },
  "Hospitality Services": { background: "rgba(16, 185, 129, 0.08)", borderColor: "#10B981" },
  "Tourism & Recreation": { background: "rgba(14, 165, 233, 0.08)", borderColor: "#0EA5E9" },
  "Trades & Construction": { background: "rgba(71, 85, 105, 0.08)", borderColor: "#475569" },
  "Office & Admin": { background: "rgba(30, 64, 175, 0.08)", borderColor: "#1E40AF" },
  "Accounting & Finance": { background: "rgba(79, 70, 229, 0.08)", borderColor: "#4F46E5" },
  "Healthcare & Wellness": { background: "rgba(6, 182, 212, 0.08)", borderColor: "#06B6D4" },
  "Marketing & Creative": { background: "rgba(217, 70, 239, 0.08)", borderColor: "#D946EF" },
  "Tech & IT": { background: "rgba(0, 102, 255, 0.08)", borderColor: "#0066FF" },
  "Management & Leadership": { background: "rgba(139, 92, 246, 0.08)", borderColor: "#8B5CF6" },
  "Maintenance & Facilities": { background: "rgba(100, 116, 139, 0.08)", borderColor: "#64748B" },
  "Transportation & Logistics": { background: "rgba(5, 150, 105, 0.08)", borderColor: "#059669" },
  "Education": {
    background: "rgba(245, 158, 11, 0.08)",
    borderColor: "#F59E0B",
    badgeBackground: "rgba(245, 158, 11, 0.15)",
    textColor: "#D97706",
  },
  "Fitness & Recreation": {
    background: "rgba(236, 72, 153, 0.08)",
    borderColor: "#EC4899",
    badgeBackground: "rgba(236, 72, 153, 0.15)",
    textColor: "#DB2777",
  },
};

export interface JobCategoryStyle {
  background: string;
  borderColor: string;
  svgPath: string;
  /** For category badge; fallback to borderColor-based style if not set */
  badgeBackground?: string;
  textColor?: string;
}

const DEFAULT_STYLE: JobCategoryStyle = {
  background: "rgba(243, 234, 245, 0.3)",
  borderColor: "#e5e7eb",
  svgPath: "",
};

/** Normalize for lookup: DB/UI may store "TRADES & CONSTRUCTION" or "Trades & Construction". */
function normalizeCategory(value: string): string {
  return value.trim().toLowerCase();
}

const SLUG_BY_NORMALIZED: Record<string, string> = {};
const STYLES_BY_NORMALIZED: Record<string, CategoryStyleEntry> = {};
const KEY_BY_NORMALIZED: Record<string, string> = {};
for (const key of Object.keys(JOB_CATEGORY_TO_SLUG)) {
  const n = normalizeCategory(key);
  SLUG_BY_NORMALIZED[n] = JOB_CATEGORY_TO_SLUG[key];
  STYLES_BY_NORMALIZED[n] = STYLES[key];
  KEY_BY_NORMALIZED[n] = key;
}

/**
 * Returns style and SVG path for a job's job_category. Use for card background, left border, badge, and illustration.
 */
export function getJobCategoryStyle(jobCategory: string | null | undefined): JobCategoryStyle {
  if (!jobCategory || typeof jobCategory !== "string") return DEFAULT_STYLE;
  const normalized = normalizeCategory(jobCategory);
  const slug = SLUG_BY_NORMALIZED[normalized];
  const style = STYLES_BY_NORMALIZED[normalized];
  if (!slug || !style) return DEFAULT_STYLE;
  const originalKey = KEY_BY_NORMALIZED[normalized];
  const customPath = originalKey ? CUSTOM_SVG_PATHS[originalKey] : undefined;
  const svgPath = customPath ?? `job-categories/${slug}.svg`;
  return {
    ...style,
    /** Path relative to base (no leading slash). Use: import.meta.env.BASE_URL + svgPath */
    svgPath,
  };
}

/**
 * Returns only the SVG path for a job_category (e.g. for <img src={...} />).
 */
export function getJobCategorySvgPath(jobCategory: string | null | undefined): string {
  return getJobCategoryStyle(jobCategory).svgPath;
}
