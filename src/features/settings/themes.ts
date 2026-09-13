import type { ThemeId, ThemePalette } from "./model.ts";

export const THEME_PALETTES: ThemePalette[] = [
  {
    id: "midnight",
    name: "Midnight",
    swatches: ["#111120", "#7c5cfc", "#22d3ee"],
    vars: {
      "--background": "#09090f",
      "--foreground": "#eeeef8",
      "--card": "#111120",
      "--card-foreground": "#eeeef8",
      "--primary": "#7c5cfc",
      "--primary-foreground": "#ffffff",
      "--secondary": "#1c1b2e",
      "--muted": "#1a1929",
      "--muted-foreground": "#8f8caf",
      "--accent": "#22d3ee",
      "--border": "rgba(255,255,255,0.08)",
      "--ring": "#7c5cfc",
    },
  },
  {
    id: "slate",
    name: "Slate",
    swatches: ["#18202b", "#4f8cff", "#f6c177"],
    vars: {
      "--background": "#10151d",
      "--foreground": "#eef3f8",
      "--card": "#18202b",
      "--card-foreground": "#eef3f8",
      "--primary": "#4f8cff",
      "--primary-foreground": "#ffffff",
      "--secondary": "#222c3a",
      "--muted": "#202a36",
      "--muted-foreground": "#9aa8b7",
      "--accent": "#f6c177",
      "--border": "rgba(238,243,248,0.09)",
      "--ring": "#4f8cff",
    },
  },
  {
    id: "forest",
    name: "Forest",
    swatches: ["#102019", "#34d399", "#f59e0b"],
    vars: {
      "--background": "#0b1511",
      "--foreground": "#edf8f2",
      "--card": "#102019",
      "--card-foreground": "#edf8f2",
      "--primary": "#34d399",
      "--primary-foreground": "#082018",
      "--secondary": "#1a2d24",
      "--muted": "#172820",
      "--muted-foreground": "#95ad9f",
      "--accent": "#f59e0b",
      "--border": "rgba(237,248,242,0.09)",
      "--ring": "#34d399",
    },
  },
  {
    id: "daylight",
    name: "Daylight",
    swatches: ["#ffffff", "#2563eb", "#e63757"],
    vars: {
      "--background": "#f5f7fb",
      "--foreground": "#151923",
      "--card": "#ffffff",
      "--card-foreground": "#151923",
      "--primary": "#2563eb",
      "--primary-foreground": "#ffffff",
      "--secondary": "#e8edf5",
      "--muted": "#eef2f8",
      "--muted-foreground": "#647084",
      "--accent": "#e63757",
      "--border": "rgba(21,25,35,0.11)",
      "--ring": "#2563eb",
    },
  },
];

export function isThemeId(value: unknown): value is ThemeId {
  return THEME_PALETTES.some(theme => theme.id === value);
}

export function getThemePalette(themeId: ThemeId): ThemePalette {
  return THEME_PALETTES.find(theme => theme.id === themeId) ?? THEME_PALETTES[0];
}
