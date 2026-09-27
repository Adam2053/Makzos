# Cloudflare deployment plan — makzos.com

Status: **plan only, nothing changed yet.** Written 27 Sep 2026.

## Where we are today

| Piece | Current setup |
|---|---|
| Hosting | Vercel, project `makzos` (team `adam2053s-projects`), deploys on every push to `main` |
| Domain | `makzos.com` registered at Hostinger |
| DNS | Hostinger nameservers (`pixel.dns-parking.com`, `byte.dns-parking.com`) |
| Records | `A @ → 216.198.79.1`, `CNAME www → 79fb3edba820cbe9.vercel-dns-017.com` (www 308-redirects to apex) |
| HTTPS | Let's Encrypt certificate issued and auto-renewed by Vercel |
| Email | No MX records on the domain |
| CDN | Vercel's edge network. The homepage is already served from the Mumbai edge (`x-vercel-id: bom1::…`, `x-vercel-cache: HIT`), about 170 ms time-to-first-byte in a test from India |

The important point: **the site already sits behind a global CDN.** Cloudflare won't give us a CDN we don't have. What it could add is DNS speed, extra security (WAF, bot protection, DDoS) and more control over caching. Putting a second CDN in front of Vercel can also make things *slower* or break them, so this plan goes in phases and measures before each one.

---

## Phase 0: Measure first (before touching anything)

Get a baseline so we can tell whether any Cloudflare step actually helps.

1. Run **PageSpeed Insights** (pagespeed.web.dev) on `https://makzos.com` for mobile and desktop. Record LCP, FCP, TBT, CLS and the overall score.
2. Run **WebPageTest** (webpagetest.org) from Mumbai, Delhi and one non-India location (for example Singapore or London). Record TTFB, Start Render and LCP.
3. Save the results in the table at the bottom of this file.

### Quick wins that help regardless of CDN

These are likely to matter more than Cloudflare for this page:

- **The logo letters are PNGs** (`public/brand/letter-light-*.png`, about 5–15 KB each), served through `/_next/image`. That's fine, but check the Network tab to confirm they arrive as AVIF/WebP. If they don't, add `images: { formats: ["image/avif", "image/webp"] }` to `next.config.ts`.
- **Unused heavy assets:** `public/brand` is 2.5 MB (pack shots and scene images of about 200–290 KB each). The launch page doesn't use them, so they cost nothing now, but when the full site returns, run them through `npm run prep:images` and serve them as WebP/AVIF.
- **Fonts:** only Archivo is loaded, via `next/font`, which self-hosts it. Nothing to do.
- **JavaScript:** GSAP is the main dependency. Keep imports limited to the plugins actually used.

---

## Phase 1: Move DNS to Cloudflare, DNS-only (recommended, low risk)

This gets the domain into Cloudflare (fast DNS, a dashboard, and it's ready for later phases) without changing how traffic flows. Visitors still go straight to Vercel.

### Steps

1. **Create a free Cloudflare account** at dash.cloudflare.com, click **Add a domain**, enter `makzos.com` and choose the **Free** plan.
2. Cloudflare scans the existing records. **Check that it imported exactly these two**, and fix them if it didn't:

   | Type | Name | Content | Proxy status |
   |---|---|---|---|
   | A | `@` | `216.198.79.1` | **DNS only (grey cloud)** |
   | CNAME | `www` | `79fb3edba820cbe9.vercel-dns-017.com` | **DNS only (grey cloud)** |

   Delete anything else it imported, such as old Hostinger parking records. The **grey cloud** matters: an orange cloud would turn on the proxy (Phase 2).
3. Cloudflare shows two nameservers, like `xxx.ns.cloudflare.com`. Copy them.
4. **In Hostinger:** go to **hPanel → Domains → makzos.com → DNS / Nameservers → Change nameservers → Use custom nameservers**, paste Cloudflare's two nameservers and save.
5. Wait for Cloudflare to email "makzos.com is now active". This usually takes under an hour and can take up to 24 hours.
6. **Check:**
   - `dig NS makzos.com` shows Cloudflare's nameservers.
   - `dig makzos.com A` still returns `216.198.79.1`.
   - Vercel → Project → Settings → Domains shows both domains as **Valid**.
   - `https://makzos.com` loads and `https://www.makzos.com` redirects to it.
7. In Cloudflare, go to **SSL/TLS → Overview** and set the mode to **Full (strict)**. It doesn't matter while the records are grey, but it prevents redirect loops if anyone turns on the orange cloud later.
8. Optional: turn on **DNSSEC** in Cloudflare (**DNS → Settings**). Then add the DS record Cloudflare gives you in Hostinger, under **Domains → makzos.com → DNSSEC**.

### Rollback

In Hostinger, switch the nameservers back to `pixel.dns-parking.com` and `byte.dns-parking.com`, and re-add the two records above in Hostinger's DNS zone.

---

## Phase 2: Turn on the Cloudflare proxy (only if Phase 0 or 1 shows a real need)

**Read this first.** Vercel's documentation recommends *against* putting a reverse proxy such as Cloudflare's orange cloud in front of a Vercel deployment. The known problems:

- **Two caches:** a Cloudflare cache in front of Vercel's cache can serve stale HTML after a deploy unless it's purged.
- **Lost visibility:** Vercel's firewall, bot protection, rate limits and analytics see Cloudflare's IP addresses instead of real visitors.
- **Certificate renewals** on Vercel can fail if Cloudflare intercepts the ACME challenge.
- **Extra hop:** every cache miss now goes visitor → Cloudflare edge → Vercel edge → origin.

Only do this for a concrete reason, such as needing Cloudflare's WAF, bot fight mode or Zaraz, or a measured TTFB problem in a region where Vercel is weak.

### Steps (if we go ahead)

1. **SSL/TLS → Overview: Full (strict).** "Flexible" causes an infinite redirect loop with Vercel.
2. **SSL/TLS → Edge Certificates:** turn on *Always Use HTTPS*, set *Minimum TLS 1.2* and turn on *TLS 1.3*.
3. **Speed → Optimization:**
   - **Rocket Loader: OFF.** It rewrites script loading and breaks React hydration and the GSAP intro.
   - Leave Mirage and Auto Minify off. Auto Minify is deprecated, and Next already minifies.
   - **HTTP/3 (QUIC): ON. Early Hints: ON.**
4. **Caching → Configuration:** leave *Caching level* at Standard and *Browser Cache TTL* at "Respect existing headers".
5. **Cache Rules (Caching → Cache Rules):**
   - `/_next/static/*`: *Eligible for cache*, Edge TTL "Use cache-control header". These files are immutable and fingerprinted.
   - `/_next/image*`: *Eligible for cache*, Edge TTL 30 days, cache key includes the query string.
   - Everything else, including HTML: leave to origin headers. Vercel sends `max-age=0, must-revalidate`, so Cloudflare revalidates HTML and a new deploy shows up immediately.
6. Flip both DNS records to **Proxied (orange cloud)**.
7. **Check:**
   - `curl -I https://makzos.com` shows `server: cloudflare` and `cf-cache-status`.
   - Vercel → Domains still shows **Valid**. If it shows a certificate warning, add a Cloudflare *Configuration Rule* that disables the proxy's HTTPS redirect for `/.well-known/acme-challenge/*`.
   - Re-run the Phase 0 measurements and compare.
8. **After each deploy:** HTML revalidates on its own, so no purge is needed. If anything looks stale, use **Caching → Configuration → Purge Everything**.

### Rollback

Flip both records back to **DNS only (grey cloud)**. This takes effect within a minute or two.

---

## Phase 3 (alternative): Host on Cloudflare instead of Vercel

Only consider this if we want to leave Vercel altogether, for example for cost or to consolidate on Cloudflare. It replaces Vercel rather than sitting in front of it.

- Build and deploy with the **OpenNext Cloudflare adapter** (`@opennextjs/cloudflare`) onto Cloudflare Workers.
- **Check first:** confirm the adapter supports **Next 16.3** (we're on `next@16.3.1`) and the features this repo uses. Read the adapter's compatibility notes and `node_modules/next/dist/docs/` before starting.
- **Image optimisation:** `next/image` currently relies on Vercel's optimiser. On Workers we'd need a Cloudflare Images binding (paid), a custom loader, or `images.unoptimized: true` with pre-optimised files.
- **CI:** replace Vercel's Git integration with Cloudflare Workers Builds, or a GitHub Action running `opennextjs-cloudflare build && opennextjs-cloudflare deploy`.
- **Cut-over:** deploy to a `*.workers.dev` URL, test it, add the custom domain `makzos.com` in Workers, then remove the domain from the Vercel project.
- **Rollback:** point DNS back to the Vercel records from Phase 1.

This is the largest change. Budget half a day to a day, plus testing.

---

## Recommendation

1. **Do Phase 0 now.** Most of the page-weight wins come from asset tweaks, not a CDN.
2. **Do Phase 1 whenever convenient.** It's free and low risk, and it puts us in position for anything later.
3. **Hold Phase 2** unless measurements or a security need justify it.
4. **Phase 3** is a separate decision about leaving Vercel. It isn't a speed fix.

## Measurements

| Date | Setup | Test location | TTFB | LCP (mobile) | PSI score (mobile) | Notes |
|---|---|---|---|---|---|---|
| 27 Sep 2026 | Vercel only | curl from India | ~0.17 s | — | — | `bom1` edge, cache HIT |
| | | | | | | |
