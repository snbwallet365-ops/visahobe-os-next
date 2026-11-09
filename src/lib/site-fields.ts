// Single source of truth for every editable letter & color on the public frontend.
// Values may contain {brand} and {year} tokens which are resolved at render time.

export const SECTIONS = [
  { id: "brand", label: "Brand & SEO" },
  { id: "theme", label: "Theme & Colors" },
  { id: "nav", label: "Header" },
  { id: "hero", label: "Hero" },
  { id: "showcase", label: "Showcase cards" },
  { id: "features", label: "Features" },
  { id: "superagents", label: "Superagents" },
  { id: "pricing", label: "Pricing" },
  { id: "footer", label: "CTA & Footer" },
  { id: "auth", label: "Sign up / Log in" },
  { id: "dashboard", label: "User dashboard" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];
export type FieldType = "text" | "textarea" | "list" | "color" | "font" | "number";
export type Field = { key: string; label: string; section: SectionId; type: FieldType; default: string; aliases?: string[] };

const f = (section: SectionId, key: string, label: string, def: string, type: FieldType = "text", aliases?: string[]): Field => ({
  key,
  label,
  section,
  type,
  default: def,
  aliases,
});

export const FIELDS: Field[] = [
  // Brand
  f("brand", "brand.name", "Brand name", "Visa44", "text", ["brand", "brand name", "name", "logo", "logo text", "site name", "company name", "app name"]),
  f("brand", "seo.title", "Browser tab title", "{brand} — Every builder needs a base", "text", ["seo title", "page title", "tab title", "meta title"]),
  f("brand", "seo.description", "SEO description", "Build your own apps, websites, products and AI agents on {brand} using your own words.", "textarea", ["meta description", "seo description"]),

  // Theme
  f("theme", "theme.accent", "Accent color", "#FF5C1A", "color", ["accent", "accent color", "brand color", "main color", "primary color", "orange", "button color", "cta color", "highlight color"]),
  f("theme", "theme.accentHover", "Accent hover color", "#EB4A0A", "color", ["accent hover", "hover color"]),
  f("theme", "theme.primary", "Dark button color", "#0A0A0A", "color", ["dark button", "black button", "secondary button color", "primary button"]),
  f("theme", "theme.primaryText", "Dark button text color", "#FFFFFF", "color", ["dark button text"]),
  f("theme", "theme.background", "Page background color", "#FFFFFF", "color", ["background", "background color", "bg", "page background", "page color"]),
  f("theme", "theme.panel", "Panel / sidebar background", "#F7F7F8", "color", ["panel", "panel color", "sidebar", "sidebar color", "muted background", "section background"]),
  f("theme", "theme.card", "Card background", "#FFFFFF", "color", ["card", "card color", "card background", "surface"]),
  f("theme", "theme.text", "Main text color", "#0A0A0A", "color", ["text", "text color", "heading color", "font color", "title color"]),
  f("theme", "theme.textSecondary", "Secondary text color", "#52525B", "color", ["secondary text", "paragraph color", "body text color"]),
  f("theme", "theme.textMuted", "Muted text color", "#A1A1AA", "color", ["muted text", "label color", "footer text color"]),
  f("theme", "theme.border", "Border color", "#ECECF0", "color", ["border", "border color", "lines", "divider"]),
  f("theme", "theme.gradient1", "Hero glow color 1", "#FFB38A", "color", ["gradient 1", "glow 1", "hero gradient"]),
  f("theme", "theme.gradient2", "Hero glow color 2", "#FF9EC2", "color", ["gradient 2", "glow 2"]),
  f("theme", "theme.gradient3", "Hero glow color 3", "#A9C1FF", "color", ["gradient 3", "glow 3"]),
  f("theme", "theme.font", "Font family (Google Font)", "Inter", "font", ["font", "font family", "typeface", "typography"]),
  f("theme", "theme.radius", "Corner radius (px)", "14", "number", ["radius", "corner radius", "corners", "rounded", "roundness"]),

  // Header
  f("nav", "nav.product", "Nav link: Product", "Product"),
  f("nav", "nav.superagents", "Nav link: Superagents", "Superagents"),
  f("nav", "nav.pricing", "Nav link: Pricing", "Pricing"),
  f("nav", "nav.enterprise", "Nav link: Enterprise", "Enterprise"),
  f("nav", "nav.login", "Header Log in link", "Log in", "text", ["login link", "log in link"]),
  f("nav", "nav.cta", "Header Start building button", "Start building", "text", ["start building", "start building button", "header button", "cta button", "top button"]),
  f("nav", "nav.dashboard", "Header dashboard button (logged in)", "Go to dashboard"),

  // Hero
  f("hero", "hero.badgeTag", "Hero badge tag", "New"),
  f("hero", "hero.badge", "Hero badge text", "Superagents — AI that works 24/7", "text", ["badge", "announcement"]),
  f("hero", "hero.title", "Hero headline", "Every builder needs a base", "text", ["headline", "hero title", "hero headline", "main title", "heading", "title"]),
  f("hero", "hero.subtitle", "Hero subheadline", "Build your own apps, websites, products and AI agents on {brand} using your own words. Get ahead — and make sure it stays that way.", "textarea", ["subheadline", "subtitle", "hero subtitle", "tagline", "hero description"]),
  f("hero", "hero.placeholder", "Prompt box placeholder", "What would you build?", "text", ["placeholder", "prompt placeholder", "input placeholder"]),
  f("hero", "hero.button", "Build button", "Build", "text", ["build button", "submit button"]),
  f("hero", "hero.cat1", "Category pill 1", "Apps"),
  f("hero", "hero.cat2", "Category pill 2", "Websites"),
  f("hero", "hero.cat3", "Category pill 3", "Games"),
  f("hero", "hero.cat4", "Category pill 4", "Tools"),
  f("hero", "hero.suggestions", "Prompt suggestions (one per line)", "Customer portal\nBooking app\nInventory tracker\nAI support agent", "list", ["suggestions"]),
  f("hero", "hero.trust", "Trust line under prompt", "Trusted by 2M+ builders · No credit card required", "text", ["trust line", "trust text"]),

  // Showcase
  f("showcase", "showcase.analyticsTitle", "Analytics card label", "Monthly revenue"),
  f("showcase", "showcase.analyticsValue", "Analytics card value", "$48,290"),
  f("showcase", "showcase.analyticsChange", "Analytics card change", "+18.2% vs last month"),
  f("showcase", "showcase.stats", "Analytics mini stats (label|value per line)", "Active users|12.4k\nConversion|4.8%\nAvg. order|$86", "list"),
  f("showcase", "showcase.widgetsTitle", "Widgets card label", "Modular widgets"),
  f("showcase", "showcase.meeting", "Widgets: next meeting", "Design review · 14:00"),
  f("showcase", "showcase.productLabel", "E-commerce card label", "E-commerce card"),
  f("showcase", "showcase.productName", "Product name", "Ceramic Pour-Over Set"),
  f("showcase", "showcase.productPrice", "Product price", "$64.00"),
  f("showcase", "showcase.productCta", "Product button", "Add to cart"),

  // Features
  f("features", "features.eyebrow", "Features eyebrow", "Everything included"),
  f("features", "features.title", "Features title", "From idea to live product, in one place"),
  f("features", "features.subtitle", "Features subtitle", "No stitching services together. {brand} ships every app with the infrastructure it needs on day one.", "textarea"),
  f("features", "features.f1Title", "Feature 1 title", "Backend and storage, built in", "text", ["backend title"]),
  f("features", "features.f1Desc", "Feature 1 description", "Database, authentication, file storage and serverless functions are created automatically from your description. Schema syncs as you chat.", "textarea"),
  f("features", "features.f2Title", "Feature 2 title", "One-click integrations", "text", ["integrations title"]),
  f("features", "features.f2Desc", "Feature 2 description", "Connect payments, email, messaging and AI models without touching an API key. Just ask — {brand} wires it up.", "textarea"),
  f("features", "features.f3Title", "Feature 3 title", "SEO/GEO dashboard", "text", ["seo title feature"]),
  f("features", "features.f3Desc", "Feature 3 description", "Get found on Google and in AI answers. Track rankings, AI citations and page health — and fix issues with one prompt.", "textarea"),
  f("features", "features.f4Title", "Feature 4 title", "Superagents", "text"),
  f("features", "features.f4Desc", "Feature 4 description", "AI agents that run 24/7 — answering customers on WhatsApp, triaging email and executing backend tasks while you sleep.", "textarea"),

  // Superagents
  f("superagents", "sa.eyebrow", "Superagents eyebrow", "Superagents"),
  f("superagents", "sa.title", "Superagents title", "Your team that never clocks out"),
  f("superagents", "sa.desc", "Superagents description", "Describe the job in plain language. Your Superagent connects to WhatsApp Business, reads your app data, and executes backend tasks — creating tickets, looking up orders, booking appointments — around the clock.", "textarea"),
  f("superagents", "sa.bullets", "Superagents bullet points (one per line)", "Supervisor & customer support roles\nWhatsApp Business API webhooks in minutes\nTool calls against your own data\nHuman hand-off when it matters", "list"),
  f("superagents", "sa.cta", "Superagents button", "Create a Superagent"),
  f("superagents", "sa.templatesTitle", "Templates heading", "Start from a template — it's live in one tap"),
  f("superagents", "sa.tpl1Title", "Template 1 title", "WhatsApp Support"),
  f("superagents", "sa.tpl1Desc", "Template 1 description", "Answers customers, tracks orders, opens tickets.", "textarea"),
  f("superagents", "sa.tpl2Title", "Template 2 title", "Sales Assistant"),
  f("superagents", "sa.tpl2Desc", "Template 2 description", "Qualifies leads and sends quotes on WhatsApp.", "textarea"),
  f("superagents", "sa.tpl3Title", "Template 3 title", "Booking Concierge"),
  f("superagents", "sa.tpl3Desc", "Template 3 description", "Books appointments and sends reminders.", "textarea"),
  f("superagents", "sa.tpl4Title", "Template 4 title", "Supervisor Agent"),
  f("superagents", "sa.tpl4Desc", "Template 4 description", "Routes every message and delegates backend tasks.", "textarea"),

  // Pricing
  f("pricing", "pricing.eyebrow", "Pricing eyebrow", "Pricing"),
  f("pricing", "pricing.title", "Pricing title", "Start free. Scale when you're ready."),
  f("pricing", "pricing.subtitle", "Pricing subtitle", "Every plan includes hosting, database, authentication and integrations.", "textarea"),
  f("pricing", "pricing.freeName", "Free plan name", "Free"),
  f("pricing", "pricing.freePrice", "Free plan price", "$0", "text", ["free price"]),
  f("pricing", "pricing.period", "Price period", "/mo"),
  f("pricing", "pricing.freeDesc", "Free plan description", "Everything you need to try {brand} and ship your first app.", "textarea"),
  f("pricing", "pricing.freeFeatures", "Free plan features (one per line)", "25 message credits / month\nUnlimited apps\nBuilt-in database & auth\n{brand} subdomain", "list"),
  f("pricing", "pricing.freeCta", "Free plan button", "Start Building"),
  f("pricing", "pricing.paidName", "Paid plan name", "Paid plans"),
  f("pricing", "pricing.paidFrom", "Paid 'from' label", "from"),
  f("pricing", "pricing.paidPrice", "Paid plan price", "$16", "text", ["paid price", "price"]),
  f("pricing", "pricing.paidBadge", "Paid plan badge", "Most popular"),
  f("pricing", "pricing.paidDesc", "Paid plan description", "More credits, custom domains, Superagents and team collaboration.", "textarea"),
  f("pricing", "pricing.paidFeatures", "Paid plan features (one per line)", "Up to 10,000 message credits\nCustom domains & SEO/GEO dashboard\nSuperagents running 24/7\nPriority support", "list"),
  f("pricing", "pricing.paidCta", "Paid plan button", "See all plans"),

  // Footer
  f("footer", "cta.title", "Bottom CTA title", "What will you build today?"),
  f("footer", "footer.tagline", "Footer tagline", "The AI app builder for people who build. Apps, websites and agents — from a sentence.", "textarea"),
  f("footer", "footer.col1Title", "Footer column 1 title", "Product"),
  f("footer", "footer.col1Links", "Footer column 1 links", "Features\nSuperagents\nIntegrations\nPricing", "list"),
  f("footer", "footer.col2Title", "Footer column 2 title", "Resources"),
  f("footer", "footer.col2Links", "Footer column 2 links", "Docs\nSDK\nChangelog\nCommunity", "list"),
  f("footer", "footer.col3Title", "Footer column 3 title", "Company"),
  f("footer", "footer.col3Links", "Footer column 3 links", "About\nCareers\nPrivacy\nTerms", "list"),
  f("footer", "footer.copyright", "Copyright", "© {year} {brand}. All rights reserved.", "text", ["copyright"]),
  f("footer", "footer.note", "Footer note", "Made for builders, everywhere."),

  // Auth
  f("auth", "auth.signupTitle", "Sign up title", "Create your account", "text", ["signup title", "sign up title"]),
  f("auth", "auth.signupSubtitle", "Sign up subtitle", "Start building with {brand} for free"),
  f("auth", "auth.loginTitle", "Log in title", "Welcome back", "text", ["login title"]),
  f("auth", "auth.loginSubtitle", "Log in subtitle", "Log in to your {brand} account"),
  f("auth", "auth.ssoSignup", "SSO prefix (sign up)", "Sign up with"),
  f("auth", "auth.ssoLogin", "SSO prefix (log in)", "Log in with"),
  f("auth", "auth.or", "Divider text", "Or"),
  f("auth", "auth.email", "Email label", "Email"),
  f("auth", "auth.emailPlaceholder", "Email placeholder", "you@company.com"),
  f("auth", "auth.password", "Password label", "Password"),
  f("auth", "auth.signupButton", "Sign up button", "Sign up", "text", ["signup button", "sign up button"]),
  f("auth", "auth.loginButton", "Log in button", "Log in", "text", ["login button"]),
  f("auth", "auth.haveAccount", "Already have account text", "Already have a {brand} account?"),
  f("auth", "auth.loginLink", "Log in link", "Log in"),
  f("auth", "auth.noAccount", "No account text", "New to {brand}?"),
  f("auth", "auth.signupLink", "Create account link", "Create an account"),
  f("auth", "auth.terms", "Terms notice", "By continuing, you agree to {brand}'s Terms of Service and Privacy Policy.", "textarea"),

  // Dashboard
  f("dashboard", "dash.heading", "Dashboard heading", "What would you build today?", "text", ["dashboard heading", "dashboard title"]),
  f("dashboard", "dash.subheading", "Dashboard subheading", "Describe your idea — {brand} builds it with backend, auth and hosting included."),
  f("dashboard", "dash.agentsTitle", "Dashboard Superagents title", "Superagents"),
  f("dashboard", "dash.projectsTitle", "Dashboard projects title", "Your apps"),
  f("dashboard", "dash.emptyTitle", "No projects title", "No apps yet"),
  f("dashboard", "dash.emptyDesc", "No projects description", "Describe your idea above and {brand} will build it."),
  f("dashboard", "dash.upgradeTitle", "Upgrade card title", "Upgrade to Builder"),
  f("dashboard", "dash.upgradeDesc", "Upgrade card description", "Unlock Superagents 24/7, custom domains and more credits.", "textarea"),
  f("dashboard", "dash.upgradeCta", "Upgrade card button", "From $16/mo"),
];

export const FIELD_MAP: Record<string, Field> = Object.fromEntries(FIELDS.map((x) => [x.key, x]));
export const DEFAULTS: Record<string, string> = Object.fromEntries(FIELDS.map((x) => [x.key, x.default]));

export type Content = Record<string, string>;

export function resolveContent(raw: Content): Content {
  const brand = raw["brand.name"] || "Visa44";
  const year = String(new Date().getFullYear());
  const out: Content = {};
  for (const [k, v] of Object.entries(raw)) out[k] = v.replaceAll("{brand}", brand).replaceAll("{year}", year);
  return out;
}

export function lines(v: string | undefined) {
  return (v ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
}

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

export function normalizeValue(key: string, value: string): string | null {
  const field = FIELD_MAP[key];
  if (!field) return null;
  const v = value.replace(/\r/g, "");
  if (field.type === "color") {
    const c = v.trim();
    if (!HEX.test(c)) return null;
    if (c.length === 4) return ("#" + c.slice(1).split("").map((x) => x + x).join("")).toUpperCase();
    return c.toUpperCase();
  }
  if (field.type === "number") {
    const n = Number(v.replace(/[^\d.]/g, ""));
    if (!Number.isFinite(n)) return null;
    return String(Math.max(0, Math.min(32, Math.round(n))));
  }
  if (field.type === "font") {
    const fnt = v.trim().replace(/["';{}]/g, "");
    if (!/^[A-Za-z0-9 ]{2,40}$/.test(fnt)) return null;
    return fnt.replace(/\b\w/g, (m) => m.toUpperCase());
  }
  return v.slice(0, 2000);
}

function safeColor(v: string | undefined, d: string) {
  return v && HEX.test(v) ? v : d;
}

export function themeCss(c: Content) {
  const g = (k: string) => safeColor(c[k], DEFAULTS[k]);
  const font = /^[A-Za-z0-9 ]{2,40}$/.test(c["theme.font"] ?? "") ? c["theme.font"] : "Inter";
  const radius = Math.max(0, Math.min(32, Number(c["theme.radius"]) || 14));
  return `:root{--color-page:${g("theme.background")};--color-panel:${g("theme.panel")};--color-card:${g("theme.card")};--color-fg:${g("theme.text")};--color-fg-2:${g("theme.textSecondary")};--color-fg-3:${g("theme.textMuted")};--color-line:${g("theme.border")};--color-accent:${g("theme.accent")};--color-accent-hover:${g("theme.accentHover")};--color-primary:${g("theme.primary")};--color-primary-fg:${g("theme.primaryText")};--color-g1:${g("theme.gradient1")};--color-g2:${g("theme.gradient2")};--color-g3:${g("theme.gradient3")};--radius-card:${radius}px;--radius-btn:${Math.max(0, Math.round(radius * 0.72))}px;--font-sans:"${font}",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;}`;
}

export function fontHref(c: Content) {
  const font = /^[A-Za-z0-9 ]{2,40}$/.test(c["theme.font"] ?? "") ? c["theme.font"] : "Inter";
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font).replace(/%20/g, "+")}:wght@400;500;600;700&display=swap`;
}

export const THEME_PRESETS: { id: string; name: string; values: Content }[] = [
  { id: "visa", name: "Visa44 Orange (default)", values: pickTheme({}) },
  { id: "ocean", name: "Ocean Blue", values: pickTheme({ "theme.accent": "#2563EB", "theme.accentHover": "#1D4ED8", "theme.gradient1": "#93C5FD", "theme.gradient2": "#A5B4FC", "theme.gradient3": "#67E8F9" }) },
  { id: "emerald", name: "Emerald", values: pickTheme({ "theme.accent": "#059669", "theme.accentHover": "#047857", "theme.gradient1": "#6EE7B7", "theme.gradient2": "#A7F3D0", "theme.gradient3": "#93C5FD" }) },
  { id: "violet", name: "Violet", values: pickTheme({ "theme.accent": "#7C3AED", "theme.accentHover": "#6D28D9", "theme.gradient1": "#C4B5FD", "theme.gradient2": "#F0ABFC", "theme.gradient3": "#A5B4FC" }) },
  { id: "rose", name: "Rose", values: pickTheme({ "theme.accent": "#E11D48", "theme.accentHover": "#BE123C", "theme.gradient1": "#FDA4AF", "theme.gradient2": "#FBCFE8", "theme.gradient3": "#FED7AA" }) },
  {
    id: "midnight",
    name: "Midnight (dark)",
    values: pickTheme({
      "theme.background": "#09090B", "theme.panel": "#111113", "theme.card": "#16161A", "theme.text": "#FAFAFA", "theme.textSecondary": "#A1A1AA",
      "theme.textMuted": "#71717A", "theme.border": "#26262B", "theme.primary": "#FAFAFA", "theme.primaryText": "#0A0A0A",
      "theme.gradient1": "#7C2D12", "theme.gradient2": "#831843", "theme.gradient3": "#1E3A8A",
    }),
  },
];

function pickTheme(over: Content): Content {
  const base: Content = {};
  for (const fl of FIELDS) if (fl.section === "theme" && fl.key !== "theme.font" && fl.key !== "theme.radius") base[fl.key] = fl.default;
  return { ...base, ...over };
}
