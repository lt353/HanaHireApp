# Database Setup Guide

## Overview
This guide sets up the complete database schema with proper relationships for the HanaHire prototype.

---

## Step 1: Run the Migration

### In Supabase Dashboard:
1. Go to **SQL Editor** in your Supabase project
2. Create a new query
3. Copy/paste the entire contents of `database_migration.sql`
4. Click **Run**

### What This Does:
✅ Creates `users` table to store all user accounts
✅ Adds demo accounts (demo.seeker@hanahire.com, demo.employer@hanahire.com)
✅ Sets up foreign key relationships:
  - `unlocks.user_email` → `users.email`
  - `saved_items.user_email` → `users.email`
  - `applications.seeker_email` → `users.email`
  - `applications.job_id` → `jobs.id`
  - `jobs.employer_id` → `employers.id` (if column exists)
✅ Creates helpful views for analytics
✅ Adds automatic timestamp updates

---

## Step 2: Update Demo Login Code

The demo logins need to use the database demo accounts instead of hardcoded profiles.

### Current Behavior:
- Demo logins use in-memory `DEMO_PROFILES` object
- No data is loaded from database

### Updated Behavior:
- Demo logins fetch user record from `users` table
- Load unlocks, saved items, and applications like regular login

---

## Table Relationship Diagram

```
users (email, role, name)
  ├─→ unlocks (user_email → users.email)
  ├─→ saved_items (user_email → users.email)
  └─→ applications (seeker_email → users.email)
        └─→ jobs (job_id → jobs.id)
              └─→ employers (employer_id → employers.id)

candidates (standalone for now)
  └─→ unlocks (target_id when target_type='candidate')
  └─→ saved_items (item_id when item_type='candidate')
```

---

## Benefits of This Setup

### Data Integrity
- Can't create unlocks/saves for non-existent users
- Can't create applications for non-existent jobs
- Orphaned records automatically cleaned up (CASCADE DELETE)

### Demo Experience
- Demo users can accumulate real data across sessions
- Applications, unlocks, and saves persist
- More realistic prototype testing

### Future-Proof
- Easy to add password authentication later
- Already structured for multi-user system
- Can add more user fields without schema changes

---

## Verification Queries

Run these in Supabase SQL Editor to verify setup:

```sql
-- Check demo users exist
SELECT * FROM users WHERE email LIKE 'demo.%';

-- Check relationships work
SELECT
  u.email,
  u.name,
  COUNT(DISTINCT a.id) as applications,
  COUNT(DISTINCT ul.id) as unlocks,
  COUNT(DISTINCT si.id) as saved_items
FROM users u
LEFT JOIN applications a ON u.email = a.seeker_email
LEFT JOIN unlocks ul ON u.email = ul.user_email
LEFT JOIN saved_items si ON u.email = si.user_email
GROUP BY u.email, u.name;

-- View user summary (uses the view we created)
SELECT * FROM user_application_summary;
```

---

## Next Steps

After running the migration:
1. ✅ Update demo login handlers to fetch from users table
2. ✅ Update signup flow to insert into users table
3. ✅ Add user validation on login (check email exists)
4. Consider adding more demo users with pre-populated data
5. Consider adding employer demo account with posted jobs
