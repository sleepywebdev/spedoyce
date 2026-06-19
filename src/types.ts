export type MaterialId = 'stealth' | 'cyan' | 'gold' | 'nebula' | 'glacier' | 'emerald';

export interface MaterialConfig {
  id: MaterialId;
  name: string;
  color: string;
  metalness: number;
  roughness: number;
  transmission: number;
  thickness: number;
  clearcoat: number;
  emissive?: string;
  emissiveIntensity?: number;
  internalGlowColor: string;
  price: number;
  description: string;
  badge: string;
}

export interface CustomizationState {
  material: MaterialId;
  engraving: string;
  glowEnabled: boolean;
  glowColor: string;
  glowIntensity: number;
  particleAeroEnabled: boolean;
  gravityFactor: number; // For rebound simulator
}

export interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  date: string;
  verified: boolean;
  comment: string;
  avatar: string;
}
