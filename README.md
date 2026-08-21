# PromptRoaRs AI

A marketplace for AI prompts — browse, buy, sell and manage prompts for ChatGPT, Claude, Gemini, Grok, Midjourney, FLUX, Veo, Runway, Kling, Sora and more.

## Current status: AI features in Demo / Coming Soon mode

No AI provider is connected yet. **No API keys are required to run this site.**
The AI Prompt Generator, Prompt Improver, and Chat Studio are fully built in
the UI but respond with a "Coming Soon" state instead of calling any
external AI API.

Everything else — browsing, search, categories, prompt details, favorites,
purchases, reviews, creator profiles, dashboard, wallet, referrals,
notifications, and the admin panel — works today using demo data
(`js/data.js`) and browser `localStorage` for user actions (favorites,
purchases).

## Project structure

```
promptroars/
├── index.html            Homepage
├── marketplace.html       Browse / search / filter prompts
├── prompt-detail.html     Single prompt page (buy, favorite, reviews)
├── ai-studio.html         Prompt Generator, Improver, Chat, Tool Directory
├── dashboard.html         User dashboard (library, wallet, referral, sales)
├── admin.html             Admin overview + AI engine status
├── creator-profile.html   Public creator profile
├── css/
│   ├── tokens.css         Design tokens (color, type, glass, roar-bar)
│   └── site.css           Layout & components
└── js/
    ├── data.js             Demo data layer (stands in for the database)
    ├── ai-services.js      AI service abstraction layer (Coming Soon mode)
    └── app.js              App logic (rendering, filters, local state)
```

## AI service layer (`js/ai-services.js`)

Every AI feature calls a dedicated service instead of an external API directly:

- `PromptGeneratorService.generate()`
- `PromptImproverService.improve()`
- `ChatService.send()`
- `RecommendationService.recommend()`
- `PromptAnalysisService.analyze()`

Each currently resolves to `{ status: 'coming_soon', message, data: null }`
with no network request. This is the **only** place to touch when a real
provider is ready — the UI code never needs to change.

## Connecting a real AI provider later

1. Build a small backend (Node/Express, or serverless functions) that owns
   your AI provider calls.
2. Store provider keys as **server-side environment variables**
   (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, etc.) — never
   in this frontend code.
3. In `js/ai-services.js`, replace the `return comingSoon(...)` line in each
   service with a `fetch()` call to your backend endpoint
   (e.g. `POST /api/ai/generate-prompt`), which then calls the provider
   using the server-side key.
4. Never expose provider keys in browser code, bundles, or `.env` files
   that ship to the client.

## Running locally

This is a static site — no build step. Open `index.html` in a browser, or
serve the folder with any static server, e.g.:

```
npx serve .
```

## Deploying free with GitHub Pages

1. Create a GitHub repo named `yourusername.github.io` (or any repo name).
2. Push these files to the repo.
3. In the repo, go to **Settings → Pages** and set the source to your main
   branch (root folder).
4. Your site goes live at `https://yourusername.github.io/` (or
   `https://yourusername.github.io/repo-name/` for a non-root-named repo).

## Demo data

`js/data.js` seeds 12 sample prompts across 10 categories and 13 AI tools,
5 sample creators, reviews, and notifications, plus a demo `CURRENT_USER`.
Replace this file's contents with real API/database calls when a backend
is connected — the shapes already match typical DB row structures.
