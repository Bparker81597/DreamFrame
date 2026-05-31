export type EraConfig = {
  id: string
  name: string
  tagline: string
  description: string
  themeGradient: string
  starterWorld: string
  locations: string[]
  defaultGoals: string[]
  status: 'active' | 'coming_soon' | 'locked'
}

export const eras: EraConfig[] = [
  {
    id: 'creator_era',
    name: 'Creator Era',
    tagline: 'Build the world you imagine.',
    description:
      'For creativity, coding, projects, learning, and entrepreneurship.',
    themeGradient: 'linear-gradient(135deg, #8455ef, #fe7488)',
    starterWorld: 'creator_studio',
    locations: [
      'Creator Studio',
      'Growth Garden',
      'Journal Corner',
      'Future Self Observatory',
      'Dream Sanctuary',
    ],
    defaultGoals: [
      'Work on DreamFrame',
      'Complete a focus session',
      'Write a reflection',
    ],
    status: 'active',
  },
  {
    id: 'healing_era',
    name: 'Healing Era',
    tagline: 'Return to yourself gently.',
    description: 'For emotional repair, rest, rituals, and soft consistency.',
    themeGradient: 'linear-gradient(135deg, #d0bcff, #ffdadc)',
    starterWorld: 'dream_sanctuary',
    locations: ['Dream Sanctuary', 'Journal Corner', 'Growth Garden'],
    defaultGoals: ['Write a reflection', 'Meditate', 'Rest intentionally'],
    status: 'coming_soon',
  },
  {
    id: 'glow_up_era',
    name: 'Glow Up Era',
    tagline: 'Become radiant through action.',
    description: 'For confidence, self-care, wellness, and transformation.',
    themeGradient: 'linear-gradient(135deg, #fbbf24, #f472b6)',
    starterWorld: 'glow_suite',
    locations: ['Growth Garden', 'Dream Sanctuary', 'Future Self Observatory'],
    defaultGoals: ['Complete a habit', 'Move your body', 'Plan the week'],
    status: 'locked',
  },
  {
    id: 'leadership_era',
    name: 'Leadership Era',
    tagline: 'Move with clarity and power.',
    description: 'For vision, discipline, strategy, and steady expansion.',
    themeGradient: 'linear-gradient(135deg, #5516be, #b15f00)',
    starterWorld: 'leadership_study',
    locations: ['Creator Studio', 'Future Self Observatory', 'World Map'],
    defaultGoals: ['Set priorities', 'Complete deep work', 'Review progress'],
    status: 'locked',
  },
]

export const activeEra = eras.find((era) => era.status === 'active') ?? eras[0]
