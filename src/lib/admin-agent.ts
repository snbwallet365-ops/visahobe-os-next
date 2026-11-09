import { DEFAULTS, FIELDS, FIELD_MAP, SECTIONS, THEME_PRESETS, type Content, type Field } from "@/lib/site-fields";

export type AgentResult = {
  reply: string;
  changes: Content;
  action?: "undo";
};

const COLOR_NAMES: Record<string, string> = {
  red: "#EF4444", orange: "#FF5C1A", amber: "#F59E0B", yellow: "#EAB308", lime: "#84CC16", green: "#16A34A",
  emerald: "#059669", teal: "#0D9488", cyan: "#0891B2", sky: "#0EA5E9", blue: "#2563EB", indigo: "#4F46E5",
  violet: "#7C3AED", purple: "#9333EA", fuchsia: "#C026D3", pink: "#DB2777", rose: "#E11D48", black: "#0A0A0A",
  white: "#FFFFFF", gray: "#6B7280", grey: "#6B7280", slate: "#475569", zinc: "#52525B", navy: "#1E3A8A",
  gold: "#CA8A04", brown: "#92400E", coral: "#F05A28", whatsapp: "#25D366", maroon: "#7F1D1D", mint: "#10B981",
  lavender: "#A78BFA", beige: "#F5F5DC", cream: "#FFFBEB", magenta: "#D946EF", turquoise: "#14B8A6",
};

const BN_COLORS: Record<string, string> = {
  লাল: "red", কমলা: "orange", হলুদ: "yellow", সবুজ: "green", নীল: "blue", বেগুনি: "purple", গোলাপি: "pink", কালো: "black", সাদা: "white", ধূসর: "gray",
};

const STOP = new Set(["the", "a", "an", "of", "on", "in", "for", "my", "site", "website", "page", "please", "to", "is", "all", "and", "with", "this"]);

function tokens(s: string) {
  return s
    .toLowerCase()
    .replace(/colour/g, "color")
    .replace(/[^a-z0-9\s.]/g, " ")
    .split(/[\s.]+/)
    .filter((t) => t && !STOP.has(t));
}

export function matchField(phrase: string): Field | null {
  const p = phrase.toLowerCase().replace(/colour/g, "color").replace(/^the\s+/, "").trim();
  if (!p) return null;
  const direct = FIELDS.find((x) => x.key.toLowerCase() === p || x.label.toLowerCase() === p || x.aliases?.includes(p));
  if (direct) return direct;
  const pt = tokens(p);
  if (!pt.length) return null;
  let best: Field | null = null;
  let bestScore = 0;
  for (const fl of FIELDS) {
    const ft = new Set([...tokens(fl.label), ...tokens(fl.key), ...(fl.aliases ?? []).flatMap(tokens)]);
    const arr = Array.from(ft);
    const hit = pt.filter((t) => ft.has(t) || arr.some((x) => x.length > 3 && t.length > 3 && (x.startsWith(t) || t.startsWith(x)))).length;
    let score = hit / pt.length + hit * 0.04;
    if (/\bcolor\b/.test(p) && fl.type === "color") score += 0.15;
    if (!/\bcolor\b/.test(p) && fl.type === "color" && !/background|border|accent|gradient|glow|text/.test(p)) score -= 0.2;
    if (fl.aliases?.some((a) => a.length > 3 && p.includes(a))) score += 0.35;
    if (score > bestScore) {
      bestScore = score;
      best = fl;
    }
  }
  return bestScore >= 0.55 ? best : null;
}

function suggestFields(phrase: string) {
  const pt = tokens(phrase);
  return FIELDS.map((fl) => {
    const ft = [...tokens(fl.label), ...tokens(fl.key)];
    return { fl, s: pt.filter((t) => ft.some((x) => x.includes(t) || t.includes(x))).length };
  })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 4)
    .map((x) => `• **${x.fl.label}** (\`${x.fl.key}\`)`);
}

function parseColor(raw: string): string | null {
  let v = raw.trim().toLowerCase().replace(/["'.]/g, "");
  for (const [bn, en] of Object.entries(BN_COLORS)) if (v.includes(bn)) v = en;
  const hex = v.match(/#?([0-9a-f]{6}|[0-9a-f]{3})\b/);
  if (hex && (v.startsWith("#") || /^[0-9a-f]{3,6}$/.test(v))) return "#" + hex[1].toUpperCase();
  const rgb = v.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgb) return "#" + rgb.slice(1, 4).map((n) => Math.min(255, Number(n)).toString(16).padStart(2, "0")).join("").toUpperCase();
  if (/\b(light|pale|soft) gr[ae]y\b/.test(v)) return "#F3F4F6";
  if (/\boff ?white\b/.test(v)) return "#FAFAF9";
  const name = Object.keys(COLOR_NAMES).find((n) => new RegExp(`\\b${n}\\b`).test(v));
  if (!name) return null;
  let hexv = COLOR_NAMES[name];
  if (/\b(dark|deep)\b/.test(v)) hexv = shade(hexv, -0.3);
  if (/\b(light|pale|soft)\b/.test(v)) hexv = shade(hexv, 0.45);
  return hexv;
}

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => (amt < 0 ? Math.round(c * (1 + amt)) : Math.round(c + (255 - c) * amt)));
  return "#" + ch.map((c) => c.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function stripQuotes(s: string) {
  return s.trim().replace(/^["“'`]+|["”'`]+$/g, "").trim();
}

function valueFor(field: Field, raw: string): string | null {
  const v = stripQuotes(raw);
  if (field.type === "color") return parseColor(v);
  if (field.type === "number") return v.match(/\d+/)?.[0] ?? null;
  if (field.type === "font") return v.replace(/\b(font|family)\b/gi, "").trim() || null;
  return v.replace(/\\n/g, "\n");
}

const HELP = `Here's what I can do — I know every letter and color on the frontend (${FIELDS.length} fields across ${SECTIONS.length} sections):

**Change any text**
• \`Set hero headline to "Build anything, fast"\`
• \`Change header start building button to "Get started"\`
• \`Replace "Start building" with "Launch now"\` (everywhere)
• \`Change brand name to Nova44\`

**Change colors & style**
• \`Change accent color to blue\` / \`#7C3AED\`
• \`Make background color light gray\`
• \`Ocean theme\` · \`Dark mode\` · \`Light mode\`
• \`Change font to Poppins\` · \`Set corner radius to 20\`

**Inspect & manage**
• \`Show colors\` · \`List sections\` · \`Show hero\` · \`What is the hero title?\`
• \`Undo\` · \`Reset theme\` · \`Reset hero\` · \`Reset everything\``;

function sectionFields(id: string) {
  return FIELDS.filter((x) => x.section === id);
}

function findSection(phrase: string) {
  const p = phrase.toLowerCase();
  return SECTIONS.find((s) => p.includes(s.id) || p.includes(s.label.toLowerCase()) || (s.id === "theme" && /colou?rs?|theme|style/.test(p)) || (s.id === "auth" && /sign ?up|log ?in|auth/.test(p)) || (s.id === "nav" && /header|nav/.test(p)) || (s.id === "dashboard" && /dashboard/.test(p)));
}

function fmt(v: string) {
  const one = v.replace(/\n/g, " ⏎ ");
  return one.length > 90 ? one.slice(0, 90) + "…" : one;
}

function runOne(cmdRaw: string, content: Content): AgentResult {
  const cmd = cmdRaw.trim().replace(/[.!]+$/, "");
  const lower = cmd.toLowerCase();

  if (!cmd || /^(help|\?|commands|what can you do|হেল্প|সাহায্য)/.test(lower)) return { reply: HELP, changes: {} };
  if (/^(undo|revert|go back|আনডু)\b/.test(lower)) return { reply: "", changes: {}, action: "undo" };

  // Presets
  if (/\b(dark mode|dark theme|midnight)\b/.test(lower)) {
    const p = THEME_PRESETS.find((x) => x.id === "midnight")!;
    return { reply: "🌙 Switched the whole site to **Midnight (dark)** theme.", changes: p.values };
  }
  if (/\b(light mode|light theme|white theme|default theme)\b/.test(lower)) {
    const p = THEME_PRESETS.find((x) => x.id === "visa")!;
    return { reply: "☀️ Restored the **white / light** theme with the default orange accent.", changes: p.values };
  }
  const presetMatch = lower.match(/^(?:use |apply |switch to |make it )?(ocean|blue|emerald|green|violet|purple|rose|pink|orange)\s+(theme|preset)$/);
  if (presetMatch) {
    const map: Record<string, string> = { ocean: "ocean", blue: "ocean", emerald: "emerald", green: "emerald", violet: "violet", purple: "violet", rose: "rose", pink: "rose", orange: "visa" };
    const p = THEME_PRESETS.find((x) => x.id === map[presetMatch[1]])!;
    return { reply: `🎨 Applied the **${p.name}** theme preset.`, changes: p.values };
  }

  // Reset
  const reset = lower.match(/^reset\s+(.+)$/);
  if (reset) {
    const target = reset[1];
    if (/^(all|everything|site|whole site|all content)$/.test(target)) {
      const ch: Content = {};
      for (const fl of FIELDS) if (content[fl.key] !== fl.default) ch[fl.key] = fl.default;
      return { reply: `♻️ Reset **everything** to defaults (${Object.keys(ch).length} fields changed).`, changes: ch };
    }
    const fl = matchField(target);
    const sec = findSection(target);
    if (sec && (!fl || /section|theme|colou?rs|all/.test(target) || target.trim() === sec.id)) {
      const ch: Content = {};
      for (const x of sectionFields(sec.id)) if (content[x.key] !== x.default) ch[x.key] = x.default;
      return { reply: `♻️ Reset the **${sec.label}** section to defaults.`, changes: ch };
    }
    if (fl) return { reply: `♻️ Reset **${fl.label}** to its default.`, changes: { [fl.key]: fl.default } };
    return { reply: `I couldn't find "${target}" to reset. Try \`reset theme\`, \`reset hero\` or \`reset everything\`.`, changes: {} };
  }

  // Listing
  if (/^(list|show)\s+(sections|all sections|fields|keys)/.test(lower)) {
    return {
      reply: "**Sections**\n" + SECTIONS.map((s) => `• **${s.label}** — ${sectionFields(s.id).length} fields (say \`show ${s.id}\`)`).join("\n"),
      changes: {},
    };
  }
  const show = lower.match(/^(?:show|list|view)\s+(.+)$/);
  if (show) {
    const sec = findSection(show[1]);
    const fl = matchField(show[1]);
    if (sec && (!fl || show[1].trim() === sec.id || /colou?rs|theme|section/.test(show[1]))) {
      return {
        reply: `**${sec.label}**\n` + sectionFields(sec.id).map((x) => `• ${x.label}: \`${fmt(content[x.key])}\``).join("\n"),
        changes: {},
      };
    }
    if (fl) return { reply: `**${fl.label}** (\`${fl.key}\`)\n\`${fmt(content[fl.key])}\``, changes: {} };
  }
  const what = lower.match(/^(?:what is|what's|whats|get|current)\s+(?:the\s+)?(.+?)\??$/);
  if (what) {
    const fl = matchField(what[1]);
    if (fl) return { reply: `**${fl.label}** is currently:\n\`${fmt(content[fl.key])}\``, changes: {} };
  }

  // Replace text everywhere
  const rep = cmd.match(/^(?:replace|change|rename|swap)\s+["“'`](.+?)["”'`]\s+(?:with|to|into|by|->|→)\s+["“'`](.*?)["”'`]\s*(?:everywhere)?$/i);
  if (rep) {
    const [, from, to] = rep;
    const ch: Content = {};
    for (const fl of FIELDS) {
      if (fl.type === "color" || fl.type === "number" || fl.type === "font") continue;
      const cur = content[fl.key];
      if (cur.includes(from)) ch[fl.key] = cur.split(from).join(to);
    }
    const n = Object.keys(ch).length;
    if (!n) return { reply: `I couldn't find the text "${from}" anywhere on the frontend. Text is case-sensitive — try \`show hero\` to see exact values.`, changes: {} };
    return { reply: `🔁 Replaced "${from}" → "${to}" in ${n} place${n > 1 ? "s" : ""}:\n` + Object.keys(ch).map((k) => `• ${FIELD_MAP[k].label}`).join("\n"), changes: ch };
  }

  // Direct key assignment: hero.title = Something
  const kv = cmd.match(/^([a-z]+\.[a-zA-Z0-9]+)\s*[:=]\s*([\s\S]+)$/);
  if (kv && FIELD_MAP[kv[1]]) {
    const fl = FIELD_MAP[kv[1]];
    const v = valueFor(fl, kv[2]);
    if (v === null) return { reply: `That doesn't look like a valid ${fl.type} for **${fl.label}**.`, changes: {} };
    return { reply: `✅ **${fl.label}** → \`${fmt(v)}\``, changes: { [fl.key]: v } };
  }

  // Generic set: change X to Y
  const set = cmd.match(/^(?:please\s+)?(?:change|set|make|update|rename|turn|edit|paint|use)\s+(?:the\s+)?([\s\S]+?)\s+(?:to|=|as|into|:|->|→|with)\s+([\s\S]+)$/i);
  if (set) {
    let phrase = set[1];
    const raw = set[2];
    if (/^(?:the\s+)?(?:brand|name|logo|site name|app name)$/i.test(phrase)) phrase = "brand name";
    const fl = matchField(phrase);
    if (fl) {
      const v = valueFor(fl, raw);
      if (v === null) return { reply: `I understood **${fl.label}**, but "${stripQuotes(raw)}" isn't a valid ${fl.type}. ${fl.type === "color" ? "Use a hex like `#2563EB` or a name like `blue`, `dark green`." : ""}`, changes: {} };
      return { reply: `✅ **${fl.label}** → \`${fmt(v)}\``, changes: { [fl.key]: v } };
    }
    const sug = suggestFields(phrase);
    return { reply: `I couldn't tell which field "${phrase}" means.${sug.length ? "\nDid you mean:\n" + sug.join("\n") : ""}\n\nTip: \`list sections\` shows everything I can edit.`, changes: {} };
  }

  // "make buttons blue" / "buttons blue"
  const short = lower.match(/^(?:make\s+)?(?:the\s+)?(.+?)\s+(#[0-9a-f]{3,6}|(?:dark |light )?[a-z]+)$/);
  if (short) {
    const color = parseColor(short[2]);
    if (color) {
      const phrase = /button|accent|cta|brand|highlight/.test(short[1]) ? "accent color" : short[1] + " color";
      const fl = matchField(phrase);
      if (fl && fl.type === "color") return { reply: `✅ **${fl.label}** → \`${color}\``, changes: { [fl.key]: color } };
    }
  }

  // Bengali basics: "<field> রং নীল করো"
  if (/(রং|কালার|color)/.test(cmd) && /(করো|কর|দাও)/.test(cmd)) {
    const color = parseColor(cmd);
    if (color) {
      const fl = /ব্যাকগ্রাউন্ড|background/.test(cmd) ? FIELD_MAP["theme.background"] : /টেক্সট|লেখা|text/.test(cmd) ? FIELD_MAP["theme.text"] : FIELD_MAP["theme.accent"];
      return { reply: `✅ **${fl.label}** → \`${color}\``, changes: { [fl.key]: color } };
    }
  }

  return {
    reply: `I didn't quite get "${cmd}". Try something like:\n• \`Change accent color to blue\`\n• \`Set hero headline to "Ship faster"\`\n• \`Replace "Start building" with "Get started"\`\n\nType \`help\` for the full list.`,
    changes: {},
  };
}

export function interpretCommand(input: string, content: Content): AgentResult {
  const parts = input
    .split(/\n|;|\s+then\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length <= 1) return runOne(input, content);
  const all: Content = {};
  const replies: string[] = [];
  let working = { ...content };
  for (const p of parts) {
    const r = runOne(p, working);
    if (r.action === "undo") return { reply: "", changes: {}, action: "undo" };
    Object.assign(all, r.changes);
    working = { ...working, ...r.changes };
    replies.push(r.reply);
  }
  return { reply: replies.join("\n\n"), changes: all };
}

/* -------- Optional LLM path (used when OPENAI_API_KEY is set) -------- */

export async function llmCommand(input: string, content: Content, history: { role: string; content: string }[]): Promise<AgentResult | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const catalog = FIELDS.map((x) => `${x.key} [${x.type}] "${x.label}" = ${JSON.stringify(content[x.key]).slice(0, 160)}`).join("\n");
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are the admin site-editor agent for the website. You can change ANY text or color on the public frontend by calling update_content with exact keys from this catalog. Colors must be hex like #RRGGBB. Values may use {brand} and {year} tokens. Use undo to revert the last change. Reply briefly in the same language as the admin (English or Bengali) describing what you changed.\n\nCATALOG (key [type] "label" = current value):\n${catalog}`,
          },
          ...history.slice(-8),
          { role: "user", content: input },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "update_content",
              description: "Update one or more frontend fields.",
              parameters: {
                type: "object",
                properties: { changes: { type: "array", items: { type: "object", properties: { key: { type: "string" }, value: { type: "string" } }, required: ["key", "value"] } } },
                required: ["changes"],
              },
            },
          },
          { type: "function", function: { name: "undo", description: "Revert the most recent content change.", parameters: { type: "object", properties: {} } } },
        ],
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const msg = json.choices?.[0]?.message;
    const changes: Content = {};
    let action: "undo" | undefined;
    for (const c of msg?.tool_calls ?? []) {
      if (c.function?.name === "undo") action = "undo";
      if (c.function?.name === "update_content") {
        try {
          const args = JSON.parse(c.function.arguments) as { changes: { key: string; value: string }[] };
          for (const ch of args.changes ?? []) if (FIELD_MAP[ch.key]) changes[ch.key] = ch.value;
        } catch {
          /* ignore */
        }
      }
    }
    const reply: string =
      msg?.content || (Object.keys(changes).length ? "✅ Updated:\n" + Object.entries(changes).map(([k, v]) => `• **${FIELD_MAP[k].label}** → \`${fmt(v)}\``).join("\n") : "");
    if (!reply && !action) return null;
    return { reply, changes, action };
  } catch {
    return null;
  }
}

export { DEFAULTS };
