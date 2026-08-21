# Cash Lab Reference Audit

Reference reviewed: `https://mevtrading.com/` on 20 August 2026.

This inventory records the public reference experience before implementation. The original site and its content were treated as untrusted reference material only. Source code was not copied. Company-specific claims below are not validated for Cash Lab.

## Public route inventory

| Reference route      | Cash Lab route       | Main content and behavior                                                                                                                                                                                                                                                   | Status                                                                                                               |
| -------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `/`                  | `/`                  | Sticky header; anchors for Features, Pricing, Affiliate, FAQ; hero; performance-card marquee; three setup steps; four feature cards; AI agent mockup; market-score engine; monthly/yearly pricing; comparison table; affiliate steps; ten-item accordion; final CTA; footer | Implemented with pricing intentionally removed and the affiliate offer replaced by Cash Lab's 70/30 commission model |
| `/about`             | `/about`             | Mission, AI-Powered / Automated / Optimized cards, risk-management features, bot-management features, platform statistics, CTA                                                                                                                                              | Implemented; claims flagged                                                                                          |
| `/blog`              | `/blog`              | Empty blog state with “No articles yet” and return link                                                                                                                                                                                                                     | Implemented                                                                                                          |
| `/changelog`         | `/changelog`         | Versions 6.0, 5.0, 4.5, and 4.4 with feature/improvement/security entries                                                                                                                                                                                                   | Implemented; claims flagged                                                                                          |
| `/user-guide`        | `/user-guide`        | Full documentation with Dashboard, Wallet, Trading Agent, Bot Protection, My Account, Bot Settings, Transactions, Affiliate, Subscription, and Profile content                                                                                                              | Implemented with sticky section navigation; claims flagged                                                           |
| `/terms`             | `/terms`             | Nine legal sections and trading-risk disclaimer                                                                                                                                                                                                                             | Implemented as reference-derived legal draft                                                                         |
| `/privacy`           | `/privacy`           | Ten privacy and data-handling sections                                                                                                                                                                                                                                      | Implemented as reference-derived legal draft                                                                         |
| `/auth?tab=register` | `/auth?tab=register` | First name, last name, email, password, country, password visibility, account CTA, switch to login, security messaging, visual product panel                                                                                                                                | Implemented as safe local demo; no submission                                                                        |
| `/auth?tab=login`    | `/auth?tab=login`    | Email, password, password visibility, sign-in CTA, switch to register, forgot-password behavior, security messaging, visual product panel                                                                                                                                   | Implemented as safe local demo; no submission                                                                        |

The Blog had no article detail links at audit time, so no article routes were required.

## Homepage section order

- Sticky navigation with brand, Features, Pricing, Affiliate, FAQ, theme control, Get Started, and Login.
- Hero: “AI Gold Scalping Trading Platform for MT4 and MT5,” supporting paragraph, primary CTA, compatibility/risk/setup indicators.
- Horizontally moving trading-result cards.
- “Start Automated Trading in 3 Simple Steps.”
- “A Complete AI Trading Platform.”
- “Your AI Trading Intelligence” with agent-interface visual.
- “AI Market Score Engine” with four risk modes and seven score factors.
- “Choose Your Trading Plan,” billing toggle, three pricing cards, and comparison table.
- “Earn 20% Lifetime Commission.”
- Ten-item FAQ accordion.
- Final account CTA.
- Four-column footer.

## Exact key interactive copy

### Monthly pricing

- Free: `$0`, free forever.
- Pro: `$299 / Month`.
- Elite: `$999 / Month`.

### Yearly pricing

- Free: `$0`, free forever.
- Pro: `$1,799 / Year`, “~$150/mo — save 50%”.
- Elite: `$5,999 / Year`, “~$500/mo — save 50%”.

### FAQ inventory

- Is this compatible with MT4 and MT5?
- What is the minimum deposit to get started?
- How does the AI decide when to trade?
- What do the risk levels mean?
- Why does the system sometimes stop trading?
- How much can I earn per month?
- Do I need trading experience?
- Can I test with a demo account?
- Are the results shown on the website real?
- What is the difference between Free, Pro, and Elite?

The complete FAQ answers and exact audited page text are retained in `reference-interactions.json` and `reference-pages.json` for verification.

## Responsive and motion observations

- Desktop uses a centered 1180–1200px content rail, three-column pricing, two-column feature/risk grids, and a four-column footer.
- Mobile uses a disclosure navigation, full-width cards, single-column pricing, horizontally scrollable comparison content, smaller typography, and reduced section padding.
- The reference uses entrance transitions, glowing buttons, accordion animation, a moving performance-card rail, pricing-toggle state, sticky navigation, and hover elevation.
- Reduced-motion behavior was not exposed by the reference UI; Cash Lab adds an explicit `prefers-reduced-motion` fallback.
- The live reference rendered duplicated section groups in desktop and mobile full-page captures. This appeared to be a responsive implementation defect. Cash Lab implements each semantic section once.

## Branding and destination changes

- Replaced the original company name with Cash Lab while preserving “MEV” only where it would mean Maximal Extractable Value. No visible Cash Lab page currently needs the generic technical term.
- Replaced all reference logos and metadata artwork with the supplied Cash Lab assets.
- Removed the reference company’s social profiles, broker affiliate destination, support destinations, domain, and legal identity.
- All public CTAs route to the local Cash Lab `/auth` demonstration instead of any reference-company service.
- Missing business destinations and legal details are centralized in `lib/site-config.ts` as typed TODO values.

## Cash Lab verification checklist

- [x] All audited public routes exist.
- [x] Homepage information hierarchy is preserved, with the requested removal of pricing and addition of the 70/30 commission model.
- [x] Navigation, mobile disclosure, commission and FAQ anchor links, FAQ accordion, and safe forms work.
- [x] The full user-guide, changelog, legal, privacy, about, and empty-blog copy is present and rebranded.
- [x] Reference social, broker, signup, and domain links are removed from the public site.
- [x] Official Cash Lab wordmark and icon assets are used without redrawing.
- [x] Pure-black logo background was removed deterministically and the artwork was tightly cropped.
- [x] App icons preserve the original artwork aspect ratio on transparent square canvases.
- [x] Official green `#26C626` is the central design token.
- [x] Sora and Manrope are locally bundled.
- [x] Forms validate and clearly state that no live backend delivery occurred.
- [x] Focus, keyboard, touch, reduced-motion, and contrast states are implemented.
- [x] Sitemap, robots, manifest, per-route metadata, favicons, and social card are present.
- [ ] Cash Lab must supply a production canonical URL.
- [ ] Cash Lab must supply its support email and support destination.
- [ ] Cash Lab must supply or approve its social-profile URLs.
- [ ] Cash Lab must provide legal entity name, address, governing law, jurisdiction, and approved effective dates.
- [ ] Cash Lab must define the calculation period, settlement timing, eligible profit, and exclusions for the 70/30 commission model in its client agreement.
- [ ] Cash Lab must verify every deposit, balance, profit-target, support, product-capability, security, compatibility, wallet, withdrawal, changelog, and performance claim before publication.

## Unavoidable or intentional differences

- Proprietary reference graphics were replaced with original CSS-based charts, grids, panels, and data visualizations to avoid copying protected artwork.
- Reference performance examples are labeled as unverified examples rather than represented as Cash Lab results.
- Reference legal documents are visibly identified as drafts pending Cash Lab legal review.
- Original social and broker links are omitted because Cash Lab destinations were not supplied.
- Authentication is a local demonstration with honest feedback because no Cash Lab backend was supplied.
- The duplicated responsive sections visible on the reference site were normalized into one accessible instance per section.
- The reference pricing, plan comparison, and 20% affiliate offer are intentionally omitted from Cash Lab. Cash Lab instead presents a 70% client / 30% company realized-profit commission split.
