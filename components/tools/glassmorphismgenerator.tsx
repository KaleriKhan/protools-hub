"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Copy,
  Check,
  Sliders,
  Code,
  Zap,
  ShieldCheck,
  Layers,
  ChevronRight,
  Box,
  Type,
  Palette,
  Grid,
  Cpu,
  Compass,
  Layout,
  BookOpen,
  Search,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type Values = Record<string, string | number>;

type Control =
  | { key: string; label: string; type: "range"; min: number; max: number; step?: number; unit?: string }
  | { key: string; label: string; type: "color" }
  | { key: string; label: string; type: "select"; options: { value: string; label: string }[] }
  | { key: string; label: string; type: "text"; maxLength?: number };

interface Gen {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  summary: string;
  stage: "gradient" | "dark" | "light";
  injectCss?: boolean; // false when the CSS must not be injected into the page (e.g. :root rules)
  defaults: Values;
  controls: Control[];
  presets?: { label: string; values: Values }[];
  css: (v: Values, c: string) => string;
  html: (v: Values, c: string) => string;
  preview: (v: Values, c: string) => React.ReactNode;
  guide: { about: string; tips: string[]; support: string };
}

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

const n = (v: Values, k: string) => Number(v[k]);
const s = (v: Values, k: string) => String(v[k]);

const ident = (x: string) => {
  const cleaned = x.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
  if (!cleaned) return "element";
  return /^\d/.test(cleaned) ? `_${cleaned}` : cleaned;
};

const hexToRgb = (hex: string): [number, number, number] => {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const num = parseInt(h.padEnd(6, "0").slice(0, 6), 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

const rgba = (hex: string, a: number) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.round(a * 100) / 100})`;
};

const toHex = (r: number, g: number, b: number) =>
  "#" + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");

const mix = (a: string, b: string, t: number) => {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return toHex(x[0] * (1 - t) + y[0] * t, x[1] * (1 - t) + y[1] * t, x[2] * (1 - t) + y[2] * t);
};

const luminance = (hex: string) => {
  const f = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

const contrast = (a: string, b: string) => {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

const toHsl = (hex: string) => {
  const [r0, g0, b0] = hexToRgb(hex).map((x) => x / 255);
  const max = Math.max(r0, g0, b0);
  const min = Math.min(r0, g0, b0);
  const l = (max + min) / 2;
  let h = 0;
  let sat = 0;
  if (max !== min) {
    const d = max - min;
    sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r0) h = (g0 - b0) / d + (g0 < b0 ? 6 : 0);
    else if (max === g0) h = (b0 - r0) / d + 2;
    else h = (r0 - g0) / d + 4;
    h *= 60;
  }
  return `hsl(${Math.round(h)} ${Math.round(sat * 100)}% ${Math.round(l * 100)}%)`;
};

const rule = (sel: string, decls: string[]) => `${sel} {\n${decls.map((d) => `  ${d};`).join("\n")}\n}`;

const reduced = (sel: string) => `\n\n@media (prefers-reduced-motion: reduce) {\n  ${sel} {\n    animation: none;\n  }\n}`;

const safeValue = (x: string) => x.replace(/[<>{};@\\]/g, "").slice(0, 200);

const GLOBAL_FONT_STACK = "ui-sans-serif, system-ui, sans-serif";

/* ================================================================== */
/*  Generators                                                         */
/* ================================================================== */

const range = (key: string, label: string, min: number, max: number, unit = "", step = 1): Control => ({
  key,
  label,
  type: "range",
  min,
  max,
  step,
  unit,
});
const color = (key: string, label: string): Control => ({ key, label, type: "color" });
const select = (key: string, label: string, options: [string, string][]): Control => ({
  key,
  label,
  type: "select",
  options: options.map(([value, l]) => ({ value, label: l })),
});

const SHAPES: Record<string, { label: string; value: string }> = {
  triangle: { label: "Triangle", value: "polygon(50% 0%, 100% 100%, 0% 100%)" },
  circle: { label: "Circle", value: "circle(50% at 50% 50%)" },
  ellipse: { label: "Ellipse", value: "ellipse(50% 35% at 50% 50%)" },
  rhombus: { label: "Rhombus", value: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" },
  pentagon: { label: "Pentagon", value: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" },
  hexagon: { label: "Hexagon", value: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" },
  star: {
    label: "Star",
    value: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
  },
  arrow: { label: "Arrow", value: "polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)" },
  message: { label: "Message", value: "polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)" },
  cross: {
    label: "Cross",
    value: "polygon(20% 0%, 80% 0%, 80% 20%, 100% 20%, 100% 80%, 80% 80%, 80% 100%, 20% 100%, 20% 80%, 0% 80%, 0% 20%, 20% 20%)",
  },
  inset: { label: "Rounded inset", value: "inset(5% round 20px)" },
  custom: { label: "Custom", value: "" },
};

const SHAPE_RE = /^(polygon|circle|ellipse|inset)\([\w\s%.,\-]+\)$/;

const FONTS: { name: string; weights: number[]; fallback: string }[] = [
  { name: "Inter", weights: [300, 400, 500, 600, 700, 800], fallback: "sans-serif" },
  { name: "Roboto", weights: [300, 400, 500, 700, 900], fallback: "sans-serif" },
  { name: "Poppins", weights: [300, 400, 500, 600, 700, 800], fallback: "sans-serif" },
  { name: "Montserrat", weights: [300, 400, 500, 600, 700, 800], fallback: "sans-serif" },
  { name: "Open Sans", weights: [300, 400, 500, 600, 700, 800], fallback: "sans-serif" },
  { name: "Lato", weights: [300, 400, 700, 900], fallback: "sans-serif" },
  { name: "Nunito", weights: [300, 400, 600, 700, 800], fallback: "sans-serif" },
  { name: "Raleway", weights: [300, 400, 500, 600, 700, 800], fallback: "sans-serif" },
  { name: "Oswald", weights: [300, 400, 500, 600, 700], fallback: "sans-serif" },
  { name: "Playfair Display", weights: [400, 500, 600, 700, 800], fallback: "serif" },
  { name: "Merriweather", weights: [300, 400, 700, 900], fallback: "serif" },
  { name: "Source Code Pro", weights: [300, 400, 500, 600, 700], fallback: "monospace" },
];

const fontHref = (family: string, weight: number) =>
  `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&display=swap`;

const nearestWeight = (weights: number[], w: number) =>
  weights.reduce((best, x) => (Math.abs(x - w) < Math.abs(best - w) ? x : best), weights[0]);

const shadeStops = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const shadeColor = (base: string, step: number) => {
  switch (step) {
    case 50: return mix(base, "#ffffff", 0.95);
    case 100: return mix(base, "#ffffff", 0.88);
    case 200: return mix(base, "#ffffff", 0.74);
    case 300: return mix(base, "#ffffff", 0.56);
    case 400: return mix(base, "#ffffff", 0.3);
    case 500: return base;
    case 600: return mix(base, "#000000", 0.14);
    case 700: return mix(base, "#000000", 0.3);
    case 800: return mix(base, "#000000", 0.46);
    default: return mix(base, "#000000", 0.62);
  }
};

const KEYFRAMES: Record<string, string[]> = {
  bounce: ["0%, 100% { transform: translateY(0); }", "50% { transform: translateY(-30px); }"],
  spin: ["from { transform: rotate(0deg); }", "to { transform: rotate(360deg); }"],
  pulse: ["0%, 100% { transform: scale(1); }", "50% { transform: scale(1.15); }"],
  shake: [
    "0%, 100% { transform: translateX(0); }",
    "20%, 60% { transform: translateX(-10px); }",
    "40%, 80% { transform: translateX(10px); }",
  ],
  float: [
    "0%, 100% { transform: translateY(0) rotate(0deg); }",
    "50% { transform: translateY(-14px) rotate(3deg); }",
  ],
  flip: ["from { transform: rotateY(0deg); }", "to { transform: rotateY(360deg); }"],
};

const GENERATORS: Gen[] = [
  /* ------------------------------ Glassmorphism ------------------------------ */
  {
    id: "glassmorphism",
    name: "Glassmorphism Generator",
    icon: Layers,
    summary: "Frosted-glass cards with blur, tint, saturation and a soft border.",
    stage: "gradient",
    defaults: { tint: "#ffffff", opacity: 25, blur: 12, saturation: 180, radius: 20, borderColor: "#ffffff", borderOpacity: 30, shadow: "soft" },
    controls: [
      color("tint", "Glass tint"),
      range("opacity", "Tint opacity", 0, 100, "%"),
      range("blur", "Blur", 0, 40, "px"),
      range("saturation", "Saturation", 100, 250, "%"),
      range("radius", "Corner radius", 0, 60, "px"),
      color("borderColor", "Border colour"),
      range("borderOpacity", "Border opacity", 0, 100, "%"),
      select("shadow", "Shadow", [["none", "None"], ["soft", "Soft"], ["deep", "Deep"]]),
    ],
    presets: [
      { label: "Frosted light", values: { tint: "#ffffff", opacity: 25, blur: 12, saturation: 180, borderOpacity: 30 } },
      { label: "Dark glass", values: { tint: "#0f172a", opacity: 45, blur: 16, saturation: 140, borderColor: "#ffffff", borderOpacity: 12 } },
      { label: "Subtle", values: { tint: "#ffffff", opacity: 12, blur: 8, saturation: 130, borderOpacity: 20 } },
      { label: "Heavy blur", values: { tint: "#ffffff", opacity: 35, blur: 30, saturation: 200, borderOpacity: 40 } },
    ],
    css: (v, c) => {
      const bf = `blur(${n(v, "blur")}px) saturate(${n(v, "saturation")}%)`;
      const sh = s(v, "shadow");
      const decl = [
        `background: ${rgba(s(v, "tint"), n(v, "opacity") / 100)}`,
        `backdrop-filter: ${bf}`,
        `-webkit-backdrop-filter: ${bf}`,
        `border-radius: ${n(v, "radius")}px`,
        `border: 1px solid ${rgba(s(v, "borderColor"), n(v, "borderOpacity") / 100)}`,
      ];
      if (sh === "soft") decl.push("box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2)");
      if (sh === "deep") decl.push("box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45)");
      return rule(`.${c}`, decl);
    },
    html: (_v, c) => `<div class="${c}">\n  <h3>Glass card</h3>\n  <p>Content goes here.</p>\n</div>`,
    preview: (v, c) => {
      const dark = luminance(s(v, "tint")) < 0.5 || n(v, "opacity") < 15;
      return (
        <div className={c} style={{ padding: 24, width: 280, color: dark ? "#fff" : "#0f172a" }}>
          <h4 style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>Frosted card</h4>
          <p style={{ fontSize: 13, marginTop: 6, opacity: 0.85 }}>A glass surface that blurs whatever sits behind it.</p>
        </div>
      );
    },
    guide: {
      about:
        "Glassmorphism makes an element look like frosted glass: a semi-transparent tint, a blur of whatever is behind it, and a thin light border. The effect only works over a colourful or textured background, so preview it on your real page, not on a flat colour.",
      tips: [
        "Keep text contrast at 4.5:1 or higher. Thin glass over a busy photo often fails; raise the tint opacity if text is hard to read.",
        "Use blur sparingly on large areas. backdrop-filter is expensive on low-end phones.",
        "Add a 1px light border. It sells the effect more than any other property.",
      ],
      support: "backdrop-filter works in current versions of all major browsers; the -webkit- prefix covers older Safari. Provide a solid fallback background for browsers that lack it.",
    },
  },

  /* ------------------------------ Box shadow ------------------------------ */
  {
    id: "boxshadow",
    name: "Box Shadow Generator",
    icon: Box,
    summary: "Single or smooth layered shadows with offset, blur, spread and colour.",
    stage: "light",
    defaults: { mode: "layered", x: 0, y: 20, blur: 40, spread: -10, color: "#0f172a", opacity: 30, inset: "no", radius: 16, bg: "#ffffff" },
    controls: [
      select("mode", "Style", [["single", "Single shadow"], ["layered", "Layered (smoother)"]]),
      range("x", "Horizontal offset", -60, 60, "px"),
      range("y", "Vertical offset", -60, 60, "px"),
      range("blur", "Blur", 0, 120, "px"),
      range("spread", "Spread", -40, 40, "px"),
      color("color", "Shadow colour"),
      range("opacity", "Opacity", 0, 100, "%"),
      select("inset", "Inset", [["no", "Outer"], ["yes", "Inset"]]),
      range("radius", "Corner radius", 0, 60, "px"),
      color("bg", "Box colour"),
    ],
    presets: [
      { label: "Soft card", values: { mode: "layered", x: 0, y: 20, blur: 40, spread: -10, opacity: 30 } },
      { label: "Sharp offset", values: { mode: "single", x: 8, y: 8, blur: 0, spread: 0, opacity: 80 } },
      { label: "Glow", values: { mode: "single", x: 0, y: 0, blur: 40, spread: 4, opacity: 60, color: "#3b82f6" } },
      { label: "Inner", values: { mode: "single", x: 0, y: 4, blur: 14, spread: 0, opacity: 35, inset: "yes" } },
    ],
    css: (v, c) => {
      const ins = s(v, "inset") === "yes" ? "inset " : "";
      const o = n(v, "opacity") / 100;
      const col = s(v, "color");
      const x = n(v, "x");
      const y = n(v, "y");
      const b = n(v, "blur");
      const sp = n(v, "spread");
      const layers =
        s(v, "mode") === "layered"
          ? [
            `${ins}${x / 4}px ${y / 4}px ${b / 4}px ${sp / 4}px ${rgba(col, o * 0.5)}`,
            `${ins}${x / 2}px ${y / 2}px ${b / 2}px ${sp / 2}px ${rgba(col, o * 0.7)}`,
            `${ins}${x}px ${y}px ${b}px ${sp}px ${rgba(col, o)}`,
          ]
          : [`${ins}${x}px ${y}px ${b}px ${sp}px ${rgba(col, o)}`];
      return rule(`.${c}`, [
        `background: ${s(v, "bg")}`,
        `border-radius: ${n(v, "radius")}px`,
        `box-shadow: ${layers.join(",\n    ")}`,
      ]);
    },
    html: (_v, c) => `<div class="${c}">Content</div>`,
    preview: (_v, c) => (
      <div className={c} style={{ width: 200, height: 160, display: "grid", placeItems: "center", color: "#475569", fontSize: 13, fontWeight: 700 }}>
        Shadow box
      </div>
    ),
    guide: {
      about:
        "Box shadows give elements depth. A single shadow looks flat and harsh; stacking several shadows with increasing blur imitates how real light falls off and looks far more natural, which is what the layered style does.",
      tips: [
        "Use a negative spread with a large blur for the soft, floating-card look.",
        "Tint the shadow with your brand colour instead of pure black for a more refined result.",
        "On dark backgrounds shadows are barely visible; use a subtle border or glow instead.",
      ],
      support: "box-shadow is supported by every current browser. Very large blurs can be slow to animate; avoid animating the shadow itself and animate opacity or transform instead.",
    },
  },

  /* ------------------------------ Gradient ------------------------------ */
  {
    id: "gradient",
    name: "Gradient Generator",
    icon: Palette,
    summary: "Linear, radial and conic gradients with two or three colours.",
    stage: "dark",
    defaults: { type: "linear", angle: 135, c1: "#3b82f6", c2: "#9333ea", useC3: "no", c3: "#ec4899", s1: 0, s2: 100, shape: "circle" },
    controls: [
      select("type", "Type", [["linear", "Linear"], ["radial", "Radial"], ["conic", "Conic"]]),
      range("angle", "Angle (linear / conic)", 0, 360, "°"),
      select("shape", "Radial shape", [["circle", "Circle"], ["ellipse", "Ellipse"]]),
      color("c1", "Colour 1"),
      color("c2", "Colour 2"),
      select("useC3", "Third colour", [["no", "Off"], ["yes", "On"]]),
      color("c3", "Colour 3"),
      range("s1", "Start position", 0, 100, "%"),
      range("s2", "End position", 0, 100, "%"),
    ],
    presets: [
      { label: "Sunset", values: { type: "linear", angle: 135, c1: "#f97316", c2: "#ec4899", useC3: "no" } },
      { label: "Ocean", values: { type: "linear", angle: 160, c1: "#06b6d4", c2: "#3b82f6", useC3: "no" } },
      { label: "Aurora", values: { type: "linear", angle: 120, c1: "#22c55e", c2: "#8b5cf6", useC3: "yes", c3: "#06b6d4" } },
      { label: "Spotlight", values: { type: "radial", c1: "#fde68a", c2: "#7c2d12", useC3: "no", shape: "circle" } },
    ],
    css: (v, c) => {
      const stops = [`${s(v, "c1")} ${n(v, "s1")}%`];
      if (s(v, "useC3") === "yes") stops.push(`${s(v, "c3")} ${Math.round((n(v, "s1") + n(v, "s2")) / 2)}%`);
      stops.push(`${s(v, "c2")} ${n(v, "s2")}%`);
      const t = s(v, "type");
      const g =
        t === "radial"
          ? `radial-gradient(${s(v, "shape")}, ${stops.join(", ")})`
          : t === "conic"
            ? `conic-gradient(from ${n(v, "angle")}deg, ${stops.join(", ")})`
            : `linear-gradient(${n(v, "angle")}deg, ${stops.join(", ")})`;
      return rule(`.${c}`, [`background: ${s(v, "c1")}`, `background: ${g}`]);
    },
    html: (_v, c) => `<div class="${c}"></div>`,
    preview: (_v, c) => <div className={c} style={{ width: "100%", maxWidth: 420, height: 240, borderRadius: 24 }} />,
    guide: {
      about:
        "CSS gradients are generated by the browser, so they cost no image download and scale perfectly. Linear gradients blend along a line, radial gradients spread from a centre point and conic gradients sweep around a point like a colour wheel.",
      tips: [
        "Place two stops very close together to create a hard edge instead of a blend.",
        "Gradients between very different hues can look muddy in the middle; add a third, intermediate colour.",
        "The first background line is a solid fallback for any browser that cannot render the gradient.",
      ],
      support: "linear-gradient and radial-gradient work everywhere. conic-gradient is supported in all current major browsers.",
    },
  },

  /* ------------------------------ Glitch text ------------------------------ */
  {
    id: "glitch",
    name: "Glitch Text Effect",
    icon: Type,
    summary: "Cyberpunk split-colour text with an optional animated glitch.",
    stage: "dark",
    defaults: { text: "Glitch Text", size: 56, weight: "900", color: "#ffffff", c1: "#00ffff", c2: "#ff00ff", offset: 3, animate: "yes", speed: 1.6 },
    controls: [
      { key: "text", label: "Preview text", type: "text", maxLength: 40 },
      range("size", "Font size", 20, 96, "px"),
      select("weight", "Weight", [["700", "Bold"], ["800", "Extra bold"], ["900", "Black"]]),
      color("color", "Text colour"),
      color("c1", "Glitch colour 1"),
      color("c2", "Glitch colour 2"),
      range("offset", "Split distance", 1, 10, "px"),
      select("animate", "Animation", [["yes", "Animated"], ["no", "Static"]]),
      range("speed", "Cycle length", 0.5, 4, "s", 0.1),
    ],
    presets: [
      { label: "Cyber", values: { c1: "#00ffff", c2: "#ff00ff", color: "#ffffff" } },
      { label: "Retro", values: { c1: "#facc15", c2: "#ef4444", color: "#ffffff" } },
      { label: "Toxic", values: { c1: "#22c55e", c2: "#a3e635", color: "#052e16" } },
    ],
    css: (v, c) => {
      const o = n(v, "offset");
      const a = s(v, "animate") === "yes";
      const base = [
        `font-size: ${n(v, "size")}px`,
        `font-weight: ${s(v, "weight")}`,
        `color: ${s(v, "color")}`,
        `text-shadow: ${o}px 0 0 ${s(v, "c1")}, ${-o}px 0 0 ${s(v, "c2")}`,
      ];
      if (a) base.push(`animation: ${c}-glitch ${n(v, "speed")}s infinite`);
      let out = rule(`.${c}`, base);
      if (a) {
        const f = (x: number, y: number, x2: number, y2: number) =>
          `text-shadow: ${x}px ${y}px 0 ${s(v, "c1")}, ${x2}px ${y2}px 0 ${s(v, "c2")};`;
        out +=
          `\n\n@keyframes ${c}-glitch {\n` +
          `  0%, 100% { ${f(o, 0, -o, 0)} }\n` +
          `  25% { ${f(-o, o, o, -o)} }\n` +
          `  50% { ${f(o * 2, 0, -o * 2, 0)} }\n` +
          `  75% { ${f(0, -o, 0, o)} }\n}` +
          reduced(`.${c}`);
      }
      return out;
    },
    html: (v, c) => `<h1 class="${c}">${safeValue(s(v, "text"))}</h1>`,
    preview: (v, c) => (
      <div key={JSON.stringify(v)} className={c} style={{ userSelect: "none", textAlign: "center", letterSpacing: "0.04em" }}>
        {s(v, "text") || "Glitch"}
      </div>
    ),
    guide: {
      about:
        "The glitch look comes from layering two offset coloured shadows behind the text, one pushed left and one pushed right, so the letters appear to split into red-blue style fringes. Moving the offsets between keyframes makes the text jitter.",
      tips: [
        "Use it for short headings only; long glitchy paragraphs are tiring to read.",
        "Keep the offset small (2 to 4 px). Larger values make the text illegible.",
        "Respect users who prefer reduced motion. The generated code switches the animation off for them.",
      ],
      support: "text-shadow and @keyframes are supported everywhere.",
    },
  },

  /* ------------------------------ Border radius ------------------------------ */
  {
    id: "borderradius",
    name: "Border Radius Generator",
    icon: Grid,
    summary: "Control each corner separately, in pixels or percentages.",
    stage: "dark",
    defaults: { tl: 20, tr: 20, br: 20, bl: 20, unit: "px", bg: "#3b82f6" },
    controls: [
      select("unit", "Unit", [["px", "Pixels"], ["%", "Percent"]]),
      range("tl", "Top left", 0, 100),
      range("tr", "Top right", 0, 100),
      range("br", "Bottom right", 0, 100),
      range("bl", "Bottom left", 0, 100),
      color("bg", "Box colour"),
    ],
    presets: [
      { label: "Rounded", values: { tl: 20, tr: 20, br: 20, bl: 20, unit: "px" } },
      { label: "Pill", values: { tl: 100, tr: 100, br: 100, bl: 100, unit: "px" } },
      { label: "Blob", values: { tl: 60, tr: 40, br: 70, bl: 30, unit: "%" } },
      { label: "Leaf", values: { tl: 0, tr: 80, br: 0, bl: 80, unit: "px" } },
    ],
    css: (v, c) => {
      const u = s(v, "unit");
      const vals = [n(v, "tl"), n(v, "tr"), n(v, "br"), n(v, "bl")];
      const same = vals.every((x) => x === vals[0]);
      return rule(`.${c}`, [`border-radius: ${same ? `${vals[0]}${u}` : vals.map((x) => `${x}${u}`).join(" ")}`]);
    },
    html: (_v, c) => `<div class="${c}"></div>`,
    preview: (v, c) => <div className={c} style={{ width: 220, height: 220, background: s(v, "bg") }} />,
    guide: {
      about:
        "border-radius accepts one to four values, running clockwise from the top-left corner. Pixel values give a fixed curve; percentages scale with the element, which is how organic blob shapes are made. Values above 50% are treated the same as 50%.",
      tips: [
        "Use a very large pixel value (such as 999px) for a pill button that always has fully round ends.",
        "Use 50% on a square to get a perfect circle.",
        "Round the inner element slightly less than its container so nested corners look concentric.",
      ],
      support: "border-radius works in every browser.",
    },
  },

  /* ------------------------------ Button ------------------------------ */
  {
    id: "button",
    name: "Button Generator",
    icon: Compass,
    summary: "Styled buttons with hover, active and keyboard focus states.",
    stage: "dark",
    defaults: { text: "Get started", bg: "#3b82f6", color: "#ffffff", hoverBg: "#2563eb", radius: 12, padX: 28, padY: 12, fontSize: 15, weight: "600", borderWidth: 0, borderColor: "#1d4ed8", shadow: "soft", lift: "yes" },
    controls: [
      { key: "text", label: "Label", type: "text", maxLength: 30 },
      color("bg", "Background"),
      color("hoverBg", "Hover background"),
      color("color", "Text colour"),
      range("radius", "Corner radius", 0, 60, "px"),
      range("padX", "Horizontal padding", 8, 64, "px"),
      range("padY", "Vertical padding", 4, 32, "px"),
      range("fontSize", "Font size", 11, 24, "px"),
      select("weight", "Weight", [["500", "Medium"], ["600", "Semibold"], ["700", "Bold"]]),
      range("borderWidth", "Border width", 0, 6, "px"),
      color("borderColor", "Border colour"),
      select("shadow", "Shadow", [["none", "None"], ["soft", "Soft"], ["strong", "Strong"]]),
      select("lift", "Lift on hover", [["yes", "Yes"], ["no", "No"]]),
    ],
    presets: [
      { label: "Primary", values: { bg: "#3b82f6", hoverBg: "#2563eb", color: "#ffffff", borderWidth: 0, radius: 12 } },
      { label: "Outline", values: { bg: "#0f172a", hoverBg: "#1e3a8a", color: "#93c5fd", borderWidth: 2, borderColor: "#3b82f6", shadow: "none" } },
      { label: "Pill", values: { radius: 999, padX: 32 } },
      { label: "Success", values: { bg: "#16a34a", hoverBg: "#15803d", color: "#ffffff", borderWidth: 0 } },
    ],
    css: (v, c) => {
      const sh = s(v, "shadow");
      const shadow = sh === "soft" ? "0 4px 14px rgba(0, 0, 0, 0.25)" : sh === "strong" ? "0 10px 30px rgba(0, 0, 0, 0.45)" : "none";
      const lift = s(v, "lift") === "yes";
      const base = [
        `background-color: ${s(v, "bg")}`,
        `color: ${s(v, "color")}`,
        `font-size: ${n(v, "fontSize")}px`,
        `font-weight: ${s(v, "weight")}`,
        `padding: ${n(v, "padY")}px ${n(v, "padX")}px`,
        `border: ${n(v, "borderWidth")}px solid ${s(v, "borderColor")}`,
        `border-radius: ${n(v, "radius")}px`,
        `box-shadow: ${shadow}`,
        "cursor: pointer",
        "transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
      ];
      return [
        rule(`.${c}`, base),
        rule(`.${c}:hover`, [`background-color: ${s(v, "hoverBg")}`, ...(lift ? ["transform: translateY(-2px)"] : [])]),
        rule(`.${c}:active`, ["transform: translateY(0)"]),
        rule(`.${c}:focus-visible`, [`outline: 3px solid ${rgba(s(v, "bg"), 0.5)}`, "outline-offset: 3px"]),
      ].join("\n\n");
    },
    html: (v, c) => `<button type="button" class="${c}">${safeValue(s(v, "text"))}</button>`,
    preview: (v, c) => (
      <button type="button" className={c}>
        {s(v, "text") || "Button"}
      </button>
    ),
    guide: {
      about:
        "A good button communicates that it is clickable and responds to every kind of interaction: hover for mouse users, :active for the press, and :focus-visible for keyboard users. The generated code includes all four so it is usable and accessible out of the box.",
      tips: [
        "Check that the label colour contrasts with the background by at least 4.5:1 in both the normal and hover states.",
        "Never remove the focus outline without replacing it. Keyboard users rely on it.",
        "Make touch targets at least 44 px tall on mobile. Increase the vertical padding if needed.",
      ],
      support: "All properties used are supported in every modern browser. :focus-visible is supported in current versions of all major browsers.",
    },
  },

  /* ------------------------------ Accordion ------------------------------ */
  {
    id: "accordion",
    name: "Accordion Generator",
    icon: Layout,
    summary: "Collapsible sections built with native details and summary, no JavaScript.",
    stage: "dark",
    defaults: { headerBg: "#1e293b", bodyBg: "#0f172a", textColor: "#e2e8f0", borderColor: "#334155", borderWidth: 1, radius: 12, padding: 16, items: "3", gap: 10 },
    controls: [
      color("headerBg", "Header background"),
      color("bodyBg", "Body background"),
      color("textColor", "Text colour"),
      color("borderColor", "Border colour"),
      range("borderWidth", "Border width", 0, 4, "px"),
      range("radius", "Corner radius", 0, 30, "px"),
      range("padding", "Padding", 8, 32, "px"),
      range("gap", "Space between items", 0, 24, "px"),
      select("items", "Number of items", [["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"]]),
    ],
    css: (v, c) => {
      const bw = n(v, "borderWidth");
      return [
        rule(`.${c}`, [
          `border: ${bw}px solid ${s(v, "borderColor")}`,
          `border-radius: ${n(v, "radius")}px`,
          `background: ${s(v, "bodyBg")}`,
          `color: ${s(v, "textColor")}`,
          "overflow: hidden",
        ]),
        rule(`.${c} + .${c}`, [`margin-top: ${n(v, "gap")}px`]),
        rule(`.${c} summary`, [
          "cursor: pointer",
          `padding: ${n(v, "padding")}px`,
          `background: ${s(v, "headerBg")}`,
          "font-weight: 600",
          "list-style: none",
        ]),
        rule(`.${c} summary::-webkit-details-marker`, ["display: none"]),
        rule(`.${c}[open] summary`, [`border-bottom: ${bw}px solid ${s(v, "borderColor")}`]),
        rule(`.${c} > div`, [`padding: ${n(v, "padding")}px`]),
      ].join("\n\n");
    },
    html: (v, c) =>
      Array.from({ length: n(v, "items") }, (_, i) => `<details class="${c}"${i === 0 ? " open" : ""}>\n  <summary>Question ${i + 1}</summary>\n  <div>Answer ${i + 1} goes here.</div>\n</details>`).join("\n"),
    preview: (v, c) => (
      <div style={{ width: "100%", maxWidth: 420 }}>
        {Array.from({ length: n(v, "items") }, (_, i) => (
          <details key={i} className={c} open={i === 0}>
            <summary>Question {i + 1}</summary>
            <div style={{ fontSize: 14 }}>Answer {i + 1} goes here. Click a header to open or close it.</div>
          </details>
        ))}
      </div>
    ),
    guide: {
      about:
        "The HTML details and summary elements give you an accordion with no JavaScript. The browser handles opening, closing, keyboard access and screen-reader announcements for you, which makes this approach both lighter and more accessible than most script-based versions.",
      tips: [
        "Write the summary as a clear question or title; it is the only part visible when collapsed.",
        "Give each details element the same name attribute if you want only one open at a time in supporting browsers.",
        "Do not hide essential content in collapsed sections that search engines or users must find quickly.",
      ],
      support: "details and summary work in all modern browsers. The exclusive-open name attribute is newer, so test it before relying on it.",
    },
  },

  /* ------------------------------ Animated text ------------------------------ */
  {
    id: "animatedtext",
    name: "Animated Text Generator",
    icon: Type,
    summary: "Fade, slide, pulse and gradient-shift text animations.",
    stage: "dark",
    defaults: { text: "Awesome Animation", effect: "gradient", size: 40, color1: "#38bdf8", color2: "#a855f7", speed: 3 },
    controls: [
      { key: "text", label: "Preview text", type: "text", maxLength: 40 },
      select("effect", "Effect", [["gradient", "Gradient shift"], ["fade", "Fade in and out"], ["slide", "Slide up"], ["pulse", "Pulse"]]),
      range("size", "Font size", 16, 80, "px"),
      color("color1", "Colour 1"),
      color("color2", "Colour 2 (gradient)"),
      range("speed", "Cycle length", 1, 8, "s", 0.5),
    ],
    css: (v, c) => {
      const sp = n(v, "speed");
      const e = s(v, "effect");
      const base = [`font-size: ${n(v, "size")}px`, "font-weight: 800"];
      if (e === "gradient") {
        return (
          rule(`.${c}`, [
            ...base,
            `background: linear-gradient(90deg, ${s(v, "color1")}, ${s(v, "color2")}, ${s(v, "color1")})`,
            "background-size: 200% auto",
            "-webkit-background-clip: text",
            "background-clip: text",
            "-webkit-text-fill-color: transparent",
            "color: transparent",
            `animation: ${c}-shift ${sp}s linear infinite`,
          ]) +
          `\n\n@keyframes ${c}-shift {\n  to { background-position: 200% center; }\n}` +
          reduced(`.${c}`)
        );
      }
      const frames: Record<string, string> = {
        fade: "0%, 100% { opacity: 0.2; }\n  50% { opacity: 1; }",
        slide: "0% { opacity: 0; transform: translateY(24px); }\n  30%, 70% { opacity: 1; transform: none; }\n  100% { opacity: 0; transform: translateY(-24px); }",
        pulse: "0%, 100% { transform: scale(1); }\n  50% { transform: scale(1.08); }",
      };
      return (
        rule(`.${c}`, [...base, `color: ${s(v, "color1")}`, "display: inline-block", `animation: ${c}-${e} ${sp}s ease-in-out infinite`]) +
        `\n\n@keyframes ${c}-${e} {\n  ${frames[e]}\n}` +
        reduced(`.${c}`)
      );
    },
    html: (v, c) => `<h2 class="${c}">${safeValue(s(v, "text"))}</h2>`,
    preview: (v, c) => (
      <div key={JSON.stringify(v)} className={c} style={{ textAlign: "center" }}>
        {s(v, "text") || "Animated"}
      </div>
    ),
    guide: {
      about:
        "Animated headings draw attention to the most important line on a page. The gradient effect paints a moving gradient through the letters by clipping the background to the text; the other effects animate opacity and transform, which are the cheapest properties for the browser to animate.",
      tips: [
        "Animate only one prominent element per screen. Too much motion becomes noise.",
        "Prefer opacity and transform. They run on the GPU and do not trigger layout.",
        "The generated code disables the animation for visitors who set prefers-reduced-motion.",
      ],
      support: "background-clip: text needs the -webkit- prefix in some browsers, which is included. Other properties work everywhere.",
    },
  },

  /* ------------------------------ Keyframes ------------------------------ */
  {
    id: "keyframes",
    name: "Animation / Keyframe Generator",
    icon: Cpu,
    summary: "Ready-made @keyframes with duration, easing and repeat controls.",
    stage: "dark",
    defaults: { name: "bounce", effect: "bounce", duration: 1, easing: "ease-in-out", iterations: "infinite", delay: 0, boxColor: "#3b82f6" },
    controls: [
      select("effect", "Effect", [["bounce", "Bounce"], ["spin", "Spin"], ["pulse", "Pulse"], ["shake", "Shake"], ["float", "Float"], ["flip", "Flip"]]),
      { key: "name", label: "Animation name", type: "text", maxLength: 24 },
      range("duration", "Duration", 0.2, 5, "s", 0.1),
      range("delay", "Delay", 0, 3, "s", 0.1),
      select("easing", "Timing function", [["ease", "ease"], ["linear", "linear"], ["ease-in", "ease-in"], ["ease-out", "ease-out"], ["ease-in-out", "ease-in-out"]]),
      select("iterations", "Repeat", [["infinite", "Forever"], ["1", "Once"], ["3", "3 times"]]),
      color("boxColor", "Preview box colour"),
    ],
    css: (v, c) => {
      const nm = ident(s(v, "name") || s(v, "effect")).toLowerCase();
      const name = c === "pt-live" ? `pt-live-${nm}` : nm;
      return (
        `@keyframes ${name} {\n${KEYFRAMES[s(v, "effect")].map((f) => `  ${f}`).join("\n")}\n}\n\n` +
        rule(`.${c}`, [`animation: ${name} ${n(v, "duration")}s ${s(v, "easing")} ${n(v, "delay")}s ${s(v, "iterations")}`]) +
        reduced(`.${c}`)
      );
    },
    html: (_v, c) => `<div class="${c}"></div>`,
    preview: (v, c) => (
      <div
        key={JSON.stringify(v)}
        className={c}
        style={{ width: 96, height: 96, borderRadius: 18, background: s(v, "boxColor"), boxShadow: "0 12px 30px rgba(0,0,0,0.35)" }}
      />
    ),
    guide: {
      about:
        "A CSS animation has two parts: a @keyframes block that describes what changes, and an animation property that applies it with a duration, timing function, delay and repeat count. This generator writes both for common effects so you can adapt them rather than start from a blank file.",
      tips: [
        "Animate transform and opacity wherever possible; animating width, height or top forces the browser to recalculate layout.",
        "Use a delay to stagger several elements for a more polished entrance.",
        "Always include a prefers-reduced-motion rule. The generated code does this for you.",
      ],
      support: "CSS animations are supported in every modern browser.",
    },
  },

  /* ------------------------------ Border image ------------------------------ */
  {
    id: "borderimage",
    name: "Border Image Generator",
    icon: Grid,
    summary: "Gradient borders using the border-image property.",
    stage: "dark",
    defaults: { width: 8, angle: 90, c1: "#3b82f6", c2: "#ec4899", innerBg: "#0f172a" },
    controls: [
      range("width", "Border width", 1, 24, "px"),
      range("angle", "Gradient angle", 0, 360, "°"),
      color("c1", "Colour 1"),
      color("c2", "Colour 2"),
      color("innerBg", "Inner background"),
    ],
    css: (v, c) =>
      rule(`.${c}`, [
        `background: ${s(v, "innerBg")}`,
        `border: ${n(v, "width")}px solid transparent`,
        `border-image: linear-gradient(${n(v, "angle")}deg, ${s(v, "c1")}, ${s(v, "c2")}) 1`,
      ]),
    html: (_v, c) => `<div class="${c}">Content</div>`,
    preview: (_v, c) => (
      <div className={c} style={{ width: 240, height: 160, display: "grid", placeItems: "center", color: "#e2e8f0", fontWeight: 700, fontSize: 14 }}>
        Border image
      </div>
    ),
    guide: {
      about:
        "border-image paints an image or gradient into the border area. With a gradient and a slice value of 1, it produces a clean two-colour border in a single declaration.",
      tips: [
        "border-image ignores border-radius, so corners stay square. Use the Gradient Border Generator if you need rounded corners.",
        "A slice value of 1 stretches the gradient across the full border; larger values behave differently.",
        "Make sure the border colour contrasts with both the element and the page background.",
      ],
      support: "border-image is supported in all current browsers.",
    },
  },

  /* ------------------------------ Checkbox / radio ------------------------------ */
  {
    id: "checkbox",
    name: "Checkbox / Radio Generator",
    icon: Layers,
    summary: "Custom checkboxes and radio buttons using appearance: none.",
    stage: "dark",
    defaults: { type: "checkbox", style: "custom", size: 26, color: "#3b82f6", borderColor: "#64748b", radius: 7 },
    controls: [
      select("type", "Control", [["checkbox", "Checkbox"], ["radio", "Radio button"]]),
      select("style", "Approach", [["custom", "Fully custom"], ["accent", "accent-color only"]]),
      range("size", "Size", 14, 44, "px"),
      color("color", "Checked colour"),
      color("borderColor", "Unchecked border"),
      range("radius", "Checkbox radius", 0, 22, "px"),
    ],
    css: (v, c) => {
      const radio = s(v, "type") === "radio";
      const size = n(v, "size");
      if (s(v, "style") === "accent") {
        return rule(`.${c}`, [`accent-color: ${s(v, "color")}`, `width: ${size}px`, `height: ${size}px`, "cursor: pointer"]);
      }
      return [
        rule(`.${c}`, [
          "appearance: none",
          "-webkit-appearance: none",
          `width: ${size}px`,
          `height: ${size}px`,
          `border: 2px solid ${s(v, "borderColor")}`,
          `border-radius: ${radio ? "50%" : `${n(v, "radius")}px`}`,
          "display: inline-grid",
          "place-content: center",
          "background: transparent",
          "cursor: pointer",
          "transition: background 0.15s ease, border-color 0.15s ease",
        ]),
        rule(`.${c}::before`, [
          'content: ""',
          `width: ${radio ? "42%" : "62%"}`,
          `height: ${radio ? "42%" : "62%"}`,
          "background: #ffffff",
          "transform: scale(0)",
          "transition: transform 0.12s ease",
          ...(radio ? ["border-radius: 50%"] : ["clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%)"]),
        ]),
        rule(`.${c}:checked`, [`background: ${s(v, "color")}`, `border-color: ${s(v, "color")}`]),
        rule(`.${c}:checked::before`, ["transform: scale(1)"]),
        rule(`.${c}:focus-visible`, [`outline: 3px solid ${rgba(s(v, "color"), 0.5)}`, "outline-offset: 2px"]),
      ].join("\n\n");
    },
    html: (v, c) => {
      const t = s(v, "type");
      return `<label>\n  <input type="${t}" class="${c}"${t === "radio" ? ' name="choice"' : ""} checked />\n  Label text\n</label>`;
    },
    preview: (v, c) => {
      const t = s(v, "type");
      return (
        <div style={{ display: "grid", gap: 16, color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>
          {["Selected option", "Another option", "Third option"].map((l, i) => (
            <label key={l} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <input type={t === "radio" ? "radio" : "checkbox"} name={t === "radio" ? "pt-demo" : undefined} className={c} defaultChecked={i === 0} />
              {l}
            </label>
          ))}
        </div>
      );
    },
    guide: {
      about:
        "Browser default checkboxes cannot be fully restyled. The accent-color property recolours the default control in one line. For complete control, appearance: none removes the native look and lets you draw the box and the tick yourself with a pseudo-element.",
      tips: [
        "Always keep a visible :focus-visible style so keyboard users can see where they are.",
        "Wrap the input in a label so the whole text is clickable.",
        "Make the control at least 24 px so it is easy to tap.",
      ],
      support: "accent-color and appearance: none are supported by current versions of all major browsers.",
    },
  },

  /* ------------------------------ Clip path ------------------------------ */
  {
    id: "clippath",
    name: "Clip Path Generator",
    icon: Grid,
    summary: "Cut elements into triangles, hexagons, stars, arrows and custom polygons.",
    stage: "dark",
    defaults: { shape: "hexagon", custom: "polygon(50% 0%, 100% 100%, 0% 100%)", size: 220, c1: "#3b82f6", c2: "#9333ea" },
    controls: [
      select("shape", "Shape", Object.entries(SHAPES).map(([k, x]) => [k, x.label] as [string, string])),
      { key: "custom", label: "Custom shape (polygon, circle, ellipse, inset)", type: "text", maxLength: 160 },
      range("size", "Preview size", 100, 320, "px"),
      color("c1", "Colour 1"),
      color("c2", "Colour 2"),
    ],
    css: (v, c) => {
      const shape = s(v, "shape");
      const raw = shape === "custom" ? s(v, "custom").trim() : SHAPES[shape].value;
      const value = SHAPE_RE.test(raw) ? raw : SHAPES.triangle.value;
      return rule(`.${c}`, [`-webkit-clip-path: ${value}`, `clip-path: ${value}`]);
    },
    html: (_v, c) => `<div class="${c}"></div>`,
    preview: (v, c) => {
      const invalid = s(v, "shape") === "custom" && !SHAPE_RE.test(s(v, "custom").trim());
      return (
        <div style={{ textAlign: "center" }}>
          <div className={c} style={{ width: n(v, "size"), height: n(v, "size"), background: `linear-gradient(135deg, ${s(v, "c1")}, ${s(v, "c2")})` }} />
          {invalid && <p style={{ marginTop: 12, fontSize: 12, color: "#fbbf24" }}>That custom shape is not valid. Showing a triangle instead.</p>}
        </div>
      );
    },
    guide: {
      about:
        "clip-path hides everything outside a shape you define. Polygons use a list of x y percentage points that are joined in order; circles and ellipses use a radius and a centre. The clipped area also stops receiving clicks, which is useful for diagonal sections and masks.",
      tips: [
        "Use percentages for points so the shape scales with the element.",
        "Remember that shadows and borders are clipped too. Apply a drop-shadow filter to a parent instead.",
        "Diagonal section dividers are a common use: polygon(0 0, 100% 0, 100% 90%, 0 100%).",
      ],
      support: "clip-path with basic shapes is supported in all current browsers; the -webkit- prefix is included for older ones.",
    },
  },

  /* ------------------------------ Colour variables ------------------------------ */
  {
    id: "colorvariable",
    name: "Color Variable Generator",
    icon: Palette,
    summary: "Turn one brand colour into a 50 to 900 shade scale of CSS variables.",
    stage: "dark",
    injectCss: false,
    defaults: { name: "primary", base: "#3b82f6", format: "hex" },
    controls: [
      { key: "name", label: "Variable name", type: "text", maxLength: 24 },
      color("base", "Base colour (500)"),
      select("format", "Output format", [["hex", "Hex"], ["rgb", "RGB"], ["hsl", "HSL"]]),
    ],
    css: (v) => {
      const nm = ident(s(v, "name") || "primary").toLowerCase();
      const fmt = s(v, "format");
      const fmtColor = (hex: string) => {
        if (fmt === "rgb") return `rgb(${hexToRgb(hex).join(" ")})`;
        if (fmt === "hsl") return toHsl(hex);
        return hex;
      };
      const lines = shadeStops.map((st) => `  --${nm}-${st}: ${fmtColor(shadeColor(s(v, "base"), st))};`);
      return `:root {\n${lines.join("\n")}\n  --${nm}: var(--${nm}-500);\n}\n\n.button {\n  background: var(--${nm});\n}\n.button:hover {\n  background: var(--${nm}-600);\n}`;
    },
    html: (_v) => `<button class="button">Button</button>`,
    preview: (v) => (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 8, width: "100%", maxWidth: 520 }}>
        {shadeStops.map((st) => {
          const hex = shadeColor(s(v, "base"), st);
          return (
            <div key={st} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #334155" }}>
              <div style={{ height: 64, background: hex }} />
              <div style={{ padding: "6px 8px", background: "#0f172a", fontSize: 10, color: "#cbd5e1", fontFamily: "monospace" }}>
                <div style={{ fontWeight: 700 }}>{st}</div>
                <div>{hex}</div>
              </div>
            </div>
          );
        })}
      </div>
    ),
    guide: {
      about:
        "Design systems rarely use a single colour. They use a scale: very light tints for backgrounds, the base colour for actions, and darker shades for hover states and text. This generator builds that scale by mixing your base colour with white for the light steps and black for the dark steps, then writes it out as CSS custom properties.",
      tips: [
        "Use the 500 shade for main actions and 600 or 700 for hover and pressed states.",
        "Check text contrast: 50 to 300 shades suit dark text, 600 to 900 suit white text.",
        "Because variables cascade, you can re-theme a section by redefining them on a parent element.",
      ],
      support: "CSS custom properties are supported by every modern browser.",
    },
  },

  /* ------------------------------ Columns ------------------------------ */
  {
    id: "column",
    name: "Column Generator",
    icon: Layout,
    summary: "Multi-column text layouts with gaps and divider rules.",
    stage: "dark",
    defaults: { count: 3, gap: 32, ruleWidth: 1, ruleStyle: "solid", ruleColor: "#475569" },
    controls: [
      range("count", "Columns", 1, 5),
      range("gap", "Gap", 8, 80, "px"),
      range("ruleWidth", "Divider width", 0, 6, "px"),
      select("ruleStyle", "Divider style", [["solid", "Solid"], ["dashed", "Dashed"], ["dotted", "Dotted"], ["double", "Double"]]),
      color("ruleColor", "Divider colour"),
    ],
    css: (v, c) => {
      const decl = [`column-count: ${n(v, "count")}`, `column-gap: ${n(v, "gap")}px`];
      if (n(v, "ruleWidth") > 0) decl.push(`column-rule: ${n(v, "ruleWidth")}px ${s(v, "ruleStyle")} ${s(v, "ruleColor")}`);
      return rule(`.${c}`, decl) + "\n\n" + rule(`.${c} p`, ["margin: 0 0 1em", "break-inside: avoid"]);
    },
    html: (_v, c) => `<div class="${c}">\n  <p>First paragraph…</p>\n  <p>Second paragraph…</p>\n</div>`,
    preview: (_v, c) => (
      <div className={c} style={{ width: "100%", color: "#cbd5e1", fontSize: 13, lineHeight: 1.7 }}>
        <p>Newspapers use columns because shorter lines are easier to read. When a line is too long, the eye struggles to find the start of the next one.</p>
        <p>CSS columns flow content from one column to the next automatically, balancing the height so each column ends at about the same point.</p>
        <p>Use them for long text blocks, lists and galleries, but avoid them for content people must scroll up and down between columns to read.</p>
        <p>On small screens, switch to a single column with a media query so the text stays readable.</p>
      </div>
    ),
    guide: {
      about:
        "CSS multi-column layout splits content into columns that flow automatically, with optional dividing rules between them. It is ideal for long text, link lists and card galleries where you want the browser to balance the columns for you.",
      tips: [
        "Use break-inside: avoid on items such as cards so they are not split across two columns.",
        "Prefer column-width instead of column-count if you want the number of columns to adapt to the screen.",
        "Limit columns to two or three on tablets and one on phones.",
      ],
      support: "Multi-column layout is supported in all modern browsers.",
    },
  },

  /* ------------------------------ Cubic bezier ------------------------------ */
  {
    id: "cubicbezier",
    name: "Cubic Bezier Generator",
    icon: Sliders,
    summary: "Design custom easing curves and watch them move.",
    stage: "dark",
    defaults: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1, duration: 1.4 },
    controls: [
      range("x1", "Control point 1 · X", 0, 1, "", 0.01),
      range("y1", "Control point 1 · Y", -1, 2, "", 0.01),
      range("x2", "Control point 2 · X", 0, 1, "", 0.01),
      range("y2", "Control point 2 · Y", -1, 2, "", 0.01),
      range("duration", "Duration", 0.2, 4, "s", 0.1),
    ],
    presets: [
      { label: "ease", values: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 } },
      { label: "ease-in", values: { x1: 0.42, y1: 0, x2: 1, y2: 1 } },
      { label: "ease-out", values: { x1: 0, y1: 0, x2: 0.58, y2: 1 } },
      { label: "ease-in-out", values: { x1: 0.42, y1: 0, x2: 0.58, y2: 1 } },
      { label: "Back out", values: { x1: 0.34, y1: 1.56, x2: 0.64, y2: 1 } },
      { label: "Back in-out", values: { x1: 0.68, y1: -0.6, x2: 0.32, y2: 1.6 } },
      { label: "Quart in-out", values: { x1: 0.76, y1: 0, x2: 0.24, y2: 1 } },
      { label: "Expo out", values: { x1: 0.16, y1: 1, x2: 0.3, y2: 1 } },
    ],
    css: (v, c) => {
      const bez = `cubic-bezier(${n(v, "x1")}, ${n(v, "y1")}, ${n(v, "x2")}, ${n(v, "y2")})`;
      return rule(`.${c}`, [`transition: transform ${n(v, "duration")}s ${bez}`]) + "\n\n" + rule(`.${c}:hover`, ["transform: translateX(200px)"]);
    },
    html: (_v, c) => `<div class="${c}"></div>`,
    preview: (v) => {
      const bez = `cubic-bezier(${n(v, "x1")}, ${n(v, "y1")}, ${n(v, "x2")}, ${n(v, "y2")})`;
      const px = (x: number) => x * 100;
      const py = (y: number) => 100 - y * 100;
      return (
        <div style={{ display: "grid", gap: 20, width: "100%", maxWidth: 420 }}>
          <style>{`@keyframes pt-slide { from { transform: translateX(0); } to { transform: translateX(260px); } }`}</style>
          <svg viewBox="-12 -110 124 320" style={{ width: 150, height: 220, margin: "0 auto" }} role="img" aria-label="Easing curve">
            <rect x="0" y="0" width="100" height="100" fill="none" stroke="#334155" strokeDasharray="3 3" />
            <path d={`M0,100 C${px(n(v, "x1"))},${py(n(v, "y1"))} ${px(n(v, "x2"))},${py(n(v, "y2"))} 100,0`} fill="none" stroke="#38bdf8" strokeWidth="3" />
            <line x1="0" y1="100" x2={px(n(v, "x1"))} y2={py(n(v, "y1"))} stroke="#64748b" />
            <line x1="100" y1="0" x2={px(n(v, "x2"))} y2={py(n(v, "y2"))} stroke="#64748b" />
            <circle cx={px(n(v, "x1"))} cy={py(n(v, "y1"))} r="4" fill="#f472b6" />
            <circle cx={px(n(v, "x2"))} cy={py(n(v, "y2"))} r="4" fill="#f472b6" />
          </svg>
          <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 14, padding: 14 }}>
            <div
              key={JSON.stringify(v)}
              style={{ width: 40, height: 40, borderRadius: 10, background: "#3b82f6", animation: `pt-slide ${n(v, "duration")}s ${bez} infinite alternate` }}
            />
          </div>
        </div>
      );
    },
    guide: {
      about:
        "A cubic Bézier curve describes how an animation speeds up and slows down over time. The two control points shape the curve: the horizontal axis is time, the vertical axis is progress. Y values below 0 or above 1 make the motion overshoot, which creates bouncy, springy effects.",
      tips: [
        "Use ease-out (fast start, slow finish) for elements entering the screen, and ease-in for elements leaving.",
        "Keep UI transitions between 150 and 300 ms; longer feels sluggish.",
        "X values must stay between 0 and 1; only Y can go outside that range.",
      ],
      support: "cubic-bezier() timing functions are supported in all modern browsers.",
    },
  },

  /* ------------------------------ Dark mode ------------------------------ */
  {
    id: "darkmode",
    name: "Dark Mode Generator",
    icon: Sparkles,
    summary: "Light and dark theme variables with automatic contrast checks.",
    stage: "dark",
    injectCss: false,
    defaults: { lightBg: "#ffffff", lightSurface: "#f1f5f9", lightText: "#0f172a", darkBg: "#0b1120", darkSurface: "#1e293b", darkText: "#f1f5f9", accent: "#2563eb" },
    controls: [
      color("lightBg", "Light · background"),
      color("lightSurface", "Light · surface"),
      color("lightText", "Light · text"),
      color("darkBg", "Dark · background"),
      color("darkSurface", "Dark · surface"),
      color("darkText", "Dark · text"),
      color("accent", "Accent colour"),
    ],
    presets: [
      { label: "Slate", values: { lightBg: "#ffffff", lightSurface: "#f1f5f9", lightText: "#0f172a", darkBg: "#0b1120", darkSurface: "#1e293b", darkText: "#f1f5f9" } },
      { label: "Warm", values: { lightBg: "#fffbf5", lightSurface: "#fef3e2", lightText: "#3b2a1a", darkBg: "#1c1410", darkSurface: "#2b211b", darkText: "#f5e9dc" } },
      { label: "True black", values: { lightBg: "#ffffff", lightSurface: "#f4f4f5", lightText: "#18181b", darkBg: "#000000", darkSurface: "#18181b", darkText: "#fafafa" } },
    ],
    css: (v) =>
      `:root {\n  color-scheme: light dark;\n  --bg: ${s(v, "lightBg")};\n  --surface: ${s(v, "lightSurface")};\n  --text: ${s(v, "lightText")};\n  --accent: ${s(v, "accent")};\n}\n\n@media (prefers-color-scheme: dark) {\n  :root {\n    --bg: ${s(v, "darkBg")};\n    --surface: ${s(v, "darkSurface")};\n    --text: ${s(v, "darkText")};\n  }\n}\n\n/* Optional manual toggle: <html data-theme="dark"> */\n[data-theme="dark"] {\n  --bg: ${s(v, "darkBg")};\n  --surface: ${s(v, "darkSurface")};\n  --text: ${s(v, "darkText")};\n}\n\nbody {\n  background: var(--bg);\n  color: var(--text);\n  transition: background-color 0.3s ease, color 0.3s ease;\n}`,
    html: () => `<button onclick="document.documentElement.dataset.theme =\n  document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'">\n  Toggle theme\n</button>`,
    preview: (v) => {
      const panel = (bg: string, surface: string, text: string, label: string) => {
        const ratio = contrast(bg, text);
        const accentRatio = contrast(s(v, "accent"), "#ffffff");
        return (
          <div style={{ background: bg, color: text, borderRadius: 16, padding: 16, border: "1px solid rgba(148,163,184,0.3)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
            <div style={{ background: surface, borderRadius: 12, padding: 14, marginTop: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Card title</div>
              <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>Supporting text on a surface.</div>
              <span style={{ display: "inline-block", marginTop: 10, background: s(v, "accent"), color: "#fff", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                Action
              </span>
            </div>
            <div style={{ marginTop: 10, fontSize: 11 }}>
              Text contrast {ratio.toFixed(1)}:1 {ratio >= 4.5 ? "✓ AA" : "✗ below AA"}
              <br />
              Button contrast {accentRatio.toFixed(1)}:1 {accentRatio >= 4.5 ? "✓ AA" : "✗ below AA"}
            </div>
          </div>
        );
      };
      return (
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", width: "100%" }}>
          {panel(s(v, "lightBg"), s(v, "lightSurface"), s(v, "lightText"), "Light")}
          {panel(s(v, "darkBg"), s(v, "darkSurface"), s(v, "darkText"), "Dark")}
        </div>
      );
    },
    guide: {
      about:
        "Modern dark mode uses CSS custom properties for every colour so the whole page can switch themes by changing a few variables. The generated code follows the visitor's system setting through prefers-color-scheme and also supports a manual data-theme toggle.",
      tips: [
        "Avoid pure black text on pure white or the reverse; slightly softer colours cause less eye strain.",
        "Check contrast in both themes. The preview shows a WCAG ratio for each; 4.5:1 or higher passes AA for normal text.",
        "Lower the brightness of images in dark mode with a filter if they look too harsh.",
      ],
      support: "prefers-color-scheme and color-scheme are supported by all current browsers.",
    },
  },

  /* ------------------------------ Flexbox ------------------------------ */
  {
    id: "flexbox",
    name: "Flexbox Generator",
    icon: Layout,
    summary: "Experiment with direction, alignment, wrapping and gaps visually.",
    stage: "dark",
    defaults: { direction: "row", wrap: "nowrap", justify: "center", align: "center", gap: 16, items: "4", sizes: "varied" },
    controls: [
      select("direction", "flex-direction", [["row", "row"], ["row-reverse", "row-reverse"], ["column", "column"], ["column-reverse", "column-reverse"]]),
      select("wrap", "flex-wrap", [["nowrap", "nowrap"], ["wrap", "wrap"], ["wrap-reverse", "wrap-reverse"]]),
      select("justify", "justify-content", [["flex-start", "flex-start"], ["center", "center"], ["flex-end", "flex-end"], ["space-between", "space-between"], ["space-around", "space-around"], ["space-evenly", "space-evenly"]]),
      select("align", "align-items", [["stretch", "stretch"], ["flex-start", "flex-start"], ["center", "center"], ["flex-end", "flex-end"], ["baseline", "baseline"]]),
      range("gap", "gap", 0, 48, "px"),
      select("items", "Items", [["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["8", "8"]]),
      select("sizes", "Preview item sizes", [["varied", "Varied"], ["equal", "Equal"]]),
    ],
    css: (v, c) =>
      rule(`.${c}`, [
        "display: flex",
        `flex-direction: ${s(v, "direction")}`,
        `flex-wrap: ${s(v, "wrap")}`,
        `justify-content: ${s(v, "justify")}`,
        `align-items: ${s(v, "align")}`,
        `gap: ${n(v, "gap")}px`,
      ]),
    html: (v, c) => `<div class="${c}">\n${Array.from({ length: n(v, "items") }, (_, i) => `  <div>${i + 1}</div>`).join("\n")}\n</div>`,
    preview: (v, c) => {
      const count = n(v, "items");
      const varied = s(v, "sizes") === "varied";
      const palette = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#ef4444", "#84cc16"];
      return (
        <div className={c} style={{ width: "100%", height: 300, border: "1px dashed #475569", borderRadius: 14, padding: 12 }}>
          {Array.from({ length: count }, (_, i) => (
            <div
              key={i}
              style={{
                background: palette[i % palette.length],
                color: "#fff",
                fontWeight: 800,
                borderRadius: 10,
                display: "grid",
                placeItems: "center",
                minWidth: varied ? 44 + (i % 3) * 22 : 64,
                minHeight: s(v, "align") === "stretch" ? undefined : varied ? 44 + ((i + 1) % 3) * 22 : 64,
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      );
    },
    guide: {
      about:
        "Flexbox lays out items in one dimension, either a row or a column. justify-content distributes space along the main axis, align-items aligns across it, and gap sets consistent spacing without margin hacks. Change the direction and notice that the two axes swap.",
      tips: [
        "Use gap instead of margins between items; it never adds space at the outer edges.",
        "Add flex-wrap: wrap so items drop to a new line instead of shrinking on narrow screens.",
        "For two-dimensional layouts with rows and columns together, CSS Grid is usually a better choice.",
      ],
      support: "Flexbox and the gap property for flex containers are supported in all current browsers.",
    },
  },

  /* ------------------------------ Google fonts ------------------------------ */
  {
    id: "googlefonts",
    name: "Google Fonts CSS",
    icon: Type,
    summary: "Generate @import and link code for popular Google Fonts, with live preview.",
    stage: "dark",
    injectCss: false,
    defaults: { family: "Inter", weight: 600, size: 38, text: "The quick brown fox jumps over the lazy dog" },
    controls: [
      select("family", "Font family", FONTS.map((f) => [f.name, f.name] as [string, string])),
      select("weight", "Weight", [["300", "300 Light"], ["400", "400 Regular"], ["500", "500 Medium"], ["600", "600 Semibold"], ["700", "700 Bold"], ["800", "800 Extra bold"], ["900", "900 Black"]]),
      range("size", "Preview size", 16, 72, "px"),
      { key: "text", label: "Preview text", type: "text", maxLength: 80 },
    ],
    css: (v, c) => {
      const f = FONTS.find((x) => x.name === s(v, "family")) ?? FONTS[0];
      const w = nearestWeight(f.weights, n(v, "weight"));
      return `@import url('${fontHref(f.name, w)}');\n\n` + rule(`.${c}`, [`font-family: '${f.name}', ${f.fallback}`, `font-weight: ${w}`]);
    },
    html: (v) => {
      const f = FONTS.find((x) => x.name === s(v, "family")) ?? FONTS[0];
      const w = nearestWeight(f.weights, n(v, "weight"));
      return `<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin>\n<link href="${fontHref(f.name, w)}" rel="stylesheet">`;
    },
    preview: (v) => {
      const f = FONTS.find((x) => x.name === s(v, "family")) ?? FONTS[0];
      const w = nearestWeight(f.weights, n(v, "weight"));
      return (
        <div style={{ width: "100%" }}>
          <div style={{ fontFamily: `'${f.name}', ${f.fallback}`, fontWeight: w, fontSize: n(v, "size"), color: "#f1f5f9", lineHeight: 1.25 }}>
            {s(v, "text") || f.name}
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: "#94a3b8", fontFamily: GLOBAL_FONT_STACK }}>
            {f.name} · weight {w} · weights available: {f.weights.join(", ")}
          </div>
        </div>
      );
    },
    guide: {
      about:
        "Google Fonts are free web fonts you can load with an @import rule or a link tag. Requesting only the weights you actually use keeps the download small, which helps page speed. The preview loads the selected font directly from Google so you can judge it before copying the code.",
      tips: [
        "Load as few weights as you can; each one is a separate file.",
        "Use a link tag with preconnect in the HTML head for the fastest load. @import in CSS is simpler but slower.",
        "Always include a fallback generic family such as sans-serif for the moment before the font arrives.",
      ],
      support: "Web fonts work everywhere. This preview contacts fonts.googleapis.com to load the selected font; no other data is sent.",
    },
  },

  /* ------------------------------ Gradient border ------------------------------ */
  {
    id: "gradientborder",
    name: "Gradient Border Generator",
    icon: Palette,
    summary: "Rounded gradient borders using the padding-box and border-box technique.",
    stage: "dark",
    defaults: { width: 4, angle: 135, c1: "#3b82f6", c2: "#ec4899", radius: 20, innerBg: "#0f172a" },
    controls: [
      range("width", "Border width", 1, 16, "px"),
      range("angle", "Gradient angle", 0, 360, "°"),
      color("c1", "Colour 1"),
      color("c2", "Colour 2"),
      range("radius", "Corner radius", 0, 60, "px"),
      color("innerBg", "Inner background"),
    ],
    css: (v, c) =>
      rule(`.${c}`, [
        `border: ${n(v, "width")}px solid transparent`,
        `border-radius: ${n(v, "radius")}px`,
        `background:\n    linear-gradient(${s(v, "innerBg")}, ${s(v, "innerBg")}) padding-box,\n    linear-gradient(${n(v, "angle")}deg, ${s(v, "c1")}, ${s(v, "c2")}) border-box`,
      ]),
    html: (_v, c) => `<div class="${c}">Content</div>`,
    preview: (_v, c) => (
      <div className={c} style={{ width: 240, height: 160, display: "grid", placeItems: "center", color: "#e2e8f0", fontWeight: 700, fontSize: 14 }}>
        Gradient border
      </div>
    ),
    guide: {
      about:
        "Unlike border-image, this technique keeps rounded corners. The element gets a transparent border, then two backgrounds are stacked: a solid inner colour clipped to the padding box, and a gradient clipped to the border box. The gradient only shows through where the border is.",
      tips: [
        "The inner background must be a solid colour; a transparent one would let the gradient show through the whole box.",
        "Use the same colour as the surrounding page for a convincing outline effect.",
        "Increase the border width slightly on high-density displays so thin lines stay visible.",
      ],
      support: "Multiple backgrounds with different background-clip origins work in all current browsers.",
    },
  },
];

/* ================================================================== */
/*  Static page content                                                */
/* ================================================================== */

const FAQS: { q: string; a: string }[] = [
  {
    q: "Does the preview match the code I copy?",
    a: "Yes. The live preview is drawn using the exact same CSS that appears in the code box, applied to a sample element. If you change a slider, both update together, so what you see is what you get. Colours and sizes in the preview come from the generated rules, not from separate styling.",
  },
  {
    q: "Is anything uploaded or stored?",
    a: "No. All calculations happen in your browser and nothing you enter is sent to a server or saved. The only external request is made by the Google Fonts generator, which loads the selected font from Google so it can be previewed.",
  },
  {
    q: "Will this CSS work in my framework?",
    a: "The output is standard CSS, so it works in plain HTML, React, Next.js, Vue, Svelte and WordPress. Paste it into a global stylesheet or a CSS module. For Tailwind, put it in your CSS file with @layer components, or translate the values into arbitrary-value classes.",
  },
  {
    q: "Are vendor prefixes included?",
    a: "Where they are still useful, yes. For example the glassmorphism code includes -webkit-backdrop-filter, the clip-path code includes -webkit-clip-path, and the gradient text effect includes -webkit-background-clip. Tools such as Autoprefixer can add or remove prefixes based on the browsers you support.",
  },
  {
    q: "Are these effects bad for performance?",
    a: "Most are cheap, but a few deserve care. backdrop-filter blurs everything behind an element and can be slow on large areas or low-end phones. Large blurred box shadows are costly to animate. Animate transform and opacity rather than layout properties, and limit blur on full-screen elements.",
  },
  {
    q: "How do I keep animations accessible?",
    a: "Some people get dizzy or distracted by motion and enable reduced-motion in their system settings. Every animated generator here adds a prefers-reduced-motion rule that switches the animation off for those visitors. Also avoid flashing content, and keep important information out of animations that disappear.",
  },
  {
    q: "How can I check contrast and accessibility?",
    a: "Text should have a contrast ratio of at least 4.5:1 against its background (3:1 for large text). The Dark Mode generator calculates this for you. For glass and gradient backgrounds, test the worst-case area behind the text, not just the average colour.",
  },
  {
    q: "Can I use the generated code commercially?",
    a: "Yes. The CSS you generate is yours to use in personal and commercial projects without attribution. Fonts loaded from Google Fonts have their own open-source licences, which generally allow commercial use as well.",
  },
];

const SUPPORT_ROWS: [string, string, string][] = [
  ["backdrop-filter", "Glassmorphism", "Current Chrome, Edge, Firefox and Safari. Safari older than 18 needs the -webkit- prefix, which is included."],
  ["clip-path (basic shapes)", "Clip Path", "All current browsers."],
  ["conic-gradient", "Gradient", "All current browsers."],
  ["background-clip: text", "Animated Text", "Supported with the -webkit- prefix in some browsers, which is included."],
  ["accent-color / appearance: none", "Checkbox and Radio", "Current versions of all major browsers."],
  ["prefers-color-scheme", "Dark Mode", "All current browsers."],
];

const GROUP_ORDER = [
  { title: "Effects", ids: ["glassmorphism", "boxshadow", "gradient", "gradientborder", "borderimage", "clippath", "borderradius"] },
  { title: "Animation and text", ids: ["glitch", "animatedtext", "keyframes", "cubicbezier", "googlefonts"] },
  { title: "Components and layout", ids: ["button", "accordion", "checkbox", "flexbox", "column"] },
  { title: "Theming", ids: ["colorvariable", "darkmode"] },
];

const card = "rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8";
const fieldLabel = "text-xs font-bold uppercase tracking-wider text-slate-400";

const STAGE_STYLE: Record<Gen["stage"], React.CSSProperties> = {
  gradient: { background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #db2777 100%)" },
  dark: { background: "#020617" },
  light: { background: "#e2e8f0" },
};

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export default function GlassmorphismGenerator({ initialTool }: { initialTool?: string }) {
  const [activeId, setActiveId] = useState<string>(
    GENERATORS.some((g) => g.id === initialTool) ? (initialTool as string) : "glassmorphism"
  );
  const [store, setStore] = useState<Record<string, Values>>({});
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"css" | "html">("css");
  const [className, setClassName] = useState("element");
  const [copied, setCopied] = useState(false);

  const gen = GENERATORS.find((g) => g.id === activeId) ?? GENERATORS[0];
  const values: Values = store[gen.id] ?? gen.defaults;
  const cls = ident(className);

  // open the tool named in the URL hash, e.g. #boxshadow
  useEffect(() => {
    const fromHash = window.location.hash.replace("#", "");
    if (GENERATORS.some((g) => g.id === fromHash)) setActiveId(fromHash);
  }, []);

  const choose = (id: string) => {
    setActiveId(id);
    setTab("css");
    try {
      window.history.replaceState(null, "", `#${id}`);
    } catch {
      /* ignore */
    }
  };

  const setValue = (key: string, value: string | number) =>
    setStore((st) => ({ ...st, [gen.id]: { ...(st[gen.id] ?? gen.defaults), [key]: value } }));

  const applyPreset = (p: Values) => setStore((st) => ({ ...st, [gen.id]: { ...(st[gen.id] ?? gen.defaults), ...p } }));
  const reset = () => setStore((st) => ({ ...st, [gen.id]: gen.defaults }));

  // load the chosen Google Font so the preview can show it
  useEffect(() => {
    if (gen.id !== "googlefonts") return;
    const f = FONTS.find((x) => x.name === String(values.family)) ?? FONTS[0];
    const w = nearestWeight(f.weights, Number(values.weight));
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontHref(f.name, w);
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [gen.id, values.family, values.weight]);

  const code = tab === "css" ? gen.css(values, cls) : gen.html(values, cls);
  const liveCss = gen.injectCss === false ? "" : gen.css(values, "pt-live");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GROUP_ORDER.map((g) => ({
      title: g.title,
      tools: g.ids
        .map((id) => GENERATORS.find((x) => x.id === id)!)
        .filter((t) => !q || t.name.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q)),
    })).filter((g) => g.tools.length > 0);
  }, [query]);

  const jsonLd = useMemo(
    () =>
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }).replace(/</g, "\\u003c"),
    []
  );

  const Icon = gen.icon;

  const renderControl = (ctl: Control) => {
    const val = values[ctl.key];
    const id = `ctl-${gen.id}-${ctl.key}`;
    if (ctl.type === "range") {
      return (
        <div key={ctl.key}>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor={id} className="text-xs font-semibold text-slate-300">
              {ctl.label}
            </label>
            <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-cyan-300">
              {String(val)}
              {ctl.unit ?? ""}
            </span>
          </div>
          <input
            id={id}
            type="range"
            min={ctl.min}
            max={ctl.max}
            step={ctl.step ?? 1}
            value={Number(val)}
            onChange={(e) => setValue(ctl.key, Number(e.target.value))}
            className="w-full cursor-pointer accent-cyan-500"
          />
        </div>
      );
    }
    if (ctl.type === "color") {
      return (
        <div key={ctl.key}>
          <label htmlFor={id} className="mb-1 block text-xs font-semibold text-slate-300">
            {ctl.label}
          </label>
          <div className="flex items-center gap-2">
            <input
              id={id}
              type="color"
              value={String(val)}
              onChange={(e) => setValue(ctl.key, e.target.value)}
              className="h-9 w-14 cursor-pointer rounded-lg border border-slate-700 bg-slate-950 p-1"
            />
            <span className="font-mono text-[11px] text-slate-400">{String(val)}</span>
          </div>
        </div>
      );
    }
    if (ctl.type === "select") {
      return (
        <div key={ctl.key}>
          <label htmlFor={id} className="mb-1 block text-xs font-semibold text-slate-300">
            {ctl.label}
          </label>
          <select
            id={id}
            value={String(val)}
            onChange={(e) => setValue(ctl.key, e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          >
            {ctl.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );
    }
    return (
      <div key={ctl.key}>
        <label htmlFor={id} className="mb-1 block text-xs font-semibold text-slate-300">
          {ctl.label}
        </label>
        <input
          id={id}
          type="text"
          value={String(val)}
          maxLength={ctl.maxLength}
          onChange={(e) => setValue(ctl.key, e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
        />
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 md:p-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* ---------------- Sidebar ---------------- */}
        <aside className="lg:col-span-3">
          <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 lg:sticky lg:top-4 lg:max-h-[88vh] lg:overflow-y-auto">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Layers className="h-4 w-4 text-cyan-300" />
              {GENERATORS.length} CSS generators
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search generators…"
                aria-label="Search generators"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />
            </div>

            {/* Mobile picker */}
            <select
              aria-label="Choose generator"
              value={gen.id}
              onChange={(e) => choose(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs font-bold text-slate-200 lg:hidden"
            >
              {GROUP_ORDER.map((g) => (
                <optgroup key={g.title} label={g.title}>
                  {g.ids.map((id) => (
                    <option key={id} value={id}>
                      {GENERATORS.find((x) => x.id === id)!.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <nav className="hidden space-y-5 lg:block" aria-label="CSS generators">
              {filtered.map((g) => (
                <div key={g.title} className="space-y-1.5">
                  <h3 className="px-2 text-[11px] font-extrabold uppercase tracking-wider text-cyan-300">{g.title}</h3>
                  {g.tools.map((t) => {
                    const active = t.id === gen.id;
                    const TIcon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => choose(t.id)}
                        aria-current={active ? "page" : undefined}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition ${active ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                          }`}
                      >
                        <span className="flex items-center gap-2.5 truncate">
                          <TIcon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{t.name}</span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
                      </button>
                    );
                  })}
                </div>
              ))}
              {filtered.length === 0 && <p className="px-2 text-xs text-slate-500">No generator matches your search.</p>}
            </nav>
          </div>
        </aside>

        {/* ---------------- Main ---------------- */}
        <div className="space-y-8 lg:col-span-9">
          <div className={`${card} shadow-xl shadow-black/20`}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">{gen.name}</h2>
                  <p className="text-xs text-slate-400">{gen.summary}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                Runs in your browser
              </div>
            </div>

            {gen.presets && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className={fieldLabel}>Presets</span>
                {gen.presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p.values)}
                    className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-[11px] font-bold text-slate-300 transition hover:border-cyan-500/50 hover:text-cyan-300"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              {/* Preview */}
              <div className="xl:col-span-7">
                <div className={`${fieldLabel} mb-2`}>Live preview</div>
                <div
                  className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-3xl border border-slate-800 p-6"
                  style={STAGE_STYLE[gen.stage]}
                >
                  {gen.stage === "gradient" && (
                    <>
                      <div className="absolute -left-10 top-6 h-40 w-40 rounded-full bg-amber-300/70 blur-sm" />
                      <div className="absolute -bottom-10 right-4 h-48 w-48 rounded-full bg-cyan-300/60 blur-sm" />
                      <div className="absolute right-16 top-4 h-20 w-20 rounded-full bg-pink-300/70 blur-sm" />
                    </>
                  )}
                  {liveCss && <style>{liveCss}</style>}
                  <div className="relative z-10 flex w-full justify-center">{gen.preview(values, "pt-live")}</div>
                </div>
              </div>

              {/* Controls */}
              <div className="xl:col-span-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className={fieldLabel}>Settings</span>
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1 text-[11px] font-bold text-slate-300 transition hover:bg-slate-800"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                </div>
                <div className="max-h-[420px] space-y-4 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                  {gen.controls.map(renderControl)}
                </div>
              </div>
            </div>

            {/* Code */}
            <div className="mt-8 border-t border-slate-800 pt-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Code className="h-4 w-4 text-cyan-300" />
                  <div role="tablist" className="inline-flex rounded-xl border border-slate-800 bg-slate-950 p-1">
                    {(["css", "html"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        role="tab"
                        aria-selected={tab === t}
                        onClick={() => setTab(t)}
                        className={`rounded-lg px-3.5 py-1 text-xs font-bold uppercase transition ${tab === t ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
                          }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                    Class
                    <input
                      type="text"
                      value={className}
                      maxLength={40}
                      onChange={(e) => setClassName(e.target.value)}
                      aria-label="CSS class name"
                      className="w-28 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 font-mono text-[11px] text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-400"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : `Copy ${tab.toUpperCase()}`}
                </button>
              </div>
              <pre className="max-h-[420px] overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs leading-relaxed text-cyan-100">
                <code>{code}</code>
              </pre>
            </div>
          </div>

          {/* ---------------- Per-generator guide ---------------- */}
          <section className={card}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-100">About the {gen.name}</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">{gen.guide.about}</p>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-100">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  Tips
                </h3>
                <ul className="space-y-2.5 text-sm text-slate-300">
                  {gen.guide.tips.map((t) => (
                    <li key={t} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-100">
                  <AlertTriangle className="h-4 w-4 text-cyan-300" />
                  Browser support
                </h3>
                <p className="text-sm leading-relaxed text-slate-300">{gen.guide.support}</p>
              </div>
            </div>
          </section>

          {/* ---------------- Suite content ---------------- */}
          <section className={card}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                <Zap className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-100">How These CSS Generators Work</h2>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-slate-300">
              <p>
                Pick a generator from the list, adjust the sliders, colours and options, and copy the code. The preview is
                rendered from the very same CSS that appears in the code box, so there is no gap between what you see and
                what you paste. Use the class name field to match your own naming, the Reset button to start over, and the
                HTML tab for the markup that goes with the styles.
              </p>
              <p>
                Everything runs locally in your browser. Nothing you type is uploaded or stored, and there is no account or
                limit. Each generator also includes a short guide with practical tips and notes on browser support, so you
                know when an effect is safe to use in production.
              </p>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {[
                { t: "Preview equals code", b: "The preview uses the generated CSS directly, so it cannot drift from the output." },
                { t: "Accessible defaults", b: "Focus styles, reduced-motion rules and contrast checks are built into the relevant generators." },
                { t: "Copy and paste ready", b: "Clean, commented-free CSS with sensible prefixes that drops into any project or framework." },
              ].map((x) => (
                <div key={x.t} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                  <h3 className="mb-1.5 text-sm font-bold text-slate-100">{x.t}</h3>
                  <p className="text-xs leading-relaxed text-slate-400">{x.b}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={card}>
            <h2 className="mb-4 text-lg font-bold text-slate-100">Browser Support at a Glance</h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full min-w-[560px] text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-bold">Feature</th>
                    <th className="px-4 py-3 font-bold">Used by</th>
                    <th className="px-4 py-3 font-bold">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {SUPPORT_ROWS.map((r) => (
                    <tr key={r[0]}>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-200">{r[0]}</td>
                      <td className="px-4 py-3">{r[1]}</td>
                      <td className="px-4 py-3 text-slate-400">{r[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11px] text-slate-500">
              Browser support changes over time. Check a current compatibility table such as MDN or Can I Use before relying on a
              newer feature for a critical part of your site.
            </p>
          </section>

          <section className={card}>
            <h2 className="mb-4 text-lg font-bold text-slate-100">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {FAQS.map((f) => (
                <details key={f.q} className="group rounded-2xl border border-slate-800 bg-slate-950/60 p-4 open:border-slate-700">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-slate-100">
                    {f.q}
                    <span className="text-slate-500 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-xs leading-relaxed text-slate-400">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className={card}>
            <h2 className="mb-4 text-base font-bold text-slate-100">Related Free Tools</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { href: "/tools/json-formatter", t: "JSON Formatter", d: "Format and validate JSON data." },
                { href: "/tools/markdown-to-html", t: "Markdown to HTML", d: "Convert Markdown into clean HTML." },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-cyan-500/40"
                >
                  <span>
                    <span className="block text-sm font-semibold text-slate-100">{l.t}</span>
                    <span className="block text-xs text-slate-400">{l.d}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}