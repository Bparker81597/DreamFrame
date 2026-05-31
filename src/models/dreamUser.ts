export type WorldEvent = {
  id: string
  type: 'upgrade_unlocked' | 'companion_message'
  title: string
  message: string
  affectedLocation?: string
  previousLevel?: number
  newLevel?: number
  seenByUser: boolean
  createdAt: string
}

export type JournalEntry = {
  id: string
  prompt: string
  response: string
  reflectionXP: number
  createdAt: string
}

export type Goal = {
  id: string
  title: string
  status: 'active' | 'completed'
  xpReward: number
  createdAt: string
  completedAt?: string
}

export type DreamWorld = {
  worldType: string
  studioLevel: number
  gardenLevel: number
  sanctuaryLevel: number
  observatoryLevel: number
  visualState: string
}

export type DreamUser = {
  uid: string
  displayName: string
  email: string
  photoURL: string
  onboardingComplete: boolean
  currentEra: string
  creatorType: string
  futureSelfVision: string
  dreamLifeDescription: string
  worldLevel: number
  creatorLevel: number
  wellnessLevel: number
  reflectionLevel: number
  growthLevel: number
  creatorXP: number
  wellnessXP: number
  reflectionXP: number
  growthXP: number
  currentWorld: DreamWorld
  firstUpgradeUnlocked: boolean
  firstReflectionComplete: boolean
  firstFocusSessionComplete: boolean
  firstGoalComplete: boolean
  goals: Goal[]
  journalEntries: JournalEntry[]
  worldEvents: WorldEvent[]
  createdAt: string
  updatedAt: string
  lastActiveAt: string
}

export interface UserProfile {
  uid: string
  displayName: string
  photoURL?: string
  currentEra: string
  futureSelfVision: string
  worldLevel: number
  creatorLevel: number
  creatorXP: number
  firstReflectionComplete: boolean
  firstFocusSessionComplete: boolean
  firstGoalComplete: boolean
  firstUpgradeUnlocked: boolean
  studioLevel: number
}

export type DreamUserAction =
  | 'complete_reflection'
  | 'complete_focus_session'
  | 'complete_goal'
  | 'complete_habit'

export type DreamUserUpdate = (currentUser: DreamUser) => DreamUser

export type CreateStarterUserInput = {
  uid: string
  displayName: string
  email?: string
  photoURL?: string
  currentEra?: string
  futureSelfVision?: string
}

export function toUserProfile(user: DreamUser): UserProfile {
  return {
    uid: user.uid,
    displayName: user.displayName,
    photoURL: user.photoURL || undefined,
    currentEra: user.currentEra,
    futureSelfVision: user.futureSelfVision,
    worldLevel: user.worldLevel,
    creatorLevel: user.creatorLevel,
    creatorXP: user.creatorXP,
    firstReflectionComplete: user.firstReflectionComplete,
    firstFocusSessionComplete: user.firstFocusSessionComplete,
    firstGoalComplete: user.firstGoalComplete,
    firstUpgradeUnlocked: user.firstUpgradeUnlocked,
    studioLevel: user.currentWorld.studioLevel,
  }
}
