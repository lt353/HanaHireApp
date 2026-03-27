import { Hono } from 'npm:hono@4.6.15';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const app = new Hono();

// IMPORTANT: Each route must be prefixed with /make-server-9b95b3f5
const base = app.basePath('/make-server-9b95b3f5');

base.use('*', logger(console.log));
base.use(
  '*',
  cors({
    origin: '*',
    allowHeaders: ['content-type', 'authorization', 'apikey'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  })
);

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

// POST /employer-ai-import
// Uses Tavily search snippets + Claude to generate structured employer onboarding defaults.
base.post('/employer-ai-import', async (c) => {
  const { websiteUrl } = (await c.req.json().catch(() => ({}))) as { websiteUrl?: string };

  const TAVILY_API_KEY = Deno.env.get('TAVILY_API_KEY');
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

  if (!TAVILY_API_KEY) return c.json({ error: 'Missing TAVILY_API_KEY' }, 500);
  if (!ANTHROPIC_API_KEY) return c.json({ error: 'Missing ANTHROPIC_API_KEY' }, 500);
  if (!websiteUrl || typeof websiteUrl !== 'string') return c.json({ error: 'websiteUrl is required' }, 400);

  const normalizeUrl = (input: string) => {
    const raw = input.trim();
    const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(withScheme);
  };

  const titleCase = (s: string) =>
    s
      .split(/[\s_-]+/g)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const guessBusinessNameFromHost = (host: string) => {
    const base = host.replace(/^www\./i, '').split('.').slice(0, -1).join('.') || host.replace(/^www\./i, '');
    return titleCase(base);
  };

  let url: URL;
  try {
    url = normalizeUrl(websiteUrl);
  } catch {
    return c.json({ error: 'Invalid websiteUrl' }, 400);
  }

  const businessNameGuess = guessBusinessNameFromHost(url.hostname);
  const query = `${businessNameGuess} Hawaii`;

  // Tavily search
  let tavilyRes: Response;
  try {
    tavilyRes = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        max_results: 5,
        search_depth: 'basic',
        include_answer: false,
        include_raw_content: false,
        include_images: false,
      }),
    });
  } catch (err: any) {
    return c.json({ error: 'Tavily request failed', details: err?.message }, 502);
  }

  if (!tavilyRes.ok) {
    const details = await tavilyRes.text().catch(() => '');
    return c.json({ error: 'Tavily search failed', status: tavilyRes.status, details }, 502);
  }

  const tavilyJson = (await tavilyRes.json().catch(() => ({}))) as any;
  const results: Array<{ title?: string; url?: string; content?: string }> = Array.isArray(tavilyJson?.results)
    ? tavilyJson.results
    : [];

  if (!results.length) {
    return c.json({ error: 'No search results found' }, 404);
  }

  const snippets = results
    .slice(0, 5)
    .map((r, i) => {
      const title = (r?.title || '').trim();
      const link = (r?.url || '').trim();
      const content = (r?.content || '').trim();
      return `Result ${i + 1}:\nTitle: ${title}\nURL: ${link}\nSnippet: ${content}`;
    })
    .join('\n\n');

  // Keep these aligned with the frontend dropdowns (JOB_CATEGORIES.industries).
  const allowedIndustries = [
    'Food & Beverage',
    'Retail',
    'Tourism',
    'Hospitality',
    'Services',
    'Office',
    'Healthcare',
    'Marketing',
    'Accounting',
    'Real Estate',
    'Insurance',
    'Creative',
    'Tech',
    'Construction',
    'Manufacturing',
    'Automotive',
    'HVAC',
    'Electrical',
    'Plumbing',
    'Solar',
    'Logistics',
    'Agriculture',
    'Ranching',
    'Fishing',
    'Marine',
  ];

  const allowedLocations = [
    'Honolulu, HI', 'Kailua, HI', 'Kapolei, HI', 'Pearl City, HI', 'Aiea, HI',
    'Ewa Beach, HI', 'Waipahu, HI', 'Waikiki, HI', 'Haleiwa, HI', 'Kaneohe, HI',
    'Hilo, HI', 'Kailua-Kona, HI', 'Kona, HI', 'Waimea, HI', 'Kihei, HI',
    'Wailea, HI', 'Lahaina, HI', 'Wailuku, HI', 'Kahului, HI', 'Makawao, HI',
    'Pukalani, HI', 'Lihue, HI', 'Kapaa, HI', 'Hanalei, HI', 'Poipu, HI'
  ];

  const faviconUrl = `${url.origin.replace(/\/$/, '')}/favicon.ico`;

  const system = [
    'You extract employer onboarding fields from web search snippets.',
    'Return ONLY valid JSON. No markdown. No extra keys.',
    'If a field is unknown, return an empty string.',
    'industry MUST be exactly one of the allowedIndustries strings.',
    'location MUST be exactly one of the allowedLocations strings (not a full address).',
    'bio should be 2-3 sentences written as an employer to a job candidate (recruiting tone).',
    'Avoid customer-facing copy like menu items, promos, happy hour deals, reservations, or "come dine".',
    'Prefer hiring-relevant details: mission, team culture, pace, training, benefits if mentioned, and why it’s a great place to work.',
    'companySize should usually be blank unless clearly stated.',
  ].join('\n');

  const user = [
    `Business website: ${url.toString()}`,
    `Business name guess: ${businessNameGuess}`,
    `allowedIndustries: ${JSON.stringify(allowedIndustries)}`,
    `allowedLocations: ${JSON.stringify(allowedLocations)}`,
    '',
    'Search snippets:',
    snippets,
    '',
    'Return JSON with exactly these keys:',
    'businessName, location, phone, email, industry, bio, companySize',
  ].join('\n');

  const candidateModels = [
    Deno.env.get('ANTHROPIC_MODEL'),
    'claude-sonnet-4-6',
    'claude-sonnet-4-20250514',
    'claude-haiku-4-5-20251001',
    'claude-3-5-sonnet-20241022',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
  ].filter(Boolean) as string[];

  let anthropicRes: Response | null = null;
  let lastAnthropicDetails = '';
  let lastAnthropicStatus = 0;
  let lastTriedModel = '';

  for (const model of candidateModels) {
    lastTriedModel = model;
    try {
      anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 600,
          temperature: 0.2,
          system,
          messages: [{ role: 'user', content: user }],
        }),
      });
    } catch (err: any) {
      return c.json({ error: 'Claude request failed', details: err?.message }, 502);
    }

    if (anthropicRes.ok) break;

    lastAnthropicStatus = anthropicRes.status;
    lastAnthropicDetails = await anthropicRes.text().catch(() => '');

    if (lastAnthropicStatus === 404) {
      anthropicRes = null;
      continue;
    }

    return c.json(
      { error: 'Claude request failed', status: lastAnthropicStatus, model: lastTriedModel, details: lastAnthropicDetails },
      502
    );
  }

  if (!anthropicRes || !anthropicRes.ok) {
    return c.json(
      {
        error: 'Claude request failed',
        status: lastAnthropicStatus || 404,
        model: lastTriedModel,
        details: lastAnthropicDetails || 'No supported model found',
      },
      502
    );
  }

  const anthropicJson = (await anthropicRes.json().catch(() => ({}))) as any;
  const text = Array.isArray(anthropicJson?.content)
    ? anthropicJson.content.filter((x: any) => x?.type === 'text').map((x: any) => x.text).join('\n')
    : '';

  let extracted: any = null;
  try {
    extracted = JSON.parse(text);
  } catch {
    // Try to salvage JSON inside surrounding text (common failure mode)
    const match = text.match(/\{[\s\S]*\}/m);
    if (match) {
      try {
        extracted = JSON.parse(match[0]);
      } catch {
        extracted = null;
      }
    }
  }

  if (!extracted || typeof extracted !== 'object') {
    return c.json({ error: 'Claude returned invalid JSON', raw: text }, 502);
  }

  const safeStr = (v: any) => (typeof v === 'string' ? v.trim() : '');
  const industry = safeStr(extracted.industry);
  const industryOk = allowedIndustries.includes(industry) ? industry : '';

  return c.json({
    businessName: safeStr(extracted.businessName) || businessNameGuess,
    location: safeStr(extracted.location),
    phone: safeStr(extracted.phone),
    email: safeStr(extracted.email),
    industry: industryOk,
    bio: safeStr(extracted.bio),
    companySize: safeStr(extracted.companySize),
    companyLogoUrl: faviconUrl,
    websiteUrl: url.toString(),
  });
});

Deno.serve(app.fetch);
