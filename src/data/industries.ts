// Hawaii small-business industry picklist (canonical).
// Keep server allowlists in sync: supabase/functions/make-server-9b95b3f5/index.ts,
// src/supabase/functions/server/index.tsx

export const INDUSTRIES_BY_GROUP = [
  {
    label: "Food & Beverage",
    items: ["Restaurant", "Cafe/Coffee Shop", "Food Truck", "Bakery", "Bar/Brewery"] as const,
  },
  {
    label: "Retail",
    items: ["Retail Store", "Surf Shop", "Boutique", "Gift Shop", "Farmers Market"] as const,
  },
  {
    label: "Hospitality & Tourism",
    items: [
      "Hotel/Resort",
      "Vacation Rental",
      "Bed & Breakfast",
      "Spa/Wellness",
      "Tour Company",
      "Activity Desk",
      "Rental Shop",
      "Luau/Entertainment",
    ] as const,
  },
  {
    label: "Property & Outdoor Services",
    items: [
      "Landscaping",
      "Pool Service",
      "Cleaning Service",
      "Pest Control",
      "Property Management",
      "Farm/Agriculture",
    ] as const,
  },
  {
    label: "Trades & Construction",
    items: [
      "Construction",
      "Home Repair",
      "HVAC",
      "Plumbing",
      "Electrical",
      "Auto Repair",
      "Marine Services",
    ] as const,
  },
  {
    label: "Professional Services",
    items: [
      "Real Estate",
      "Law Firm",
      "Accounting Firm",
      "Insurance Agency",
      "Marketing Agency",
      "IT Services",
    ] as const,
  },
  {
    label: "Community Services",
    items: ["Dental/Medical Office", "Childcare", "Fitness Studio", "Non-Profit"] as const,
  },
] as const;

export type Industry = (typeof INDUSTRIES_BY_GROUP)[number]["items"][number];

export const INDUSTRIES: Industry[] = [...INDUSTRIES_BY_GROUP.flatMap((g) => [...g.items])];
