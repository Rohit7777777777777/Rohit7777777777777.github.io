/* ==========================================================================
   PromptRoaRs AI — Demo Data Layer
   ========================================================================== */

(function(){
const AI_TOOLS = [
  { id:'chatgpt',   name:'ChatGPT',   icon:'💬', category:'Text' },
  { id:'gemini',    name:'Gemini',    icon:'✦',  category:'Text' },
  { id:'claude',    name:'Claude',    icon:'✺',  category:'Text' },
  { id:'grok',      name:'Grok',      icon:'⚡',  category:'Text' },
  { id:'midjourney',name:'Midjourney',icon:'🎨', category:'Image' },
  { id:'flux',      name:'FLUX',      icon:'◆',  category:'Image' },
  { id:'veo',       name:'Veo',       icon:'🎬', category:'Video' },
  { id:'runway',    name:'Runway',    icon:'🎞️', category:'Video' },
  { id:'kling',     name:'Kling AI',  icon:'🌀', category:'Video' },
  { id:'sora',      name:'Sora',      icon:'☀️', category:'Video' },
  { id:'tiktok',    name:'TikTok',    icon:'♪',  category:'Social' },
  { id:'instagram', name:'Instagram', icon:'◎',  category:'Social' },
  { id:'youtube',   name:'YouTube',   icon:'▶',  category:'Social' },
];

const CATEGORIES = ['Marketing','Copywriting','Art & Design','Photography','Video','Coding','Business','Social Media','Productivity','Education'];

const CREATORS = [
  { id:'c1', name:'Ananya Rao',   handle:'@ananya.codes',  bio:'Prompt engineer, ex-growth marketer.', sales:1284, rating:4.9 },
  { id:'c2', name:'Marcus Lee',   handle:'@marcuslee',     bio:'Visual prompts for Midjourney & FLUX.',  sales:942,  rating:4.8 },
  { id:'c3', name:'Priya Nair',   handle:'@priyabuilds',   bio:'Business & productivity prompt packs.',  sales:2110, rating:4.9 },
  { id:'c4', name:'Diego Ruiz',   handle:'@diego.ai',      bio:'Video & motion prompt specialist.',      sales:610,  rating:4.7 },
  { id:'c5', name:'Sara Kim',     handle:'@sarakim',       bio:'Copywriting & brand voice systems.',     sales:1567, rating:5.0 },
];

const PROMPTS = [
  {
    id:'p1', title:'Viral Hook Generator — 30 Scroll-Stopping Openers',
    category:'Copywriting', tool:'chatgpt', creator:'c5', price:9,
    tags:['hooks','short-form','marketing'],
    desc:'Generate 30 scroll-stopping video/post openers tailored to your niche, tone and platform.',
    body:`You are a short-form content strategist. Given a NICHE, TONE and PLATFORM, generate 30 scroll-stopping hooks (first line only) for short-form video or posts.

Rules:
- Each hook must be under 12 words
- No generic openers ("Did you know...")
- Mix formats: question, bold claim, contrarian take, numbered list teaser, story cold-open
- Group output into 5 categories of 6 hooks each

NICHE: {{niche}}
TONE: {{tone}}
PLATFORM: {{platform}}`,
    rating:4.9, reviews:214, sales:891,
  },
  {
    id:'p2', title:'Cinematic Product Shot — Studio Light Recipe',
    category:'Photography', tool:'midjourney', creator:'c2', price:6,
    tags:['product','studio','commercial'],
    desc:'A precise Midjourney recipe for glossy, commercial-grade product photography.',
    body:`{{product}} on a reflective black surface, dramatic three-point studio lighting, soft rim light, subtle reflection, dark gradient background, ultra sharp focus, commercial product photography, 85mm lens, f/2.8 --ar 4:5 --v 6 --style raw`,
    rating:4.8, reviews:132, sales:503,
  },
  {
    id:'p3', title:'Cold Email Sequence — 5-Touch B2B Outreach',
    category:'Marketing', tool:'claude', creator:'c1', price:14,
    tags:['sales','b2b','email'],
    desc:'A complete 5-email cold outreach sequence framework that adapts to any B2B offer.',
    body:`Act as a B2B sales copywriter. Write a 5-email cold outreach sequence for {{offer}} targeting {{persona}}.

Structure:
Email 1 (Day 0): Pattern interrupt + specific value hook
Email 2 (Day 3): Social proof / case study angle
Email 3 (Day 7): Educational value, no ask
Email 4 (Day 12): Direct ask with urgency
Email 5 (Day 18): Breakup email

Keep each email under 90 words. Subject lines under 6 words.`,
    rating:4.9, reviews:301, sales:1204,
  },
  {
    id:'p4', title:'Brand Explainer Video — 30s Script + Shot List',
    category:'Video', tool:'veo', creator:'c4', price:12,
    tags:['explainer','brand','30s'],
    desc:'Full script and shot-by-shot breakdown for a 30-second brand explainer video.',
    body:`Write a 30-second brand explainer script for {{brand}} that sells {{product}} to {{audience}}.

Deliver:
1. Voiceover script (max 80 words, punchy, active voice)
2. Shot list (6-8 shots) with camera movement notes
3. On-screen text overlays for each shot
4. Suggested music mood`,
    rating:4.7, reviews:88, sales:276,
  },
  {
    id:'p5', title:'SEO Blog Outline Machine',
    category:'Copywriting', tool:'chatgpt', creator:'c3', price:0,
    tags:['seo','blog','free'],
    desc:'Turns any keyword into a fully structured, SEO-ready blog outline in seconds.',
    body:`You are an SEO content strategist. For the keyword "{{keyword}}", produce:
1. 3 title options (under 60 characters, include keyword)
2. Meta description (under 155 characters)
3. H2/H3 outline (8-10 sections) covering search intent comprehensively
4. 5 related "People Also Ask" questions to address
5. Internal linking suggestions (topic areas, not URLs)`,
    rating:4.6, reviews:520, sales:3012,
  },
  {
    id:'p6', title:'Character Sheet Generator — Consistent Cast',
    category:'Art & Design', tool:'flux', creator:'c2', price:11,
    tags:['character','consistency','illustration'],
    desc:"Locks a character's appearance across multiple generations for comics or branding.",
    body:`Character reference sheet, {{character_description}}, front view / side view / 3-quarter view, neutral pose, flat studio lighting, consistent facial features and proportions across all views, clean white background, character design turnaround --ar 16:9`,
    rating:4.8, reviews:97, sales:344,
  },
  {
    id:'p7', title:'Investor Pitch Deck Narrative',
    category:'Business', tool:'gemini', creator:'c3', price:19,
    tags:['startup','pitch','fundraising'],
    desc:'Slide-by-slide narrative and talking points for a seed-stage investor pitch.',
    body:`Act as a startup pitch coach. Build a 10-slide investor pitch narrative for {{company}} solving {{problem}} for {{customer}}.

For each slide provide: slide title, 2-3 bullet talking points, and one suggested visual. Cover: Hook, Problem, Solution, Market Size, Product, Traction, Business Model, Competition, Team, Ask.`,
    rating:4.9, reviews:156, sales:672,
  },
  {
    id:'p8', title:'Reel Remix — Trend-to-Brand Adapter',
    category:'Social Media', tool:'tiktok', creator:'c5', price:7,
    tags:['reels','trends','instagram'],
    desc:'Adapts any trending audio/format into an on-brand script for your niche.',
    body:`Given a TRENDING FORMAT and my BRAND NICHE, adapt the trend into an on-brand 15-30s reel script.

TRENDING FORMAT: {{trend_description}}
BRAND NICHE: {{niche}}

Output: hook line, 3-beat script with timing (seconds), on-screen text, and caption with 5 relevant hashtags.`,
    rating:4.7, reviews:203, sales:788,
  },
  {
    id:'p9', title:'Code Review Companion — Senior Engineer Mode',
    category:'Coding', tool:'claude', creator:'c1', price:10,
    tags:['code-review','engineering','best-practices'],
    desc:'Turns any LLM into a thorough senior-engineer code reviewer.',
    body:`Review the following code as a senior engineer would. Check for: correctness, edge cases, security issues, performance, readability and naming, and adherence to {{language}} idioms. Give feedback as a prioritized list (Critical / Should Fix / Nice to Have), then a one-paragraph summary verdict.

CODE:
{{code}}`,
    rating:4.9, reviews:410, sales:1890,
  },
  {
    id:'p10', title:'Moodboard-to-Motion — Cinemagraph Prompt Set',
    category:'Video', tool:'runway', creator:'c4', price:8,
    tags:['cinemagraph','ambient','motion'],
    desc:'Ten ready-to-use prompts for subtle looping cinemagraphs from a still image.',
    body:`Subtle looping motion, {{subject}}, only {{moving_element}} in gentle continuous motion, everything else perfectly still, seamless loop, cinemagraph, soft ambient lighting, 4s duration`,
    rating:4.6, reviews:64, sales:198,
  },
  {
    id:'p11', title:'Daily Standup Summarizer',
    category:'Productivity', tool:'chatgpt', creator:'c3', price:0,
    tags:['team','summary','free'],
    desc:'Converts messy standup notes into a clean, shareable team update.',
    body:`Turn the following raw standup notes into a clean summary organized by person, with sections: Done Yesterday / Doing Today / Blockers. Flag any blockers that need escalation with 🚩.

NOTES:
{{notes}}`,
    rating:4.5, reviews:178, sales:940,
  },
  {
    id:'p12', title:'Lecture-to-Quiz Converter',
    category:'Education', tool:'gemini', creator:'c1', price:5,
    tags:['teaching','quiz','study'],
    desc:'Converts any lecture transcript or notes into a graded practice quiz.',
    body:`From the following lecture content, generate a 10-question quiz: 6 multiple choice, 2 short answer, 2 true/false. Include an answer key with a one-line explanation per answer. Match difficulty to {{level}} level.

CONTENT:
{{content}}`,
    rating:4.8, reviews:112, sales:455,
  },
];

const REVIEWS = [
  { id:'r1', promptId:'p3', user:'Karan M.', rating:5, text:'Closed 2 meetings in the first week using this sequence as-is.', date:'2026-07-02' },
  { id:'r2', promptId:'p3', user:'Fatima Z.', rating:5, text:'Structure is rock solid, easy to adapt to our SaaS offer.', date:'2026-06-18' },
  { id:'r3', promptId:'p1', user:'Dev S.', rating:5, text:'Hook variety is genuinely useful, not the same recycled list.', date:'2026-07-10' },
  { id:'r4', promptId:'p9', user:'Wei L.', rating:5, text:'Feels like an actual senior review, catches real issues.', date:'2026-06-29' },
];

const NOTIFICATIONS = [
  { id:'n1', text:'Your prompt "Cold Email Sequence" sold 3 more copies today.', time:'2h ago', unread:true },
  { id:'n2', text:'PromptRoaRs AI: new referral signup — you earned ₹50 wallet credit.', time:'1d ago', unread:true },
  { id:'n3', text:'Review received on "Viral Hook Generator" — 5 stars ⭐', time:'2d ago', unread:false },
  { id:'n4', text:'Payout of ₹2,340 was sent to your linked account.', time:'5d ago', unread:false },
];

const CURRENT_USER = {
  id:'u1', name:'You', handle:'@you', email:'you@example.com',
  wallet:1280, referralCode:'ROAR-YOU42', joined:'2026-02-14',
  isCreator:true, isAdmin:true,
};

window.PR_DATA = { AI_TOOLS, CATEGORIES, CREATORS, PROMPTS, REVIEWS, NOTIFICATIONS, CURRENT_USER };
})();
