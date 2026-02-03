const JOB_CATEGORIES = {
  industries: [
    'Food & Beverage', 'Retail', 'Tourism', 'Hospitality', 'Services', 'Office', 
    'Healthcare', 'Marketing', 'Accounting', 'Real Estate', 'Insurance', 'Creative', 
    'Tech', 'Construction', 'Manufacturing', 'Automotive', 'HVAC', 'Electrical', 
    'Plumbing', 'Solar', 'Logistics', 'Agriculture', 'Ranching', 'Fishing', 'Marine'
  ],
  jobTypes: [
    'Full-time', 'Part-time', 'Contract', 'Seasonal', 'Freelance', 'Commission'
  ],
  locations: [
    'Honolulu, HI', 'Kailua, HI', 'Kapolei, HI', 'Pearl City, HI', 'Aiea, HI', 
    'Ewa Beach, HI', 'Waipahu, HI', 'Waikiki, HI', 'Haleiwa, HI', 'Kaneohe, HI', 
    'Hilo, HI', 'Kailua-Kona, HI', 'Kona, HI', 'Waimea, HI', 'Kihei, HI', 
    'Wailea, HI', 'Lahaina, HI', 'Wailuku, HI', 'Kahului, HI', 'Makawao, HI', 
    'Pukalani, HI', 'Lihue, HI', 'Kapaa, HI', 'Hanalei, HI', 'Poipu, HI'
  ]
};

const CANDIDATE_CATEGORIES = {
  skills: [
    'Customer Service', 'Sales', 'Leadership', 'Management', 'Bilingual', 'Cooking', 
    'Bartending', 'Hospitality', 'Retail', 'Inventory Management', 'Cash Handling', 
    'POS Systems', 'Administrative', 'Office Management', 'Data Entry', 'QuickBooks', 
    'Microsoft Office', 'Bookkeeping', 'Marketing', 'Social Media', 'Graphic Design', 
    'Adobe Creative Suite', 'Photography', 'Video Production', 'Web Development', 
    'React', 'JavaScript', 'TypeScript', 'Construction', 'Carpentry', 'Electrical', 
    'Plumbing', 'HVAC', 'Welding', 'Mechanic', 'Auto Repair', 'Landscaping', 
    'Equipment Operation', 'Forklift Certified', 'CDL License', 'Nursing', 
    'Medical', 'Dental', 'First Aid/CPR', 'Lifeguard', 'Teaching', 'Childcare', 
    'Tour Guide', 'Ocean Safety'
  ],
  educationLevels: [
    'High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'Doctorate', 'Vocational Training'
  ],
  locations: JOB_CATEGORIES.locations
};

const CANDIDATE_IMAGES = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1000", // Prof Woman
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=1000", // Prof Man
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=1000", // Tech Man
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1000", // Diverse Man
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=1000", // Prof Woman
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1000", // Smiling Man
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1000", // Creative Woman
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=1000", // Executive Man
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=1000", // Health Prof
  "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=1000", // Asian Woman
  "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=1000", // Doctor
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=1000"  // Business Woman
];

export const generateMockJobs = () => {
  const jobs = [];
  const companies = ["Island Tech", "Mauka Logistics", "Hana Services", "Aloha Retail", "Pacific Hospitality"];
  
  for (let i = 1; i <= 50; i++) {
    const ind = JOB_CATEGORIES.industries[i % JOB_CATEGORIES.industries.length];
    const company = companies[i % companies.length];
    
    jobs.push({
      id: `job_${i}`,
      title: `${ind} Professional`,
      company_name: company,
      company_industry: ind,
      location: JOB_CATEGORIES.locations[i % JOB_CATEGORIES.locations.length],
      pay_range: `$${18 + (i % 12)}-$${32 + (i % 15)}/hr`,
      job_type: ["Full-time", "Contract", "Part-time"][i % 3],
      description: `Seeking a skilled ${ind.toLowerCase()} expert to handle high-volume operations at ${company}. Great growth potential in the Hawaii market.`,
      requirements: ["Local resident", "3+ years experience", "Strong communication skills"],
      responsibilities: ["Oversee daily operations", "Coordinate with local teams", "Maintain service quality"],
      benefits: ["Health insurance", "Paid time off", "Flexible scheduling"],
      company_size: ["Small", "Medium", "Large"][i % 3],
      company_description: `${company} is an established firm in Hawaii dedicated to local excellence.`,
      contact_email: `hiring@${company.toLowerCase().replace(/\s/g, '')}.com`,
      contact_phone: `(808) 555-${2000 + i}`,
      status: "active",
      applicant_count: Math.floor(Math.random() * 25),
      is_anonymous: i % 3 === 0
    });
  }
  return jobs;
};

export const generateMockCandidates = () => {
  const candidates = [];
  const skillsList = CANDIDATE_CATEGORIES.skills;
  
  const firstNames = ["Keoni", "Leilani", "Maliko", "Nani", "Pua", "Kai", "Aulii", "Kanoa", "Nohea", "Ikaika"];
  const lastNames = ["Kahale", "Akana", "Mahi", "Lopes", "Wong", "Nakamura"];

  for (let i = 1; i <= 50; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const primarySkill = skillsList[i % skillsList.length];
    const secondarySkill = skillsList[(i + 5) % skillsList.length];

    candidates.push({
      id: `cand_${i}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@hawaiimail.com`,
      phone: `(808) 555-${1000 + i}`,
      location: JOB_CATEGORIES.locations[i % JOB_CATEGORIES.locations.length],
      bio: `Professional with a strong background in ${primarySkill.toLowerCase()} and over ${3 + (i % 8)} years of local experience.`,
      skills: [primarySkill, secondarySkill, "Management", "Communication"],
      years_experience: 3 + (i % 12),
      availability: ["Immediate", "2 Weeks"][i % 2],
      work_style: ["On-site", "Hybrid", "Remote"][i % 3],
      job_types_seeking: ["Full-time", "Contract"],
      industries_interested: [JOB_CATEGORIES.industries[i % JOB_CATEGORIES.industries.length]],
      video_url: "https://example.com/video.mp4",
      video_thumbnail_url: CANDIDATE_IMAGES[i % CANDIDATE_IMAGES.length],
      preferred_pay_range: `$${22 + (i % 15)}/hr`,
      education: CANDIDATE_CATEGORIES.educationLevels[i % CANDIDATE_CATEGORIES.educationLevels.length],
      current_employment_status: ["Actively Seeking", "Open to Offers"][i % 2],
      visibility_preference: "Standard",
      display_title: `${primarySkill} Expert`,
      title_descriptor: "Experienced",
      title_primary_skill: primarySkill,
      title_secondary_skill: secondarySkill
    });
  }
  return candidates;
};
