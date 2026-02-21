# Database Normalization Migration Instructions

## ✅ Frontend is Ready!

The frontend has been updated to work with normalized data. You can now run the SQL migration.

---

## 🎯 What This Migration Does

Removes 7 redundant columns from the `jobs` table:
- `company_name` → Use `employers.business_name` via JOIN
- `company_industry` → Use `employers.industry` via JOIN
- `company_size` → Use `employers.company_size` via JOIN
- `company_logo_url` → Use `employers.company_logo_url` via JOIN
- `company_description` → Use `employers.company_description` via JOIN
- `contact_email` → Use `employers.email` via JOIN
- `contact_phone` → Use `employers.phone` via JOIN

These fields already exist in the `employers` table, so they're pure duplicates.

---

## 📋 Step-by-Step Migration

### **Step 1: Verify Frontend is Deployed**

Make sure your latest code is deployed:
```bash
# Check that the commit is pushed
git log -1 --oneline
# Should show: "Prepare frontend for database normalization"
```

### **Step 2: Run SQL Migration**

1. Open Supabase Dashboard → SQL Editor
2. Run **Step 1** (add foreign key constraint):

```sql
-- STEP 1: Add foreign key constraint
ALTER TABLE jobs
  ADD CONSTRAINT fk_jobs_employer
  FOREIGN KEY (employer_id)
  REFERENCES employers(id)
  ON DELETE CASCADE;
```

3. Verify it worked (no errors)
4. Run **Step 2** (drop redundant columns):

```sql
-- STEP 2: Drop redundant columns
ALTER TABLE jobs
  DROP COLUMN company_name,
  DROP COLUMN company_industry,
  DROP COLUMN company_size,
  DROP COLUMN company_logo_url,
  DROP COLUMN company_description,
  DROP COLUMN contact_email,
  DROP COLUMN contact_phone;
```

### **Step 3: Verify Migration**

Check that columns are gone:
```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'jobs';
```

You should NOT see:
- company_name
- company_industry
- company_size
- company_logo_url
- company_description
- contact_email
- contact_phone

You SHOULD still see:
- id
- title
- location
- pay_range
- job_type
- description
- requirements
- responsibilities
- benefits
- employer_id  ← This is the link to employers table
- status
- applicant_count
- is_anonymous
- posted_at
- start_date
- video_url

### **Step 4: Test the App**

1. Refresh your app
2. Check that jobs display correctly with company info
3. Try creating a new job
4. Try editing an existing job
5. Verify company name, email, phone show correctly in job details

---

## 🔄 How the Frontend Works Now

**Before Migration:**
```
jobs table: id, title, company_name, contact_email, employer_id, ...
                         ↑            ↑
                    Redundant!   Redundant!
```

**After Migration:**
```
jobs table: id, title, employer_id, ...
                       ↓
                       (link to employers)
                       ↓
employers table: id, business_name, email, phone, ...
```

**Frontend Magic:**
1. API fetches jobs and employers separately
2. `mergeJobsWithEmployers()` joins them in JavaScript
3. Employer fields are aliased to match old names:
   - `employers.business_name` → `job.company_name`
   - `employers.email` → `job.contact_email`
   - etc.
4. All components continue to work unchanged!

---

## ⚠️ Important Notes

- **Foreign Key Cascade:** If an employer is deleted, their jobs are automatically deleted too (ON DELETE CASCADE)
- **No Rollback:** Once columns are dropped, they're gone. Data will be safe though since it exists in employers table
- **New Jobs:** All new jobs must have a valid `employer_id` (frontend enforces this)

---

## 🐛 Troubleshooting

**If foreign key constraint fails:**
```sql
-- Check for jobs with invalid employer_id
SELECT id, title, employer_id
FROM jobs
WHERE employer_id NOT IN (SELECT id FROM employers);
```

Fix by either:
- Deleting the orphaned jobs
- Creating placeholder employer records

**If app shows "[Business Not Found]":**
- Job has invalid employer_id
- Check console for warnings
- Run query above to find orphaned jobs

---

## ✅ Success Checklist

- [ ] Frontend code committed and pushed
- [ ] SQL Step 1 completed (foreign key added)
- [ ] SQL Step 2 completed (columns dropped)
- [ ] Verified columns are gone (information_schema query)
- [ ] App loads and shows jobs correctly
- [ ] Job details show company name/contact info
- [ ] Can create new jobs
- [ ] Can edit existing jobs

---

## 🎉 Benefits After Migration

✅ **No Duplicate Data** - Company info stored once in employers table
✅ **Data Consistency** - Update employer info once, reflects everywhere
✅ **Smaller Jobs Table** - 7 fewer columns = better performance
✅ **Proper Relationships** - Foreign key ensures data integrity
✅ **Easier Maintenance** - Single source of truth for company data

---

**You can now run the SQL migration!** The frontend is ready. 🚀
