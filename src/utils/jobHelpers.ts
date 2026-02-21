/**
 * Merges jobs with employer data after database normalization
 *
 * After removing redundant columns from jobs table (company_name,
 * company_industry, etc.), this function joins job data with employer
 * data using employer_id.
 */

export interface Job {
  id: number;
  title: string;
  location: string;
  pay_range: string;
  job_type: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  status: string;
  applicant_count: number;
  is_anonymous: boolean;
  posted_at?: string;
  start_date?: string;
  video_url?: string;
  employer_id: number;
}

export interface Employer {
  id: number;
  email: string;
  business_name: string;
  contact_name: string;
  phone: string;
  location: string;
  industry: string;
  company_size: string;
  business_license?: string;
  company_description?: string;
  company_logo_url?: string;
  business_verified: boolean;
}

export interface JobWithEmployer extends Job {
  // Employer fields aliased to match old job column names for compatibility
  company_name: string;        // from employers.business_name
  company_industry: string;     // from employers.industry
  company_size: string;         // from employers.company_size
  company_logo_url?: string;    // from employers.company_logo_url
  company_description?: string; // from employers.company_description
  contact_email: string;        // from employers.email
  contact_phone: string;        // from employers.phone
  employer_location?: string;   // from employers.location
  business_verified?: boolean;  // from employers.business_verified
  employer?: Employer;          // full employer object if needed
}

/**
 * Merges a job with its employer data
 */
export function mergeJobWithEmployer(job: Job, employers: Employer[]): JobWithEmployer {
  const employer = employers.find(e => e.id === job.employer_id);

  if (!employer) {
    console.warn(`No employer found for job ${job.id} (employer_id: ${job.employer_id})`);
    // Return job with placeholder employer data
    return {
      ...job,
      company_name: '[Business Not Found]',
      company_industry: 'Unknown',
      company_size: 'Unknown',
      contact_email: '',
      contact_phone: '',
      employer
    };
  }

  return {
    ...job,
    // Alias employer fields to match old job column names
    company_name: employer.business_name,
    company_industry: employer.industry,
    company_size: employer.company_size,
    company_logo_url: employer.company_logo_url,
    company_description: employer.company_description,
    contact_email: employer.email,
    contact_phone: employer.phone,
    employer_location: employer.location,
    business_verified: employer.business_verified,
    employer // include full employer object if needed
  };
}

/**
 * Merges an array of jobs with employer data
 */
export function mergeJobsWithEmployers(jobs: Job[], employers: Employer[]): JobWithEmployer[] {
  return jobs.map(job => mergeJobWithEmployer(job, employers));
}
