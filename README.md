# Atlantic Lounge Bar — Website Mock

A luxury lounge/bar marketing site built with Next.js (App Router), TypeScript,
Tailwind CSS v4, and Framer Motion. All grid and section imagery uses real
photographs (Unsplash), not illustrations.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Structure

- `app/layout.tsx` — fonts (Playfair Display, Cormorant Garamond, Jost, Parisienne) + metadata
- `app/page.tsx` — assembles all sections
- `components/` — Hero, Marquee, About, Cocktails, Gallery, Nights, Testimonials,
  Reservation, Footer, plus the signature `CurtainIntro` load animation and
  `CursorGlow` ambient spotlight
- `lib/images.ts` — central registry of the real photo URLs used across the site

## Notes

- Swap any photo by editing `lib/images.ts`; every image on the site is pulled from there.
- Colors and type scale are defined as design tokens in `app/globals.css` (`@theme` block) — edit them there to re-theme the whole site.

## Reservation backend

Submitting the reservation form now hits `app/api/reservation/route.ts`, which:

1. Validates the input server-side (`zod`)
2. Saves the reservation to a Firestore `reservations` collection via the Firebase Admin SDK
3. Emails your inbox (and the guest, if their account email is verified) via Gmail SMTP

Nothing is written from the browser directly — `firestore.rules` denies all
client read/write on every collection, so guest data only ever passes through
your server.

## Security notes

- All admin API routes check `users/{uid}.role === "admin"` server-side.
- `proxy.ts` rejects cross-origin POST/PATCH/PUT/DELETE to `/api/*` (CSRF defense-in-depth on top of the SameSite=Lax session cookie).
- Admin-entered image URLs must be absolute `https://` URLs.
- Reservation confirmation emails go only to verified account emails, so the form can't be used to mail arbitrary addresses.

**Setup:**

1. Create a Firebase project (or reuse an existing one) and enable Firestore.
2. Firebase Console → Project Settings → Service Accounts → *Generate new private key*. This gives you `project_id`, `client_email`, and `private_key`.
3. Deploy `firestore.rules` to that project (`firebase deploy --only firestore:rules`, or paste it into the Firestore Rules tab in the console).
4. On the Gmail account that should send mail, turn on 2-Step Verification and create an App Password at https://myaccount.google.com/apppasswords.
5. Copy `.env.local.example` to `.env.local` and fill in all the values.
6. When deploying (e.g. on Vercel), add the same variables under Project Settings → Environment Variables.

Reservations, menu, gallery, opening hours and site images are managed at `/admin/dashboard` (admin accounts only — see `.env.local.example` for how to grant the role).

## The 3D intro

`components/intro/` holds a full-screen React Three Fiber experience that plays
before the site: a gold-lit corridor with your real photos mounted as floating
frames.

- **Scroll / swipe up** — dolly forward through the corridor
- **Drag** — look around
- Idle — the camera auto-drifts gently on its own
- Reaching the end (or the "Skip Intro" button) triggers a curtain-wipe into the normal site
- `prefers-reduced-motion` skips the 3D scene entirely

Edit the corridor in `components/intro/IntroWorld.tsx` — the `FRAMES` array
controls which photos appear and where.
