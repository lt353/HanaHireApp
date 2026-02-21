# Database Setup Guide V2

## Overview
Corrected migration based on **actual database schema**. No separate users table needed!

---

## Your Current Architecture

```
SEEKERS (Job Seekers):
  candidates table (id, email, name, skills, bio...)
    └─→ applications.candidate_id

EMPLOYERS (Companies):
  employers table (id, email, business_name, industry...)
    └─→ jobs.employer_id

APPLICATIONS:
  applications (candidate_id → candidates.id, job_id → jobs.id)

TRACKING:
  unlocks (user_email references candidates.email OR employers.email)
  saved_items (user_email references candidates.email OR employers.email)
```

**Current Data:**
- ✅ 71 employers
- ✅ 71 jobs
- ✅ 70 candidates
- ⚠️ 0 applications (new feature)
- ⚠️ 0 unlocks (new feature)
- ⚠️ 0 saved_items (new feature)

---

## Step 1: Run Migration V2

### In Supabase SQL Editor:
1. Copy/paste entire contents of `database_migration_v2.sql`
2. Click **Run**
3. Check for success message

### What This Does:
✅ Adds unique constraints on candidates.email and employers.email
✅ Creates foreign key relationships:
  - `applications.candidate_id` → `candidates.id`
  - `applications.job_id` → `jobs.id`
  - `jobs.employer_id` → `employers.id`
✅ Creates indexes for faster queries
✅ Inserts demo accounts (demo.seeker, demo.employer)
✅ Creates helpful views for analytics

---

## Relationship Diagram

```
candidates (id, email, name, skills...)
  ├─→ applications.candidate_id
  └─→ unlocks.user_email (when user_role='seeker')
  └─→ saved_items.user_email (when user_role='seeker')

employers (id, email, business_name...)
  ├─→ jobs.employer_id
  └─→ unlocks.user_email (when user_role='employer')
  └─→ saved_items.user_email (when user_role='employer')

jobs (id, title, employer_id...)
  └─→ applications.job_id

applications (candidate_id, job_id, status, applied_at)
  - Links candidates to jobs they've applied to
  - Tracks application status and timestamps
```

---

## Code Changes Made

### ✅ Fixed Application Tracking:
- **Before:** Tried to insert `seeker_email` (doesn't exist)
- **After:** Inserts `candidate_id` (correct!)
- **Before:** Used column `application_status` (doesn't exist)
- **After:** Uses column `status` (correct!)

### ✅ Fixed Login Flow:
- Fetches candidate/employer record from database
- Stores database ID in `userProfile.id`
- Uses ID for creating applications

### ✅ Fixed Queries:
- `fetchApplications` uses `candidate_id` instead of email
- All queries now match actual schema

---

## Demo Accounts

After migration, you'll have two permanent demo accounts:

**Demo Seeker:**
- Email: `demo.seeker@hanahire.com`
- Can apply to jobs, save items, unlock profiles
- Data persists across sessions

**Demo Employer:**
- Email: `demo.employer@hanahire.com`
- Can post jobs, browse candidates, unlock profiles
- Data persists across sessions

---

## Next Steps

1. ✅ Run `database_migration_v2.sql`
2. ✅ Verify demo accounts created
3. Test the flow:
   - Login as demo.seeker@hanahire.com
   - Browse jobs and save some
   - Apply to a job (pay $2)
   - Check applications table for new record
4. Optional: Update demo login to auto-fill these emails

---

## Verification Queries

```sql
-- Check foreign keys were created
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('applications', 'jobs', 'unlocks', 'saved_items')
ORDER BY tc.table_name;

-- Test demo accounts exist
SELECT * FROM candidates WHERE email = 'demo.seeker@hanahire.com';
SELECT * FROM employers WHERE email = 'demo.employer@hanahire.com';

-- Use the helpful views
SELECT * FROM candidate_application_summary;
SELECT * FROM job_application_summary LIMIT 10;
SELECT * FROM unlock_activity_summary;
```

---

## Why No "Users" Table?

**You already have one - it's split into two!**

- `candidates` = user accounts for job seekers
- `employers` = user accounts for employers

This is actually a **better design** for your use case:
- Different data for each user type
- Cleaner schema (no nullable columns for "if employer then X else Y")
- Easier to query ("get all employers in tech" vs "get all users where role=employer AND industry=tech")

The only tradeoff: `unlocks` and `saved_items` use email-based polymorphic relationships instead of a single FK. This is acceptable for a prototype.
