// Animal Types (English -> Turkish Database Key Mapping)
export const ANIMAL_TYPE_MAPPING: Record<string, string> = {
  cat: 'kedi',
  dog: 'köpek',
  bird: 'kuş',
  rabbit: 'tavşan',
  hamster: 'hamster',
  other: 'diğer',
} as const

// Animal Type Labels (Turkish)
export const ANIMAL_TYPE_LABELS: Record<string, string> = {
  cat: 'Kedi',
  dog: 'Köpek',
  bird: 'Kuş',
  rabbit: 'Tavşan',
  hamster: 'Hamster',
  other: 'Diğer',
} as const

// Gender Labels (Turkish)
export const GENDER_LABELS: Record<string, string> = {
  male: 'Erkek',
  female: 'Dişi',
} as const

// Food Point Types
export const FOOD_POINT_TYPES = {
  FEEDING: 'feeding',
  SUPPLY: 'supply',
} as const

// Food Point Type Labels (Turkish)
export const FOOD_POINT_TYPE_LABELS: Record<string, string> = {
  feeding: 'Besleme Noktası',
  supply: 'Mama Temin Noktası',
} as const

// Health Status
export const HEALTH_STATUS = {
  HEALTHY: 'healthy',
  SICK: 'sick',
  RECOVERING: 'recovering',
  CRITICAL: 'critical',
} as const

// Health Status Labels (Turkish)
export const HEALTH_STATUS_LABELS: Record<string, string> = {
  healthy: 'Sağlıklı',
  sick: 'Hasta',
  recovering: 'İyileşiyor',
  critical: 'Kritik',
} as const

