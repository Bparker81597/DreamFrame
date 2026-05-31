import { initialUser } from '../data/initialUser'
import type { CreateStarterUserInput, DreamUser } from './dreamUser'
import { recalculateLevels } from './progression'

export function createStarterWorldUser(input: CreateStarterUserInput): DreamUser {
  const now = new Date().toISOString()

  return recalculateLevels({
    ...initialUser,
    uid: input.uid,
    displayName: input.displayName,
    email: input.email ?? initialUser.email,
    photoURL: input.photoURL ?? '',
    onboardingComplete: true,
    currentEra: input.currentEra ?? 'Creator Era',
    creatorType: 'app_builder',
    futureSelfVision:
      input.futureSelfVision || initialUser.futureSelfVision,
    worldLevel: 1,
    creatorLevel: 1,
    wellnessLevel: 1,
    reflectionLevel: 1,
    growthLevel: 1,
    creatorXP: 0,
    wellnessXP: 0,
    reflectionXP: 0,
    growthXP: 0,
    currentWorld: {
      worldType: 'creator_studio',
      studioLevel: 1,
      gardenLevel: 1,
      sanctuaryLevel: 0,
      observatoryLevel: 0,
      visualState: 'starter_studio',
    },
    firstUpgradeUnlocked: false,
    firstReflectionComplete: false,
    firstFocusSessionComplete: false,
    firstGoalComplete: false,
    goals: [],
    habitLogs: [],
    journalEntries: [],
    companionMessages: [
      {
        id: `msg_${Date.now()}`,
        type: 'encouragement',
        location: 'home',
        message: 'Your world noticed.',
        createdAt: now,
        read: false,
      },
    ],
    worldEvents: [],
    createdAt: now,
    updatedAt: now,
    lastActiveAt: now,
  })
}
