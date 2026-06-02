export type WorldEvent = {
  id: string
  type:
    | 'upgrade_unlocked'
    | 'companion_message'
    | 'daily_check_in'
    | 'future_self_visit'
  title: string
  message: string
  affectedLocation?: string
  previousLevel?: number
  newLevel?: number
  seenByUser: boolean
  createdAt: string
}

export type CompanionMessage = {
  id: string
  type: 'encouragement' | 'upgrade' | 'reflection' | 'garden_growth' | 'future_self'
  location: string
  message: string
  createdAt: string
  read: boolean
}

export type HabitLog = {
  id: string
  habitType: 'hydration' | 'reading' | 'fitness' | 'meditation' | 'coding' | 'sleep'
  category: 'wellness' | 'creator' | 'growth'
  completed: true
  xpReward: number
  gardenEffect: string
  loggedAt: string
}

export type CheckInMood =
  | 'bright'
  | 'steady'
  | 'tender'
  | 'stuck'
  | 'inspired'
  | 'focused'
  | 'motivated'
  | 'calm'
  | 'tired'

export type DailyActionType = 'breathe' | 'hydrate' | 'focus' | 'reflect'

export type DailyAction = {
  type: DailyActionType
  label: string
  xpReward: number
  worldEffect: string
  completedAt?: string
}

export type DailyCheckIn = {
  id: string
  date: string
  mood: CheckInMood
  intention: string
  action: DailyAction
  completed: boolean
  companionNote: string
  createdAt: string
  completedAt?: string
}

export type ProgressHistoryEntry = {
  id: string
  date: string
  title: string
  detail: string
  xpGained: number
  worldEffect: string
  createdAt: string
}

export type WaitlistSignup = {
  id: string
  email: string
  createdAt: string
}

export type BetaFeedback = {
  id: string
  category: 'bug' | 'confusing' | 'idea' | 'emotion'
  message: string
  route: string
  createdAt: string
}

export type BetaErrorLog = {
  id: string
  message: string
  source: string
  route: string
  createdAt: string
}

export type BetaGenerationUsage = {
  avatarGenerationsToday: number
  avatarGenerationLimit: number
  lastAvatarGenerationDate?: string
}

export type BetaDebugState = {
  enabled: boolean
  lastResetAt?: string
}

export type CreatorProjectStatus =
  | 'idea'
  | 'planning'
  | 'building'
  | 'launched'

export type CreatorProjectTask = {
  id: string
  title: string
  completed: boolean
  xpReward: number
  createdAt: string
  completedAt?: string
  completedHour?: number
}

export type CreatorProjectMilestone = {
  id: string
  title: string
  tasks: CreatorProjectTask[]
  completed: boolean
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export type CreatorProject = {
  id: string
  title: string
  progress: number
  nextMilestone: string
  worldImpact: string
  status: CreatorProjectStatus
  xpReward: number
  daysWorked: number
  milestonesCompleted: number
  milestones: CreatorProjectMilestone[]
  createdAt: string
  updatedAt: string
}

export type CreatorQuestline = {
  id: 'creator_spark' | 'momentum' | 'builder'
  title: string
  description: string
  reward: string
  rewardStudioLevel: number
  completed: boolean
  completedAt?: string
}

export type StorybookChapter = {
  id: string
  chapterNumber: number
  weekLabel: string
  title: string
  subtitle: string
  body: string
  triggerType: 'beginning' | 'weekly_reflection' | 'milestone' | 'momentum'
  highlights: string[]
  reflections: {
    wentWell: string
    challenged: string
    proudOf: string
    next: string
  }
  comicPanels: Array<{
    id: string
    title: string
    description: string
    avatarPose: AvatarPose
  }>
  createdAt: string
}

export type DreamFrameMemory = {
  id: string
  type:
    | 'first_project'
    | 'first_milestone'
    | 'longest_streak'
    | 'biggest_win'
    | 'favorite_quote'
    | 'favorite_journal_entry'
  label: string
  value: string
  sourceId?: string
  createdAt: string
}

export type CreatorAchievement = {
  id: string
  tier: 'beginning' | 'momentum' | 'identity' | 'growth' | 'legendary' | 'hidden'
  title: string
  description: string
  trigger: string
  reward: string
  studioUnlock: string
  xpReward: number
  hidden?: boolean
  unlocked: boolean
  unlockedAt?: string
}

export type AvatarStyle = 'illustrated_self'

export type AvatarCreatorType =
  | 'app_builder'
  | 'artist'
  | 'music_creator'
  | 'writer'
  | 'game_developer'
  | 'entrepreneur'

export type AvatarMood = 'focused' | 'inspired' | 'tired' | 'calm' | 'motivated'

export type AvatarPose =
  | 'standing'
  | 'working'
  | 'sketching'
  | 'relaxed'
  | 'journaling'
  | 'gardening'
  | 'celebrating'
  | 'future_facing'

export type AvatarStateType =
  | 'current_self'
  | 'future_self'
  | 'chibi_companion'

export type AvatarGenerationState = {
  type: AvatarStateType
  label: string
  prompt: string
  imageUrl: string
  transparentBackground: boolean
}

export type DreamAvatar = {
  style: AvatarStyle
  creatorType: AvatarCreatorType
  level: number
  mood: AvatarMood
  currentOutfit: string
  currentPose: AvatarPose
  unlockedItems: string[]
  artDirectionPrompt: string
  negativePrompt: string
  generatedStates: AvatarGenerationState[]
  avatarImageUrl: string
  futureAvatarImageUrl: string
  selfieImageUrl: string
  fullBodyImageUrl: string
  styleReferenceImageUrl: string
  onboardingComplete: boolean
  updatedAt: string
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
  dailyStreak: number
  bestDailyStreak: number
  lastCheckInDate?: string
  goals: Goal[]
  dailyCheckIns: DailyCheckIn[]
  progressHistory: ProgressHistoryEntry[]
  waitlistSignups: WaitlistSignup[]
  betaFeedback: BetaFeedback[]
  betaErrorLogs: BetaErrorLog[]
  betaGenerationUsage: BetaGenerationUsage
  betaDebug: BetaDebugState
  creatorProjects: CreatorProject[]
  creatorQuestlines: CreatorQuestline[]
  storybookChapters: StorybookChapter[]
  dreamFrameMemories: DreamFrameMemory[]
  creatorAchievements: CreatorAchievement[]
  avatar: DreamAvatar
  habitLogs: HabitLog[]
  journalEntries: JournalEntry[]
  companionMessages: CompanionMessage[]
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
  gardenLevel: number
  wellnessXP: number
  reflectionXP: number
  growthXP: number
  firstReflectionComplete: boolean
  firstFocusSessionComplete: boolean
  firstGoalComplete: boolean
  firstUpgradeUnlocked: boolean
  dailyStreak: number
  lastCheckInDate?: string
  studioLevel: number
  avatar?: DreamAvatar
  companionMessages?: CompanionMessage[]
}

export type DreamUserAction =
  | 'complete_reflection'
  | 'complete_focus_session'
  | 'complete_goal'
  | 'complete_habit'
  | 'complete_daily_check_in'

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
    gardenLevel: user.currentWorld.gardenLevel,
    wellnessXP: user.wellnessXP,
    reflectionXP: user.reflectionXP,
    growthXP: user.growthXP,
    firstReflectionComplete: user.firstReflectionComplete,
    firstFocusSessionComplete: user.firstFocusSessionComplete,
    firstGoalComplete: user.firstGoalComplete,
    firstUpgradeUnlocked: user.firstUpgradeUnlocked,
    dailyStreak: user.dailyStreak,
    lastCheckInDate: user.lastCheckInDate,
    studioLevel: user.currentWorld.studioLevel,
    avatar: user.avatar,
    companionMessages: user.companionMessages,
  }
}
