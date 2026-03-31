import { INDUSTRIES } from "./industries";
import { SKILLS } from "./skills";
import type { LabeledStringGroup } from "./optionGroups";
import { flattenLabeledGroups } from "./optionGroups";

export { INDUSTRIES_BY_GROUP, type Industry } from "./industries";
export { SKILLS_BY_GROUP } from "./skills";
export type { LabeledStringGroup } from "./optionGroups";

export const INTERACTION_FEE = 2.0;

const JOB_PAY_RANGES_BY_GROUP: LabeledStringGroup[] = [
  {
    label: "Hourly",
    items: [
      "$15-18/hr",
      "$18-22/hr",
      "$20-25/hr",
      "$22-28/hr",
      "$25-30/hr",
      "$28-35/hr",
      "$30-35/hr",
      "$35-40/hr",
      "$40-45/hr",
      "$40+/hr",
    ],
  },
  {
    label: "Annual",
    items: ["$30-40k/year", "$40-50k/year", "$50-60k/year", "$60-75k/year", "$75k+/year"],
  },
  {
    label: "Other",
    items: ["Commission-based", "Tips + hourly"],
  },
];

export const TARGET_PAY_RANGES_BY_GROUP: LabeledStringGroup[] = [
  {
    label: "Hourly",
    items: [
      "$15-18/hr",
      "$18-22/hr",
      "$20-25/hr",
      "$22-28/hr",
      "$25-30/hr",
      "$28-35/hr",
      "$30-35/hr",
      "$35-40/hr",
      "$40-45/hr",
      "$45-50/hr",
      "$50+/hr",
    ],
  },
  {
    label: "Annual",
    items: ["$30-40k/year", "$40-50k/year", "$50-60k/year", "$60-75k/year", "$75k+/year"],
  },
  {
    label: "Other",
    items: ["Commission-based", "Tips + hourly", "Negotiable"],
  },
];

export const JOB_CATEGORIES = {
  industries: [...INDUSTRIES],

  jobTypes: [
    "Full-time",
    "Part-time",
    "Contract",
    "Seasonal",
    "Freelance",
    "Commission",
  ],

  // Standardized job categories (mirrors jobs.job_category check constraint)
  jobCategories: [
    "Food Service",
    "Retail & Sales",
    "Customer Service",
    "Hospitality Services",
    "Tourism & Recreation",
    "Trades & Construction",
    "Office & Admin",
    "Accounting & Finance",
    "Healthcare & Wellness",
    "Marketing & Creative",
    "Tech & IT",
    "Management & Leadership",
    "Maintenance & Facilities",
    "Transportation & Logistics",
    "Education",
    "Fitness & Recreation",
  ],

  // Updated to island format with diacritical marks
  locations: [
    // Oʻahu
    "Honolulu, Oʻahu",
    "Waikīkī, Oʻahu",
    "Kailua, Oʻahu",
    "Kapolei, Oʻahu",
    "Pearl City, Oʻahu",
    "ʻAiea, Oʻahu",
    "ʻEwa Beach, Oʻahu",
    "Waipahu, Oʻahu",
    "Haleʻiwa, Oʻahu",
    "Kāneʻohe, Oʻahu",
    // Maui
    "Kahului, Maui",
    "Wailuku, Maui",
    "Kīhei, Maui",
    "Wailea, Maui",
    "Lahaina, Maui",
    "Makawao, Maui",
    "Pukalani, Maui",
    // Kauaʻi
    "Līhuʻe, Kauaʻi",
    "Kapaʻa, Kauaʻi",
    "Poʻipū, Kauaʻi",
    "Kōloa, Kauaʻi",
    "Hanalei, Kauaʻi",
    "Princeville, Kauaʻi",
    "Kīlauea, Kauaʻi",
    "Hanapepe, Kauaʻi",
    "Lawai, Kauaʻi",
    "Kalaheo, Kauaʻi",
    // Hawaiʻi (Big Island)
    "Hilo, Hawaiʻi",
    "Kailua-Kona, Hawaiʻi",
    "Kona, Hawaiʻi",
    "Waimea (Big Island), Hawaiʻi",
    "Pāhoa, Hawaiʻi",
  ],

  payRanges: flattenLabeledGroups(JOB_PAY_RANGES_BY_GROUP),
};

export { JOB_PAY_RANGES_BY_GROUP };

// More complete onboarding-friendly location picker.
// Used for Employer onboarding (Island → Area) while keeping a single string stored in DB.
export const LOCATIONS_BY_ISLAND: Record<string, string[]> = {
  "Oʻahu": [
    "Honolulu",
    "Waikīkī",
    "Kakaʻako",
    "Kapolei",
    "ʻEwa Beach",
    "Waipahu",
    "Pearl City",
    "ʻAiea",
    "Mililani",
    "Wahiawā",
    "Kailua",
    "Kāneʻohe",
    "Haleʻiwa",
    "North Shore",
    "Ko Olina",
    "Hawaiʻi Kai",
    "Kalihi",
    "Moanalua",
  ],
  "Maui": [
    "Kahului",
    "Wailuku",
    "Kīhei",
    "Wailea",
    "Lahaina",
    "Kapalua",
    "Kāʻanapali",
    "Makawao",
    "Pukalani",
    "Paʻia",
    "Hāna",
    "Upcountry",
  ],
  "Kauaʻi": [
    "Līhuʻe",
    "Kapaʻa",
    "Poʻipū",
    "Kōloa",
    "Hanalei",
    "Princeville",
    "Waimea (Kauaʻi)",
    "Kekaha",
    "Kīlauea",
    "Hanapepe",
    "Lawai",
    "Kalaheo",
  ],
  "Hawaiʻi (Big Island)": [
    "Hilo",
    "Kailua-Kona",
    "Kona",
    "Waimea (Big Island)",
    "Kealakekua",
    "Captain Cook",
    "Pāhoa",
    "Ocean View",
    "Volcano",
  ],
  "Lānaʻi": ["Lānaʻi City"],
  "Molokaʻi": ["Kaunakakai", "Maunaloa"],
};

export const CANDIDATE_CATEGORIES = {
  industries: [...INDUSTRIES],

  skills: SKILLS,

  experience: ["0-1 year", "1-3 years", "3-5 years", "5-10 years", "10+ years"],

  education: [
    "Some High School",
    "High School Diploma/GED",
    "Some College",
    "Associate Degree",
    "Vocational/Trade School",
    "Bachelor's Degree",
    "Master's Degree",
    "Certification/License",
  ],

  targetPayRanges: flattenLabeledGroups(TARGET_PAY_RANGES_BY_GROUP),

  availability: [
    "Immediate",
    "2 weeks notice",
    "1 month notice",
    "Flexible",
    "Weekends only",
    "Seasonal (summer)",
    "Seasonal (winter)",
    "School year only",
  ],

  workStyles: [
    "Team Player",
    "Self-Starter",
    "Fast Learner",
    "Reliable",
    "Detail-Oriented",
    "Fast-Paced",
    "Calm Under Pressure",
    "Outgoing",
    "Friendly",
    "Professional",
    "Creative",
    "Hands-On",
    "Problem-Solver",
    "Multi-Tasker",
    "Organized",
    "Energetic",
    "Aloha Spirit",
    "Cultural Ambassador",
    "Flexible",
    "Hardworking",
  ],

  jobTypesSeeking: [
    "Full-time",
    "Part-time",
    "Contract",
    "Seasonal",
    "Freelance",
    "Commission",
  ],

  locations: JOB_CATEGORIES.locations,
};

// Demo profiles matching the real demo accounts in the database
export const DEMO_PROFILES = {
  seeker: {
    email: "luca.kahananui@email.com",
    password: "demo123",
    name: "Luca Kahananui",
    phone: "(808) 555-1234",
    location: "Honolulu, Oʻahu",
    skills: [
      "Customer Service",
      "Bartending",
      "Food Handlers Card",
      "Aloha Spirit",
    ],
    experience: "1-3 years",
    education: "Associate Degree",
    availability: "Immediate",
    bio: "Aloha! Friendly and hardworking hospitality professional with 3 years of experience in food & beverage. Love working with people and bringing the Aloha spirit to every interaction.",
    targetPay: "$20-25/hr",
    industries: ["Restaurant", "Bar/Brewery", "Hotel/Resort"],
  },
  employer: {
    email: "demo@koabeachbistro.com",
    password: "demo123",
    businessName: "Koa Beach Bistro",
    contactName: "Makani Torres",
    phone: "(808) 555-9876",
    location: "Waikīkī, Oʻahu",
    industry: "Restaurant",
    companySize: "Small Business (10-25)",
    businessLicense: "HI-BIZ-2024-88432",
    bio: "Beachfront restaurant in Waikiki serving fresh Hawaiian cuisine with ocean views. We pride ourselves on a supportive team culture and aloha spirit.",
  },
};

export const TEAM_MEMBERS = [
  { name: "Tea", role: "Co-Founder" },
  { name: "Lindsay", role: "Co-Founder" },
  { name: "Brisa", role: "Co-Founder" },
  { name: "DJ", role: "Co-Founder" },
  { name: "Ethan", role: "Co-Founder" },
];
