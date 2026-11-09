"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Loader2, RotateCcw, Search } from "lucide-react";
import { resetSectionAction, saveContentAction, type ContentSaveState } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { FIELDS, SECTIONS, THEME_PRESETS, type Content, type Field } from "@/lib/site-fields";
import { cn } from "@/lib/utils";

function FieldInput({ field, value, onChange }: { field: Field; value: string; onChange: (v: string) => void }) {
  if (field.type === "color") {
    return (
      <div className="flex items-center gap-2">
        <label className="relative h-11 w-14 shrink-0 cursor-pointer overflow-hidden rounded-btn border border-line" style={{ background: value }}>
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"} onChange={(e) => onChange(e.target.value.toUpperCase())} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
        </label>
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono uppercase" maxLength={9} />
      </div>
    );
  }
  if (field.type === "number") {
    return (
      <div className="flex items-center gap-3">
        <input type="range" min={0} max={32} value={Number(value) || 0} onChange={(e) => onChange(e.target.value)} className="flex-1 accent-[var(--color-accent)]" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="w-20 text-center" />
      </div>
    );
  }
  if (field.type === "font") {
    return (
      <div className="space-y-2">
        <Input value={value} onChange={(e) => onChange(e.target.value)} list="font-list" />
        <datalist id="font-list">
          {["Inter", "Geist", "Poppins", "Manrope", "DM Sans", "Plus Jakarta Sans", "Outfit", "Space Grotesk", "Roboto", "Lato", "Montserrat", "Hind Siliguri", "Noto Sans Bengali"].map((f) => <option key={f} value={f} />)}
        </datalist>
      </div>
    );
  }
  if (field.type === "textarea" || field.type === "list") {
    return <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={field.type === "list" ? 4 : 3} />;
  }
  return <Input value={value} onChange={(e) => onChange(e.target.value)} />;
}

export function ContentEditor({ initial, only }: { initial: Content; only?: string }) {
  const [values, setValues] = useState<Content>(initial);
  const [saved, setSaved] = useState<Content>(initial);
  const [section, setSection] = useState<string>(only ?? "brand");
  const [q, setQ] = useState("");
  const [state, setState] = useState<ContentSaveState>();
  const [pending, start] = useTransition();

  const dirty = useMemo(() => Object.keys(values).filter((k) => values[k] !== saved[k]), [values, saved]);
  const visible = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query) return FIELDS.filter((f) => f.label.toLowerCase().includes(query) || f.key.toLowerCase().includes(query) || values[f.key].toLowerCase().includes(query));
    return FIELDS.filter((f) => f.section === section);
  }, [q, section, values]);

  const save = () => {
    const changes: Content = {};
    for (const k of dirty) changes[k] = values[k];
    start(async () => {
      const r = await saveContentAction(changes);
      setState(r);
      if (!r?.error) setSaved({ ...values });
      setTimeout(() => setState(undefined), 2500);
    });
  };

  const reset = () => {
    if (!confirm(`Reset "${SECTIONS.find((s) => s.id === section)?.label}" to defaults?`)) return;
    start(async () => {
      await resetSectionAction(section);
      const next = { ...values };
      for (const f of FIELDS) if (f.section === section) next[f.key] = f.default;
      setValues(next);
      setSaved(next);
    });
  };

  return (
    <div className="pb-24">
      {!only && (
        <div className="sticky top-14 z-20 space-y-3 border-b border-line bg-page/95 px-4 py-3 backdrop-blur md:top-0 md:px-10">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${FIELDS.length} fields or any text on the site…`} className="pl-10" />
          </div>
          {!q && (
            <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
              {SECTIONS.map((s) => (
                <button key={s.id} onClick={() => setSection(s.id)} className={cn("h-8 shrink-0 rounded-full border px-3 text-[13px] font-medium transition", section === s.id ? "border-primary bg-primary text-primary-fg" : "border-line bg-card text-fg-2 hover:text-fg")}>
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {only === "theme" && (
        <div className="px-4 pt-5 md:px-10">
          <div className="mb-2 text-[13px] font-medium text-fg-2">Presets</div>
          <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:px-0 lg:grid-cols-6">
            {THEME_PRESETS.map((p) => (
              <button key={p.id} onClick={() => setValues((v) => ({ ...v, ...p.values }))} className="w-[150px] shrink-0 rounded-card border border-line bg-card p-3 text-left transition hover:shadow-float active:scale-[0.98] md:w-auto">
                <div className="flex h-12 overflow-hidden rounded-btn border border-line" style={{ background: p.values["theme.background"] }}>
                  <span className="m-2 h-8 w-8 rounded-full" style={{ background: p.values["theme.accent"] }} />
                  <span className="my-auto h-2 w-10 rounded" style={{ background: p.values["theme.text"] }} />
                </div>
                <div className="mt-2 truncate text-[12.5px] font-medium">{p.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-[980px] gap-3 px-4 py-5 md:grid-cols-2 md:px-10">
        {visible.length === 0 && <p className="col-span-full py-10 text-center text-[14px] text-fg-3">No fields match “{q}”.</p>}
        {visible.map((f) => (
          <div key={f.key} className={cn("rounded-card border bg-card p-4 transition", values[f.key] !== saved[f.key] ? "border-accent/50 ring-4 ring-accent/5" : "border-line", (f.type === "textarea" || f.type === "list") && "md:col-span-2")}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className="text-[13px] font-semibold">{f.label}</label>
              <div className="flex items-center gap-1.5">
                {values[f.key] !== f.default && (
                  <button onClick={() => setValues((v) => ({ ...v, [f.key]: f.default }))} className="rounded p-1 text-fg-3 hover:bg-panel hover:text-fg" title="Restore default"><RotateCcw className="h-3.5 w-3.5" /></button>
                )}
                <code className="hidden rounded bg-panel px-1.5 py-0.5 text-[10.5px] text-fg-3 sm:inline">{f.key}</code>
              </div>
            </div>
            <FieldInput field={f} value={values[f.key]} onChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))} />
            {f.type === "list" && <p className="mt-1.5 text-[11.5px] text-fg-3">One item per line.</p>}
            {/\{brand\}/.test(f.default) && <p className="mt-1.5 text-[11.5px] text-fg-3">Tip: <code className="rounded bg-panel px-1">{"{brand}"}</code> inserts the brand name automatically.</p>}
          </div>
        ))}
      </div>

      {/* Sticky save bar (mobile friendly) */}
      <div className="pb-safe fixed inset-x-0 bottom-[60px] z-30 border-t border-line bg-page/95 px-4 py-3 backdrop-blur md:bottom-0 md:left-[244px] md:px-10">
        <div className="mx-auto flex max-w-[980px] items-center gap-3">
          <div className="min-w-0 flex-1 text-[13px]">
            {state?.error ? <span className="text-red-600">{state.error}</span> : state?.ok ? <span className="flex items-center gap-1 text-emerald-600"><Check className="h-4 w-4" />Saved & live</span> : dirty.length ? <span className="text-fg-2">{dirty.length} unsaved change{dirty.length > 1 ? "s" : ""}</span> : <span className="text-fg-3">All changes saved</span>}
          </div>
          {!q && <Button variant="ghost" size="sm" onClick={reset} disabled={pending} className="hidden sm:inline-flex"><RotateCcw className="h-3.5 w-3.5" />Reset section</Button>}
          {dirty.length > 0 && <Button variant="secondary" size="md" onClick={() => setValues(saved)} disabled={pending}>Discard</Button>}
          <Button onClick={save} disabled={!dirty.length || pending} className="min-w-[110px] rounded-full">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish"}</Button>
        </div>
      </div>
    </div>
  );
}
