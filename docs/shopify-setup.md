# Shopify setup (Phase 0)

Dev store: **makzos-dev.myshopify.com** · Admin: https://admin.shopify.com/store/makzos-dev

## Done by script (`scripts/shopify/seed.mjs`)
Re-runnable; upserts by handle and skips what exists.

```
shopify store auth --store makzos-dev.myshopify.com \
  --scopes write_products,write_publications,write_discounts,write_shipping,read_locations,read_inventory,read_markets_home,read_orders
node scripts/shopify/seed.mjs --store makzos-dev.myshopify.com
```

- Metafield definitions `makzos.*` (flavour_id, kind, line, inspired, taste, heat, notes, story, field_colour, ink_colour), readable by the Storefront API
- 7 flavour products (handle = site slug), variants **Single (55 g)** ₹60 / **Pack of 3** ₹170
- **Build a Box** (`build-a-box`), variants 4/5/6/7 bags at ₹220/270/315/360; chosen flavours ride as line properties
- Smart collection **all-flavours** (product type = Makhana)
- Discount codes FIRSTCRUNCH (10%, once per customer) and BOXOFF50 (₹50 off ₹400+)
- India delivery: Standard ₹40, free from ₹499, Express ₹90
- Publishes products + collection to every sales channel that exists — **re-run `--only publish` after installing Headless**

Prices are the placeholders from `src/lib/products.ts`. Edit them in admin once approved.

**Product photos** (`scripts/shopify/images.mjs`, needs `write_products,write_files` on the store auth): builds square 1600 px photos from the site's own pack renders and dish photos and uploads them. Each flavour gets its pack, three packs (set as the *Pack of 3* variant's image) and its dish; Build a Box gets four flavours fanned and the full range. Skips products that already have photos; `--replace` redoes them.

```
node scripts/shopify/images.mjs --store makzos-dev.myshopify.com
```

## Do in Shopify admin (no API for these)
1. **Settings → Store details**: currency INR, store name Makzos, address (needed for tax/shipping origin).
2. **Headless channel**: Apps → Shopify App Store → "Headless" → install → *Create storefront* (name: Makzos web).
   - Storefront API → copy **public** + **private** tokens → `.env.local`.
   - Storefront API permissions: enable products, collections, cart, checkout, customer (unauthenticated_* scopes), and selling plans.
   - Customer Account API → **Confidential** client → copy client ID + secret.
     - Callback URIs: `http://localhost:3000/api/auth/callback` won't work (https required). Add your tunnel, e.g. `https://<tunnel>/api/auth/callback`, and the production `https://makzos.com/api/auth/callback`.
     - JavaScript origins: same hosts. Logout URI: `https://<host>/`.
   - Then: `node scripts/shopify/seed.mjs --store makzos-dev.myshopify.com --only publish`
3. **Settings → Customer accounts**: choose *Customer accounts* (new, passwordless code login).
4. **Apps → Shopify Subscriptions** (free): create a plan "Subscribe & save" — deliver every 2, 4 or 6 weeks, 10% off — and add all 7 flavours + Build a Box.
5. **Bundles: nothing to do.** The site's ready-made boxes (`src/lib/bundles.ts`) go to Shopify as a *Build a Box* line listing their flavours, so they need no Bundles app. Install Shopify Bundles only if you want per-flavour stock tracked for boxes.
6. **Settings → Payments**: on the dev store use *Bogus Gateway* for testing. For launch: Razorpay (or Cashfree/PayU) + **Cash on Delivery** (manual method).
7. **Settings → Checkout**: brand it (logo, colours from the brand guideline), require phone for shipping, and set the order status page's "continue shopping" link to the site.
8. **Dev Dashboard app "makzos-backend"** (done on makzos-dev, client ID `f0c4aa2a043a0061d0bee2c8b8c68b6d`): scopes `read_orders`, `read_products`, `read_inventory` and the `unauthenticated_*` Storefront scopes. Its client ID/secret are `SHOPIFY_ADMIN_CLIENT_ID/SECRET` (client-credentials grant, used by `/track` for guests); it also minted the public Storefront token. For the real store: install the same app there and mint a token with `storefrontAccessTokenCreate`.
9. **Webhooks** (once the site has a public https URL): add them to makzos-backend's `shopify.app.toml` (`products/create|update|delete`, `collections/update`, `inventory_levels/update` → `https://<host>/api/webhooks/shopify`) and `shopify app deploy`. App webhooks are signed with the app's client secret, so `SHOPIFY_WEBHOOK_SECRET` = `SHOPIFY_ADMIN_CLIENT_SECRET`.

## Going live
Create the real store on **Basic or above**, repeat the admin steps, run the seed against it, swap the env vars.

## How the site uses Shopify (Phases 1–7)

| Need | Where | Shopify API |
|---|---|---|
| Live prices, stock, variant ids | `src/lib/shopify/catalog.ts`, read in `app/layout.tsx`, cached under tag `shopify-catalog` | Storefront |
| Price/stock change → site | `app/api/webhooks/shopify/route.ts` (HMAC-checked, expires the tag) | Webhooks |
| Bag → cart, code check, totals | `app/actions/cart.ts` → `src/lib/shopify/cart.ts` | Storefront cart |
| Checkout | `/checkout` → Shopify `checkoutUrl` (signed in when the shopper is) | Storefront + hosted checkout |
| Sign in / out | `app/api/auth/{login,callback,logout,me}` → `src/lib/shopify/customer.ts` | Customer Account (OAuth + PKCE) |
| Account, orders, addresses, subscriptions | `app/(site)/account/*`, `app/actions/account.ts` | Customer Account |
| Guest order tracking | `/track` → `trackOrder` → `src/lib/shopify/admin.ts` | Admin (client credentials, `read_orders`) |

The bag stays in the browser (instant add-to-bag); Shopify's cart is synced from it for quotes and
checkout. Every four loose one-off bags go to Shopify as a *Build a Box* (4 bags) line, which is
how the site prices them. Prices in `src/lib/products.ts` are placeholders that Shopify's catalogue
overrides at runtime. Without the env keys the site still runs on those placeholders, and checkout
says it's offline.

### Local testing
- Catalogue, bag, codes and checkout work on `http://localhost:3000` once the Storefront token is in `.env.local`.
- Sign-in needs https: run `cloudflared tunnel --url http://localhost:3000` (or ngrok), add `https://<tunnel>/api/auth/callback` to the Customer Account API callback URIs, and browse via the tunnel.
- Smoke test: `node --env-file=.env.local scripts/shopify/smoke.mjs` (catalogue + cart create/update + discount code).
