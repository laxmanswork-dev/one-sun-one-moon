# ONE SUN ONE MOON — onesunonemoon.in

Website for ONE SUN ONE MOON, a digital marketing and creative agency. Built with Next.js (App Router),
React and TypeScript, styled with CSS Modules and shared design tokens taken from the approved brand board
(`brand-source/brand-guidelines-2026.png`).

## Commands

Requires Node.js 20.9+ (developed on Node 24). Uses **npm** (`package-lock.json`).

```bash
npm install
cp .env.example .env.local   # optional locally; see "Environment variables"
npm run dev                  # http://localhost:3000
npm run build && npm start   # production build + server
npm run check                # typecheck + lint + tests + format check + build
```

| Script                 | Purpose                                                            |
| ---------------------- | ------------------------------------------------------------------ |
| `npm run typecheck`    | TypeScript, no emit                                                |
| `npm run lint`         | ESLint (Next.js core-web-vitals + TypeScript rules)                |
| `npm test`             | Vitest: form validation, security helpers, contact API, game rules |
| `npm run format:check` | Prettier                                                           |
| `npm run assets`       | Rebuilds optimised images in `public/images` from `brand-source/`  |

## Structure

```
app/                    routes (Server Components by default)
  page.tsx              home: hero, pillars, story, services, work, philosophy, process
  about/ services/ work/ work/[slug]/ contact/ privacy/ terms/
  api/contact/route.ts  enquiry endpoint (validation, rate limit, spam checks, Resend)
  journey/page.tsx      “DON'T CLICK THIS” brand journey (noindex): Sun → Moon → game → enquiry calendar
  api/booking/          journey enquiry + meeting (POST) and month availability (GET availability)
  sitemap.ts robots.ts manifest.ts opengraph-image.tsx icon.svg apple-icon.png
  not-found.tsx error.tsx
components/
  brand/                Logo (live-type recreation of the official logo), sun & moon glyphs
  art/                  original SVG artwork (desert horizon, service marks)
  navigation/           header, mobile menu (modal), footer
  sections/             page sections
  portfolio/            project card
  forms/ContactForm     client form: validation, honeypot, honest status messages
  journey/              the brand journey: chapters, progress bar, ProjectBooking calendar form
  game/                 “Catch the Superstar Shades” mini-game (lazy-loaded chunk), chapter III of the journey
lib/
  site.ts               brand copy, navigation, public contact details (from env)
  booking/              journey calendar: time-zone maths, availability modes, Cal.com adapter, env config
  services.ts work.ts   content
  validation/ security/ mail/ seo/ hooks/
brand-source/           master images (brand board, client project assets, live-site captures)
assets/fonts/           Archivo Black (OFL) — used only to render the Open Graph image
tests/                  Vitest suites
```

## Environment variables

See `.env.example`. **None are required to build.** Without them the site works fully, except that the
enquiry form reports honestly that online enquiries are not connected yet, and nothing is shown as sent.

| Variable                                      | Where  | Purpose                                                                                  |
| --------------------------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| `SITE_URL`                                    | server | Canonical origin (default `https://onesunonemoon.in`)                                    |
| `RESEND_API_KEY`                              | secret | Resend API key — enables email delivery                                                  |
| `CONTACT_TO_EMAIL`                            | server | Inbox that receives enquiries                                                            |
| `CONTACT_FROM_EMAIL`                          | server | Sender on a Resend-verified domain, e.g. `ONE SUN ONE MOON <enquiries@onesunonemoon.in>` |
| `PUBLIC_CONTACT_EMAIL`                        | build  | Shown on the site (footer, contact, privacy) only when set                               |
| `PUBLIC_WHATSAPP_NUMBER`                      | build  | WhatsApp link, digits with country code; shown only when set                             |
| `PUBLIC_INSTAGRAM_URL`, `PUBLIC_LINKEDIN_URL` | build  | Social links; shown only when set                                                        |
| `CALCOM_API_KEY`, `CALCOM_EVENT_TYPE_ID`      | secret | Journey calendar: live slots and confirmed bookings through Cal.com (API v2)             |
| `BOOKING_HOURS`, `BOOKING_DAYS`               | server | Without Cal.com: office-hour slots, sent by email as an unconfirmed **request**          |
| `BOOKING_TIMEZONE`, `BOOKING_SLOT_MINUTES`    | server | Zone for displayed times (default `Asia/Kolkata`); slot length (default 30)              |
| `BOOKING_LEAD_HOURS`, `BOOKING_HORIZON_DAYS`  | server | Minimum notice (default 24 h); how far ahead visitors may book (default 60 days)         |

Pages are statically generated, so after changing a `PUBLIC_*` value or the mail settings, **redeploy**.
Secrets are only read on the server (`lib/mail/send-enquiry.ts` imports `server-only`).

## Deployment (Vercel)

1. Push this folder to a Git repository and import it in Vercel (framework preset: Next.js; defaults for
   build command and output).
2. In **Settings → Environment Variables** add the variables above for Production.
3. In **Settings → Domains** add `onesunonemoon.in` and `www.onesunonemoon.in` (redirect `www` → apex),
   then set the DNS records Vercel shows at your domain registrar. HTTPS certificates are automatic.
4. Resend: add and verify the sending domain (SPF/DKIM DNS records), create an API key with send access.
5. Deploy.

Other hosts: any platform that runs a Node.js Next.js server works (`npm run build && npm start`).
Cloudflare requires the OpenNext adapter because `/api/contact` is a server route.

### After deploying — verify

- [ ] `https://onesunonemoon.in` loads over HTTPS; `www` redirects to the apex.
- [ ] Submit a real enquiry on `/contact` → it arrives in `CONTACT_TO_EMAIL`; Reply goes to the visitor.
- [ ] Response headers include `Content-Security-Policy` and `Strict-Transport-Security`.
- [ ] `/robots.txt`, `/sitemap.xml` and `/opengraph-image` load; submit the sitemap in Google Search Console.
- [ ] Share a page link in WhatsApp/LinkedIn and check the preview card.
- [ ] Click “DON'T CLICK THIS” on a phone and a desktop: the Sun chapter opens (not the game); scroll through the Moon,
      play the game to the end, continue, and send a test enquiry from the calendar.
- [ ] With Cal.com connected, book a test meeting and confirm it appears in Cal.com; then cancel it there.

## Security notes

- Contact endpoint: same-origin check, 16 KB body limit, JSON only, server-side validation and
  normalisation, honeypot field, minimum fill time, 5 requests / 10 min per IP, plain-text email (no HTML
  from user input), generic error responses, no personal data in logs.
- The rate limiter is in memory **per server instance**. For a hard global limit, add a Vercel Firewall
  rate-limit rule on `/api/contact` (or back the limiter with Redis/KV). For stronger bot protection,
  add Cloudflare Turnstile.
- CSP allows `'unsafe-inline'` scripts because statically generated Next.js pages hydrate with inline
  scripts; a nonce-based CSP would require rendering every page dynamically. No third-party origins are
  allowed. HSTS is sent in production; HTTPS itself is provided by the host.

## Content rules — read before editing

- **No invented facts.** No metrics, testimonials, awards, client counts or contact details unless verified.
  Case-study `results` stay empty until real, client-approved numbers exist (`lib/work.ts`).
- **Logo.** `components/brand/Logo.tsx` recreates the official logo in live type (Archivo, fire gradient,
  crescent + sun) from the brand board. When the official vector file is available, replace the markup in
  that one component.
- **Legal pages** are drafts marked “pending legal review”; complete the items marked “to be confirmed”.

## The mini-game — character artwork

“Catch the Superstar Shades” is fully playable (mouse, touch, keyboard; pause, replay, close, best score
kept only in the visitor's browser). The intended character likeness (Rajinikanth) is **not** included:
only authorised, licensed artwork may be used. The game currently draws an original placeholder
(a sun-headed hero in shades) and labels the artwork “coming soon”.

To integrate authorised artwork: add a transparent sprite (≈4:5, e.g. 400×500) to `public/game/`, fill in
`sprite` (and optionally `spriteWithShades`) and `credit` in `components/game/character.ts`. Nothing else
changes. Game rules and difficulty live in `components/game/engine.ts` (`CONFIG`).

## The brand journey (`/journey`)

The hero's “DON'T CLICK THIS” opens a scroll-driven journey instead of the game: **Sun** (visibility) →
**Moon** (distinction) → **the secret game** (unlocked only at the end of the Moon chapter) → **project enquiry
calendar** (shown only after a game session ends and the visitor chooses to continue). Exiting the game early
unlocks nothing. Pinned, scroll-animated scenes run only when motion is allowed and the screen is at least 560px
tall; otherwise each chapter is a plain, fully visible screen. The Sun chapter uses `hb.mp4` / `hb.png` (the same
dusk scene), playing only while on screen.

The enquiry calendar has three modes, chosen from the environment:

| Mode      | When                                      | What the visitor gets                                                       |
| --------- | ----------------------------------------- | --------------------------------------------------------------------------- |
| `live`    | `CALCOM_API_KEY` + `CALCOM_EVENT_TYPE_ID` | Cal.com's real free slots; a booking confirmed only when Cal.com accepts it |
| `request` | `BOOKING_HOURS` set (no Cal.com)          | Office-hour slots; the time is emailed as a request, never shown as booked  |
| `date`    | nothing set                               | A preferred day only; the team replies with times                           |

`request` and `date` deliver through the same Resend settings as the contact form, and fail honestly without them.
The Cal.com adapter (`lib/booking/calcom.ts`) is unit-tested against mocked API responses only — make one real
test booking after connecting it.
