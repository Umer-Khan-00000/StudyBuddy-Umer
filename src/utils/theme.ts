export type ThemeId = 'cosmic' | 'ocean' | 'emerald' | 'sunset' | 'obsidian';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  subtitle: string;
  icon: string;
  previewGradient: string;
  bgGradient: string;
  orb1: string;
  orb2: string;
  orb3: string;
  primaryGradient: string;
  primaryHover: string;
  primaryBorder: string;
  textAccent: string;
  subTextAccent: string;
  badgeBg: string;
  glassBg: string;
  glassBorder: string;
  glowShadow: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  cosmic: {
    id: 'cosmic',
    name: 'Cosmic Violet',
    subtitle: 'Luminous Purple & Indigo Atmosphere',
    icon: '🔮',
    previewGradient: 'from-indigo-500 via-purple-500 to-pink-500',
    bgGradient: 'from-[#0b0e1b] via-[#141129] to-[#1c0f2b]',
    orb1: 'from-indigo-600/25 via-purple-600/15 to-transparent',
    orb2: 'from-fuchsia-600/20 via-pink-600/10 to-transparent',
    orb3: 'from-cyan-600/15 via-indigo-600/10 to-transparent',
    primaryGradient: 'from-indigo-600/90 to-purple-600/90',
    primaryHover: 'from-indigo-500 to-purple-500',
    primaryBorder: 'border-indigo-400/30',
    textAccent: 'text-indigo-300',
    subTextAccent: 'text-indigo-200',
    badgeBg: 'bg-indigo-500/15 border-indigo-400/30 text-indigo-200',
    glassBg: 'bg-white/[0.07]',
    glassBorder: 'border-white/15',
    glowShadow: 'shadow-indigo-900/30',
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Sapphire',
    subtitle: 'Calm Azure, Cyan & Marine Glow',
    icon: '🌊',
    previewGradient: 'from-cyan-400 via-blue-500 to-indigo-600',
    bgGradient: 'from-[#05141e] via-[#081e2e] to-[#0c283d]',
    orb1: 'from-cyan-500/25 via-blue-600/15 to-transparent',
    orb2: 'from-teal-500/20 via-sky-600/10 to-transparent',
    orb3: 'from-indigo-600/15 via-cyan-600/10 to-transparent',
    primaryGradient: 'from-cyan-600/90 to-blue-600/90',
    primaryHover: 'from-cyan-500 to-blue-500',
    primaryBorder: 'border-cyan-400/30',
    textAccent: 'text-cyan-300',
    subTextAccent: 'text-cyan-200',
    badgeBg: 'bg-cyan-500/15 border-cyan-400/30 text-cyan-200',
    glassBg: 'bg-white/[0.07]',
    glassBorder: 'border-white/15',
    glowShadow: 'shadow-cyan-900/30',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Sage',
    subtitle: 'Restorative Forest, Mint & Sage Greens',
    icon: '🍃',
    previewGradient: 'from-emerald-400 via-teal-500 to-green-600',
    bgGradient: 'from-[#061812] via-[#0a231b] to-[#0f2e23]',
    orb1: 'from-emerald-500/25 via-teal-600/15 to-transparent',
    orb2: 'from-green-500/20 via-emerald-600/10 to-transparent',
    orb3: 'from-teal-600/15 via-mint-600/10 to-transparent',
    primaryGradient: 'from-emerald-600/90 to-teal-600/90',
    primaryHover: 'from-emerald-500 to-teal-500',
    primaryBorder: 'border-emerald-400/30',
    textAccent: 'text-emerald-300',
    subTextAccent: 'text-emerald-200',
    badgeBg: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200',
    glassBg: 'bg-white/[0.07]',
    glassBorder: 'border-white/15',
    glowShadow: 'shadow-emerald-900/30',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Amber',
    subtitle: 'Warm Coral, Rose & Twilight Gold',
    icon: '🌅',
    previewGradient: 'from-rose-500 via-orange-500 to-amber-400',
    bgGradient: 'from-[#1c0e18] via-[#261320] to-[#2e1526]',
    orb1: 'from-rose-500/25 via-pink-600/15 to-transparent',
    orb2: 'from-amber-500/20 via-orange-600/10 to-transparent',
    orb3: 'from-fuchsia-600/15 via-rose-600/10 to-transparent',
    primaryGradient: 'from-rose-600/90 to-amber-600/90',
    primaryHover: 'from-rose-500 to-amber-500',
    primaryBorder: 'border-rose-400/30',
    textAccent: 'text-rose-300',
    subTextAccent: 'text-rose-200',
    badgeBg: 'bg-rose-500/15 border-rose-400/30 text-rose-200',
    glassBg: 'bg-white/[0.07]',
    glassBorder: 'border-white/15',
    glowShadow: 'shadow-rose-900/30',
  },
  obsidian: {
    id: 'obsidian',
    name: 'Midnight Slate',
    subtitle: 'Ultra-Clean Titanium, Carbon & Cool Slate',
    icon: '🌌',
    previewGradient: 'from-slate-400 via-zinc-500 to-neutral-700',
    bgGradient: 'from-[#0b0e14] via-[#111620] to-[#161c28]',
    orb1: 'from-slate-500/20 via-indigo-900/15 to-transparent',
    orb2: 'from-blue-600/15 via-slate-800/10 to-transparent',
    orb3: 'from-indigo-600/10 via-slate-700/10 to-transparent',
    primaryGradient: 'from-slate-600/90 to-indigo-600/90',
    primaryHover: 'from-slate-500 to-indigo-500',
    primaryBorder: 'border-slate-400/30',
    textAccent: 'text-slate-200',
    subTextAccent: 'text-slate-300',
    badgeBg: 'bg-slate-500/20 border-slate-400/30 text-slate-200',
    glassBg: 'bg-white/[0.07]',
    glassBorder: 'border-white/15',
    glowShadow: 'shadow-slate-900/30',
  },
};

export const getStoredTheme = (): ThemeId => {
  try {
    const saved = localStorage.getItem('study_buddy_theme');
    if (saved && saved in THEMES) {
      return saved as ThemeId;
    }
  } catch (e) {
    // fallback
  }
  return 'cosmic';
};

export const saveStoredTheme = (theme: ThemeId) => {
  try {
    localStorage.setItem('study_buddy_theme', theme);
  } catch (e) {
    // ignore
  }
};
