// Queens puzzle type definitions — standalone app with coins + shop.

export type CellState = 'empty' | 'x' | 'crown';

// Subtle pastel colors for regions — muted, elegant Apple-style
// Standard 12 Farben für easy/normal/extreme
export const REGION_COLORS = [
  '#E8A598', '#E8C887', '#E8D88A', '#A8D4A0', '#9CCFC4',
  '#9CBFD9', '#B8A5C9', '#D9A5A0', '#B5B5B5', '#D4B896',
  '#A5B8D4', '#C4A5B8', '#F2B5C8', '#B8A5D9', '#A8D8C5',
];

// Femboy-Modus: 12 KRÄFTIGE Default-Farben (Hellfire: Kohle → Feuer → Flamme)
// Dies ist das DEFAULT Femboy-Theme (kostenlos, kein Kauf nötig)
// Beim Kauf eines Femboy-Themes (Lovey Dovey, Night Sky, etc.) wird dieses überschrieben
// 12 Farben (statt 15) weil Femboy-Modus jetzt 12 Regionen nutzt
export const REGION_COLORS_FEMBOY = [
  '#1A1A1A', // Kohle-Schwarz
  '#2D1B0E', // Dunkle Kohle
  '#4A1E0E', // Dunkel-Braun-Schwarz
  '#7A1F0A', // Dunkelrot-Kohle
  '#A52A2A', // Braun-Rot
  '#DC143C', // Crimson (Flamme)
  '#FF0000', // Reines Rot
  '#FF4500', // Orange-Red (Feuer)
  '#FF6347', // Tomato
  '#FF8C00', // Dark Orange
  '#FFA500', // Orange
  '#FFD700', // Gold (heißeste Flamme)
];

export interface Cell {
  row: number;
  col: number;
  regionId: number;
  state: CellState;
  hasError: boolean;
  hintExclude?: boolean;
}

export type Difficulty = 'easy' | 'normal' | 'extreme' | 'femboy';

export interface QueensStats {
  timeSeconds: number;
  hintsUsed: number;
  won: boolean;
  difficulty: Difficulty;
  gridSize: number;
  pfandflaschenEarned: number;
  date: string;
}

export interface PersistentStats {
  gamesPlayed: number;
  gamesWon: number;
  bestTime: Record<Difficulty, number | null>;
  bestHints: Record<Difficulty, number | null>;
  totalTime: number;
  totalHints: number;
  totalPfandflaschen: number;
  lastGame: QueensStats | null;
  history: QueensStats[];
}

export const INITIAL_STATS: PersistentStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  bestTime: { easy: null, normal: null, extreme: null, femboy: null },
  bestHints: { easy: null, normal: null, extreme: null, femboy: null },
  totalTime: 0,
  totalHints: 0,
  totalPfandflaschen: 0,
  lastGame: null,
  history: [],
};

export const DIFFICULTY_CONFIG = {
  easy:    { size: 6,  label: 'Easy',    description: '6×6 Raster · 6 Regionen' },
  normal:  { size: 8,  label: 'Normal',  description: '8×8 Raster · 8 Regionen' },
  extreme: { size: 12, label: 'Extrem',  description: '12×12 Raster · 12 Regionen' },
  femboy:  { size: 15, label: 'Ultra Pro Max Femboy Extreme Mode', description: '15×15 · 15 split Regionen · 1 Hint · 2 Errors', accent: 'pink' },
} as const;

// Pro-Difficulty Limits (statt globale MAX_HINTS/MAX_ERRORS)
export const DIFFICULTY_LIMITS: Record<Difficulty, { maxHints: number; maxErrors: number }> = {
  easy:    { maxHints: 3, maxErrors: 3 },
  normal:  { maxHints: 3, maxErrors: 3 },
  extreme: { maxHints: 3, maxErrors: 3 },
  femboy:  { maxHints: 1, maxErrors: 2 }, // Deutlich schwerer: 1 Hint, 2 Errors
};

// Backwards-compat Exports
export const MAX_HINTS = 3;
export const MAX_ERRORS = 3;

// Helper für aktuelle Difficulty-Limits
export function getDifficultyLimits(d: Difficulty) {
  return DIFFICULTY_LIMITS[d] ?? DIFFICULTY_LIMITS.easy;
}

// ── Shop Items ──
export interface ShopItem {
  id: string;
  name: string;
  type: 'theme' | 'queen-skin';
  price: number;
  description: string;
  // For themes: array of 12 colors (REGION_COLORS replacement)
  colors?: string[];
  // For queen skins: icon path or image URL (placeholder for PNG)
  queenIcon?: string;
}

// Color themes
export const SHOP_ITEMS: ShopItem[] = [
  // Themes
  { id: 'theme-pastel', name: 'Pastel', type: 'theme', price: 0, description: 'Standard Pastel-Farben', colors: ['#E8A598','#E8C887','#E8D88A','#A8D4A0','#9CCFC4','#9CBFD9','#B8A5C9','#D9A5A0','#B5B5B5','#D4B896','#A5B8D4','#C4A5B8'] },
  { id: 'theme-ocean', name: 'Ocean', type: 'theme', price: 100, description: 'Kühle Blau-Töne', colors: ['#A8D8EA','#B0E0E6','#AFEEEE','#87CEEB','#87CEFA','#B0C4DE','#ADD8E6','#B0E0E6','#87CEEB','#87CEFA','#B0C4DE','#AFEEEE'] },
  { id: 'theme-sunset', name: 'Sunset', type: 'theme', price: 150, description: 'Warme Orange-Rot-Töne', colors: ['#FFB6A3','#FFCBA4','#FFD8A8','#FFA07A','#FA8072','#E9967A','#F4A460','#FFA07A','#FA8072','#E9967A','#F4A460','#FFB6A3'] },
  { id: 'theme-forest', name: 'Forest', type: 'theme', price: 200, description: 'Grüne Natur-Töne', colors: ['#C5E1A5','#AED581','#DCEDC8','#C5E1A5','#A5D6A7','#81C784','#66BB6A','#4CAF50','#81C784','#A5D6A7','#C5E1A5','#DCEDC8'] },
  { id: 'theme-candy', name: 'Candy', type: 'theme', price: 250, description: 'Süße Bonbon-Farben', colors: ['#F8BBD0','#F48FB1','#FFCDD2','#FFAB91','#FFCC80','#FFF59D','#D7CCC8','#CE93D8','#B39DDB','#9FA8DA','#90CAF9','#81D4FA'] },
  { id: 'theme-mono', name: 'Monochrome', type: 'theme', price: 300, description: 'Elegante Grau-Töne', colors: ['#CFD8DC','#B0BEC5','#90A4AE','#78909C','#607D8B','#546E7A','#455A64','#37474F','#CFD8DC','#B0BEC5','#90A4AE','#78909C'] },
  // Queen Skins (PNGs werden später hinzugefügt — aktuell placeholder)
  { id: 'queen-classic', name: 'Classic Crown', type: 'queen-skin', price: 0, description: 'Standard Krone', queenIcon: 'classic' },
  { id: 'queen-gold', name: 'Gold Crown', type: 'queen-skin', price: 50, description: 'Goldene Krone', queenIcon: 'gold' },
  { id: 'queen-diamond', name: 'Diamond Crown', type: 'queen-skin', price: 200, description: 'Diamant-Krone', queenIcon: 'diamond' },
  { id: 'queen-star', name: 'Star Queen', type: 'queen-skin', price: 150, description: 'Sternen-Königin', queenIcon: 'star' },
];
