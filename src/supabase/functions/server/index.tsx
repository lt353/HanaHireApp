import { Hono } from 'npm:hono@4.6.15';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const app = new Hono();

// IMPORTANT: Each route must be prefixed with /make-server-9b95b3f5
const base = app.basePath('/make-server-9b95b3f5');

base.use('*', logger(console.log));
base.use('*', cors());

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// GET /data - Fetch all jobs, candidates, and employers from real database tables
base.get('/data', async (c) => {
  try {
    const [jobsRes, candRes, empRes] = await Promise.all([
      supabase.from('jobs').select('*'),
      supabase.from('candidates').select('*'),
      supabase.from('employers').select('*')
    ]);
    
    if (jobsRes.error) console.error('Jobs fetch error:', jobsRes.error);
    if (candRes.error) console.error('Candidates fetch error:', candRes.error);
    if (empRes.error) console.error('Employers fetch error:', empRes.error);

    return c.json({ 
      jobs: jobsRes.data || [], 
      candidates: candRes.data || [],
      employers: empRes.data || []
    });
  } catch (error) {
    console.error('Error fetching data from Supabase:', error);
    return c.json({ error: 'Internal Server Error', details: error.message }, 500);
  }
});

// POST /jobs - Add a new job to the jobs table
base.post('/jobs', async (c) => {
  try {
    const body = await c.req.json();
    // Ensure we handle potential ID conflicts or auto-generation
    const { data, error } = await supabase.from('jobs').insert([body]).select();
    if (error) {
      console.error('Error inserting job:', error);
      return c.json({ error: error.message }, 500);
    }
    return c.json({ success: true, job: data[0] });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /seed - Placeholder to prevent errors, seeding is disabled
base.post('/seed', (c) => {
  return c.json({ 
    success: true, 
    message: 'Direct table access is active. Seeding from KV store is disabled as requested.' 
  });
});

Deno.serve(app.fetch);
