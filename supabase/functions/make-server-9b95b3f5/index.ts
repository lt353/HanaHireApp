import { Hono } from 'npm:hono@4.6.15';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const app = new Hono();
const FUNCTION_VERSION = '2026-03-26f';

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

// Keep in sync with src/data/industries.ts (HAWAII_SMALL_BUSINESS_INDUSTRIES).
const HAWAII_SMALL_BUSINESS_INDUSTRIES = [
  'Restaurant',
  'Cafe/Coffee Shop',
  'Food Truck',
  'Bakery',
  'Bar/Brewery',
  'Retail Store',
  'Surf Shop',
  'Boutique',
  'Gift Shop',
  'Farmers Market',
  'Hotel/Resort',
  'Vacation Rental',
  'Bed & Breakfast',
  'Spa/Wellness',
  'Tour Company',
  'Activity Desk',
  'Rental Shop',
  'Luau/Entertainment',
  'Landscaping',
  'Pool Service',
  'Cleaning Service',
  'Pest Control',
  'Property Management',
  'Farm/Agriculture',
  'Construction',
  'Home Repair',
  'HVAC',
  'Plumbing',
  'Electrical',
  'Auto Repair',
  'Marine Services',
  'Real Estate',
  'Law Firm',
  'Accounting Firm',
  'Insurance Agency',
  'Marketing Agency',
  'IT Services',
  'Dental/Medical Office',
  'Childcare',
  'Fitness Studio',
  'Non-Profit',
] as const;

const JOB_POST_ALLOWED_INDUSTRIES = [...HAWAII_SMALL_BUSINESS_INDUSTRIES, 'Other'];

const JOB_POST_ALLOWED_JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Seasonal', 'Freelance', 'Commission'];

const JOB_POST_ALLOWED_CATEGORIES = [
  'Food Service',
  'Retail & Sales',
  'Customer Service',
  'Hospitality Services',
  'Tourism & Recreation',
  'Trades & Construction',
  'Office & Admin',
  'Accounting & Finance',
  'Healthcare & Wellness',
  'Marketing & Creative',
  'Tech & IT',
  'Management & Leadership',
  'Maintenance & Facilities',
  'Transportation & Logistics',
  'Education',
  'Fitness & Recreation',
];

// GET /data - Fetch all jobs, candidates, and employers from real database tables
base.get('/data', async (c) => {
  try {
    const [jobsRes, candRes, empRes] = await Promise.all([
      supabase.from('jobs').select('*'),
      supabase.from('candidates').select('*'),
      supabase.from('employers').select('*'),
    ]);

    if (jobsRes.error) console.error('Jobs fetch error:', jobsRes.error);
    if (candRes.error) console.error('Candidates fetch error:', candRes.error);
    if (empRes.error) console.error('Employers fetch error:', empRes.error);

    const poolCandidates = (candRes.data || []).filter(
      (row: { is_profile_complete?: boolean }) => row.is_profile_complete === true,
    );
    return c.json({
      jobs: jobsRes.data || [],
      candidates: poolCandidates,
      employers: empRes.data || [],
    });
  } catch (error: any) {
    console.error('Error fetching data from Supabase:', error);
    return c.json({ error: 'Internal Server Error', details: error?.message }, 500);
  }
});

// POST /jobs - Add a new job to the jobs table
base.post('/jobs', async (c) => {
  try {
    const body = await c.req.json();
    const { data, error } = await supabase.from('jobs').insert([body]).select();
    if (error) {
      console.error('Error inserting job:', error);
      return c.json({ error: error.message }, 500);
    }
    return c.json({ success: true, job: data?.[0] });
  } catch (error: any) {
    return c.json({ error: error?.message }, 500);
  }
});

// POST /seed - Placeholder to prevent errors, seeding is disabled
base.post('/seed', (c) => {
  return c.json({
    success: true,
    message: 'Direct table access is active. Seeding from KV store is disabled as requested.',
  });
});

// POST /employer-ai-import
// Uses Tavily search snippets + Claude to generate structured employer onboarding defaults.
base.post('/employer-ai-import', async (c) => {
  c.header('x-hanahire-function-version', FUNCTION_VERSION);
  const { websiteUrl } = (await c.req.json().catch(() => ({}))) as { websiteUrl?: string };

  const TAVILY_API_KEY = Deno.env.get('TAVILY_API_KEY');
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

  if (!TAVILY_API_KEY) return c.json({ version: FUNCTION_VERSION, error: 'Missing TAVILY_API_KEY' }, 500);
  if (!ANTHROPIC_API_KEY) return c.json({ version: FUNCTION_VERSION, error: 'Missing ANTHROPIC_API_KEY' }, 500);
  if (!websiteUrl || typeof websiteUrl !== 'string') return c.json({ version: FUNCTION_VERSION, error: 'websiteUrl is required' }, 400);

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
    return c.json({ version: FUNCTION_VERSION, error: 'Invalid websiteUrl' }, 400);
  }

  const businessNameGuess = guessBusinessNameFromHost(url.hostname);
  const query = `${businessNameGuess} Hawaii`;
  const logoQuery = `${businessNameGuess} logo`;

  const resolveUrl = (base: URL, maybeRelative: string) => {
    try {
      return new URL(maybeRelative, base).toString();
    } catch {
      return '';
    }
  };

  const isLikelyImageUrl = (u: string) => /\.(png|jpe?g|webp|svg)(\?|#|$)/i.test(u);

  const isProbablyBadLogo = (u: string) => {
    const lower = u.toLowerCase();
    return (
      lower.includes('wp-content/plugins') ||
      lower.includes('wordpress') ||
      lower.includes('site-icon') ||
      // Directory/social platforms often return wrong/blocked logos
      lower.includes('nextdoor.') ||
      lower.includes('yelp.') ||
      lower.includes('facebook.') ||
      lower.includes('fbcdn.') ||
      lower.includes('opentable.') ||
      lower.includes('tripadvisor.')
    );
  };

  const extractLogoFromHtml = (html: string, baseUrl: URL) => {
    const candidates: string[] = [];

    // og:image is often a logo/hero, better than favicon
    const og = html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (og?.[1]) candidates.push(resolveUrl(baseUrl, og[1]));

    // Common WordPress theme logo patterns
    const wpLogo = html.match(/wp-content\/uploads\/[^"' ]*logo[^"' ]*\.(png|jpe?g|webp|svg)/i);
    if (wpLogo?.[0]) candidates.push(resolveUrl(baseUrl, `/${wpLogo[0].replace(/^\/+/, '')}`));

    // <img ...> where src contains "logo" or class/id contains "logo"
    const imgRegex = /<img[^>]+>/gi;
    const imgs = html.match(imgRegex) || [];
    for (const tag of imgs) {
      const src = tag.match(/src=["']([^"']+)["']/i)?.[1];
      const cls = tag.match(/class=["']([^"']+)["']/i)?.[1] || '';
      const id = tag.match(/id=["']([^"']+)["']/i)?.[1] || '';
      const alt = tag.match(/alt=["']([^"']+)["']/i)?.[1] || '';
      const hay = `${cls} ${id} ${alt} ${src || ''}`.toLowerCase();
      if (!src) continue;
      if (!hay.includes('logo')) continue;
      const abs = resolveUrl(baseUrl, src);
      if (abs) candidates.push(abs);
    }

    // rel=icon fallback
    const icon = html.match(/rel=["'](?:shortcut\s+icon|icon)["'][^>]*href=["']([^"']+)["']/i);
    if (icon?.[1]) candidates.push(resolveUrl(baseUrl, icon[1]));

    const uniq = Array.from(new Set(candidates)).filter(Boolean);
    const good = uniq.filter((u) => !isProbablyBadLogo(u) && (isLikelyImageUrl(u) || u.toLowerCase().includes('favicon')));
    return good[0] || '';
  };

  const extractPhoneFromHtml = (html: string) => {
    const tel = html.match(/href=["']tel:([^"']+)["']/i)?.[1];
    if (tel) {
      const digits = tel.replace(/[^\d]/g, '');
      if (digits.length >= 10) {
        const last10 = digits.slice(-10);
        return `(${last10.slice(0, 3)}) ${last10.slice(3, 6)}-${last10.slice(6)}`;
      }
    }
    return extractPhoneFromText(html);
  };

  // Try to fetch homepage HTML for logo + phone (no deep scraping).
  const fetchHomepageSignals = async () => {
    try {
      const res = await fetch(url.toString(), {
        headers: {
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.9',
        },
      });
      if (!res.ok) return { logo: '', phone: '' };
      const html = await res.text();
      return { logo: extractLogoFromHtml(html, url), phone: extractPhoneFromHtml(html) };
    } catch {
      return { logo: '', phone: '' };
    }
  };

  // Run all remote lookups in parallel to reduce latency.
  const tavilyReq = fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query,
      max_results: 5,
      search_depth: 'basic',
      include_answer: true,
      include_raw_content: true,
      include_images: true,
    }),
  });

  const logoReq = fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query: logoQuery,
      max_results: 5,
      search_depth: 'basic',
      include_answer: false,
      include_raw_content: false,
      include_images: true,
    }),
  });

  const homepageSignalsReq = fetchHomepageSignals();

  let tavilyRes: Response;
  let logoRes: Response;
  let homepageSignals = { logo: '', phone: '' };
  try {
    [tavilyRes, logoRes, homepageSignals] = await Promise.all([tavilyReq, logoReq, homepageSignalsReq]);
  } catch (err: any) {
    return c.json({ version: FUNCTION_VERSION, error: 'Upstream request failed', details: err?.message }, 502);
  }

  if (!tavilyRes.ok) {
    const details = await tavilyRes.text().catch(() => '');
    return c.json({ version: FUNCTION_VERSION, error: 'Tavily search failed', status: tavilyRes.status, details }, 502);
  }

  const tavilyJson = (await tavilyRes.json().catch(() => ({}))) as any;
  const results: Array<{ title?: string; url?: string; content?: string }> = Array.isArray(tavilyJson?.results)
    ? tavilyJson.results
    : [];

  if (!results.length) {
    return c.json({ version: FUNCTION_VERSION, error: 'No search results found' }, 404);
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

  // If Tavily provides raw page content, it often contains phone numbers even when snippets do not.
  const rawContentJoined = results
    .map((r: any) => (typeof r?.raw_content === 'string' ? r.raw_content : ''))
    .filter(Boolean)
    .join('\n\n')
    .slice(0, 20000);

  const extractPhoneFromText = (text: string) => {
    // Matches common US phone formats and 808 numbers.
    const m =
      text.match(/\(\s*\d{3}\s*\)\s*\d{3}[-.\s]?\d{4}/) ||
      text.match(/\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/) ||
      text.match(/\b808[-.\s]?\d{3}[-.\s]?\d{4}\b/) ||
      text.match(/\b808\d{7}\b/);
    if (!m) return '';
    const raw = m[0].trim();
    if (/^808\d{7}$/.test(raw)) return `808-${raw.slice(3, 6)}-${raw.slice(6)}`;
    return raw.replace(/\s+/g, ' ').trim();
  };

  const extractEmailFromText = (text: string) => {
    const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    return m ? m[0].trim() : '';
  };

  const tavilyAnswer = typeof tavilyJson?.answer === 'string' ? tavilyJson.answer : '';
  const fallbackPhone =
    homepageSignals.phone ||
    extractPhoneFromText(tavilyAnswer) ||
    extractPhoneFromText(rawContentJoined) ||
    extractPhoneFromText(snippets);
  const fallbackEmail = extractEmailFromText(tavilyAnswer) || extractEmailFromText(snippets);

  // Tavily logo images - from parallel logo search.
  let tavilyLogoImages: string[] = [];
  if (logoRes.ok) {
    const logoJson = (await logoRes.json().catch(() => ({}))) as any;
    tavilyLogoImages = Array.isArray(logoJson?.images) ? logoJson.images : [];
  }

  const allowedIndustries = [...HAWAII_SMALL_BUSINESS_INDUSTRIES];

  const faviconUrl = `${url.origin.replace(/\/$/, '')}/favicon.ico`;
  const tavilyImages: string[] = Array.isArray(tavilyJson?.images) ? tavilyJson.images : [];

  const pickBestImage = (imgs: string[], preferredHost: string) => {
    const clean = imgs.filter((u) => typeof u === 'string').map((u) => u.trim()).filter(Boolean);
    const hasLogoSignal = (u: string) => {
      const lower = u.toLowerCase();
      return (
        lower.includes('logo') ||
        lower.includes('brand') ||
        lower.includes('site-icon') ||
        lower.includes('siteicon') ||
        lower.includes('/icon')
      );
    };
    const score = (u: string) => {
      let s = 0;
      const lower = u.toLowerCase();
      try {
        const host = new URL(u).hostname.replace(/^www\./i, '');
        const pref = preferredHost.replace(/^www\./i, '');
        if (host === pref) s += 50;
      } catch {
        // ignore
      }
      if (lower.includes('wp-content/uploads')) s += 15;
      if (lower.includes('logo')) s += 20;
      if (lower.endsWith('.svg')) s += 5;
      if (lower.includes('favicon')) s -= 25;
      if (isProbablyBadLogo(u)) s -= 100;
      if (!hasLogoSignal(u)) s -= 60;
      if (!isLikelyImageUrl(u) && !lower.includes('favicon')) s -= 50;
      return s;
    };

    return (
      clean
      .slice()
      .sort((a, b) => score(b) - score(a))
      .find((u) => score(u) > 0 && hasLogoSignal(u)) || ''
    );
  };

  const tavilyLogoCandidate =
    pickBestImage(tavilyLogoImages, url.hostname) || pickBestImage(tavilyImages, url.hostname);
  const logoUrl = homepageSignals.logo || tavilyLogoCandidate || faviconUrl;

  const system = [
    'You extract employer onboarding fields from web search snippets.',
    'Return ONLY valid JSON. No markdown. No extra keys.',
    'If a field is unknown, return an empty string.',
    'industry MUST be exactly one of the allowedIndustries strings.',
    'location should be a short human-friendly Hawaii location suitable for a job post (e.g., "Poʻipū, Kauaʻi" or "Waikīkī, Oʻahu").',
    'Do not output a full street address unless that is the only available option.',
    'bio should be 2-3 sentences written as an employer to a job candidate (recruiting tone).',
    'Avoid customer-facing copy like menu items, promos, happy hour deals, reservations, or "come dine".',
    'Prefer hiring-relevant details: mission, team culture, pace, training, benefits if mentioned, and why it’s a great place to work.',
    'companySize should usually be blank unless clearly stated.',
  ].join('\n');

  const user = [
    `Business website: ${url.toString()}`,
    `Business name guess: ${businessNameGuess}`,
    `allowedIndustries: ${JSON.stringify(allowedIndustries)}`,
    '',
    'Tavily answer (may include phone/location):',
    tavilyAnswer,
    '',
    'Search snippets:',
    snippets,
    '',
    'Return JSON with exactly these keys:',
    'businessName, location, phone, email, industry, bio, companySize',
  ].join('\n');

  const candidateModels = [
    // Prefer Sonnet; fall back if account doesn't support a given ID.
    Deno.env.get('ANTHROPIC_MODEL'),
    // Current Anthropic IDs (from /v1/models for this key)
    'claude-sonnet-4-6',
    'claude-sonnet-4-20250514',
    'claude-haiku-4-5-20251001',
    // Legacy fallbacks (may be unavailable for newer accounts)
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
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          signal: controller.signal,
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
      } finally {
        clearTimeout(timeout);
      }
    } catch (err: any) {
      const msg = String(err?.message || err);
      return c.json(
        {
          version: FUNCTION_VERSION,
          businessName: businessNameGuess,
          location: '',
          phone: fallbackPhone,
          email: fallbackEmail,
          industry: '',
          bio: '',
          companySize: '',
          companyLogoUrl: logoUrl,
          websiteUrl: url.toString(),
          warning: `Claude unavailable (${msg}). Returned partial import.`,
        },
        200
      );
    }

    if (anthropicRes.ok) break;

    lastAnthropicStatus = anthropicRes.status;
    lastAnthropicDetails = await anthropicRes.text().catch(() => '');

    // If model doesn't exist, try next candidate; otherwise stop and surface the error.
    if (lastAnthropicStatus === 404) {
      anthropicRes = null;
      continue;
    }

    return c.json(
      { version: FUNCTION_VERSION, error: 'Claude request failed', status: lastAnthropicStatus, model: lastTriedModel, details: lastAnthropicDetails },
      502
    );
  }

  if (!anthropicRes || !anthropicRes.ok) {
    // Helpful diagnostics: list available models for this API key.
    let availableModels: string[] = [];
    try {
      const modelsRes = await fetch('https://api.anthropic.com/v1/models?limit=20', {
        method: 'GET',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
      });
      if (modelsRes.ok) {
        const modelsJson = (await modelsRes.json().catch(() => ({}))) as any;
        availableModels = Array.isArray(modelsJson?.data) ? modelsJson.data.map((m: any) => m?.id).filter(Boolean) : [];
      }
    } catch {
      // ignore
    }

    return c.json(
      {
        version: FUNCTION_VERSION,
        error: 'Claude request failed',
        status: lastAnthropicStatus || 404,
        model: lastTriedModel,
        details: lastAnthropicDetails || 'No supported model found',
        availableModels,
        hint: 'Set Supabase secret ANTHROPIC_MODEL to one of availableModels (exact string).',
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
    return c.json({ version: FUNCTION_VERSION, error: 'Claude returned invalid JSON', raw: text }, 502);
  }

  const safeStr = (v: any) => (typeof v === 'string' ? v.trim() : '');
  const industry = safeStr(extracted.industry);
  const industryOk = allowedIndustries.includes(industry) ? industry : '';
  const phone = safeStr(extracted.phone) || fallbackPhone;
  const email = safeStr(extracted.email) || fallbackEmail;
  const businessNameResolved = safeStr(extracted.businessName) || businessNameGuess;

  // Final logo pass: use full resolved business name + "logo", then take first image result.
  // This helps when early heuristics fall back to favicon.
  let logoUrlFinal = logoUrl;
  try {
    const preciseLogoRes = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: `${businessNameResolved} logo`,
        max_results: 3,
        search_depth: 'basic',
        include_answer: false,
        include_raw_content: false,
        include_images: true,
      }),
    });
    if (preciseLogoRes.ok) {
      const preciseLogoJson = (await preciseLogoRes.json().catch(() => ({}))) as any;
      const images: string[] = Array.isArray(preciseLogoJson?.images) ? preciseLogoJson.images : [];
      const firstImage = images.find((u) => typeof u === 'string' && isLikelyImageUrl(u));
      if (firstImage) {
        logoUrlFinal = firstImage.trim();
      }
    }
  } catch {
    // Keep previously selected logo fallback.
  }

  return c.json({
    version: FUNCTION_VERSION,
    businessName: businessNameResolved,
    location: safeStr(extracted.location),
    phone,
    email,
    industry: industryOk,
    bio: safeStr(extracted.bio),
    companySize: safeStr(extracted.companySize),
    companyLogoUrl: logoUrlFinal,
    websiteUrl: url.toString(),
  });
});

// POST /job-ai-generate
// Generates a full job draft from employer context + freeform prompt.
base.post('/job-ai-generate', async (c) => {
  c.header('x-hanahire-function-version', FUNCTION_VERSION);

  const body = (await c.req.json().catch(() => ({}))) as any;
  const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
  const business = body?.businessContext && typeof body.businessContext === 'object' ? body.businessContext : {};

  if (!prompt) return c.json({ version: FUNCTION_VERSION, error: 'prompt is required' }, 400);

  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
  if (!ANTHROPIC_API_KEY) return c.json({ version: FUNCTION_VERSION, error: 'Missing ANTHROPIC_API_KEY' }, 500);

  const system = [
    'You are an expert hiring copywriter and recruiter assistant for Hawaii employers.',
    'Transform the employer context and freeform request into a complete job listing draft.',
    'Return ONLY valid JSON. No markdown. No prose outside JSON.',
    'Use concise, clear, candidate-friendly language.',
    'Do not invent legal guarantees, compensation promises, or requirements not implied by input.',
    'Prefer concrete and realistic wording for local Hawaii hiring.',
    'If unsure, leave optional fields blank instead of hallucinating.',
    '',
    'Output rules:',
    `- industry must be one of: ${JOB_POST_ALLOWED_INDUSTRIES.join(', ')}`,
    `- job_type must be one of: ${JOB_POST_ALLOWED_JOB_TYPES.join(', ')}`,
    `- job_category must be one of: ${JOB_POST_ALLOWED_CATEGORIES.join(', ')}`,
    '- pay_type must be either "Hourly" or "Yearly"',
    '- pay_min and pay_max must be numeric strings without $ signs',
    '- pay_max must be >= pay_min',
    '- responsibilities: 4-8 short bullet strings',
    '- requirements: 3-8 short bullet strings',
    '- benefits: 0-8 short bullet strings',
    '- application_questions: 0-5 short strings',
    '- description: 2-4 sentences, no markdown bullets',
    '- company_description: 2-4 recruiting-focused sentences about culture/mission',
    '',
    'Return JSON with EXACT keys:',
    'title, industry, custom_industry, location, pay_min, pay_max, pay_type, job_type, job_category, description, responsibilities, requirements, benefits, start_date, company_size, company_name, contact_email, contact_phone, company_description, application_questions',
  ].join('\n');

  const user = JSON.stringify(
    {
      employer_context: {
        company_name: business.company_name ?? '',
        industry: business.industry ?? '',
        location: business.location ?? '',
        company_size: business.company_size ?? '',
        company_description: business.company_description ?? '',
        contact_email: business.contact_email ?? '',
        contact_phone: business.contact_phone ?? '',
      },
      employer_prompt: prompt,
      allowed: {
        industries: JOB_POST_ALLOWED_INDUSTRIES,
        job_types: JOB_POST_ALLOWED_JOB_TYPES,
        job_categories: JOB_POST_ALLOWED_CATEGORIES,
      },
    },
    null,
    2
  );

  const candidateModels = [
    Deno.env.get('ANTHROPIC_MODEL'),
    'claude-sonnet-4-6',
    'claude-sonnet-4-20250514',
    'claude-haiku-4-5-20251001',
    'claude-3-5-sonnet-20241022',
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
          max_tokens: 1400,
          temperature: 0.2,
          system,
          messages: [{ role: 'user', content: user }],
        }),
      });
    } catch (err: any) {
      return c.json({ version: FUNCTION_VERSION, error: 'Claude request failed', details: err?.message }, 502);
    }

    if (anthropicRes.ok) break;
    lastAnthropicStatus = anthropicRes.status;
    lastAnthropicDetails = await anthropicRes.text().catch(() => '');
    if (lastAnthropicStatus === 404) {
      anthropicRes = null;
      continue;
    }
    return c.json(
      { version: FUNCTION_VERSION, error: 'Claude request failed', status: lastAnthropicStatus, model: lastTriedModel, details: lastAnthropicDetails },
      502
    );
  }

  if (!anthropicRes || !anthropicRes.ok) {
    return c.json(
      {
        version: FUNCTION_VERSION,
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

  let parsed: any = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/m);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        parsed = null;
      }
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return c.json({ version: FUNCTION_VERSION, error: 'Claude returned invalid JSON', raw: text }, 502);
  }

  const safeStr = (v: any) => (typeof v === 'string' ? v.trim() : '');
  const safeNumStr = (v: any) => {
    const n = Number(String(v ?? '').replace(/[^\d.]/g, ''));
    if (!Number.isFinite(n) || n <= 0) return '';
    return String(Math.round(n));
  };
  const safeList = (v: any, max = 8) =>
    Array.isArray(v) ? v.map((x) => safeStr(x)).filter(Boolean).slice(0, max) : [];

  const payMin = safeNumStr(parsed.pay_min) || '20';
  const payMaxRaw = safeNumStr(parsed.pay_max) || payMin;
  const payMax = Number(payMaxRaw) < Number(payMin) ? payMin : payMaxRaw;

  const industry = safeStr(parsed.industry);
  const jobType = safeStr(parsed.job_type);
  const category = safeStr(parsed.job_category);
  const payType = safeStr(parsed.pay_type) === 'Yearly' ? 'Yearly' : 'Hourly';

  const normalized = {
    title: safeStr(parsed.title) || safeStr(prompt).slice(0, 80) || 'General Staff',
    industry: JOB_POST_ALLOWED_INDUSTRIES.includes(industry) ? industry : (safeStr(business.industry) || 'Other'),
    custom_industry: safeStr(parsed.custom_industry),
    location: safeStr(parsed.location) || safeStr(business.location) || 'Honolulu, HI',
    pay_min: payMin,
    pay_max: payMax,
    pay_type: payType,
    job_type: JOB_POST_ALLOWED_JOB_TYPES.includes(jobType) ? jobType : 'Full-time',
    job_category: JOB_POST_ALLOWED_CATEGORIES.includes(category) ? category : '',
    description: safeStr(parsed.description),
    responsibilities: safeList(parsed.responsibilities, 8),
    requirements: safeList(parsed.requirements, 8),
    benefits: safeList(parsed.benefits, 8),
    start_date: safeStr(parsed.start_date),
    company_size: safeStr(parsed.company_size) || safeStr(business.company_size),
    company_name: safeStr(parsed.company_name) || safeStr(business.company_name),
    contact_email: safeStr(parsed.contact_email) || safeStr(business.contact_email),
    contact_phone: safeStr(parsed.contact_phone) || safeStr(business.contact_phone),
    company_description: safeStr(parsed.company_description) || safeStr(business.company_description),
    application_questions: safeList(parsed.application_questions, 5),
  };

  return c.json({ version: FUNCTION_VERSION, draft: normalized });
});

Deno.serve(app.fetch);

