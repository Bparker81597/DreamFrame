export type WorldStateEventType =
  | 'focus_session_completed'
  | 'project_task_completed'
  | 'project_milestone_completed'
  | 'project_completed'
  | 'journal_entry_created'
  | 'daily_check_in_completed'
  | 'achievement_unlocked'
  | 'storybook_chapter_created'
  | 'monthly_reflection_completed'

export type WorldState = {
  schemaVersion: 1
  xp: {
    total: number
    creator: number
    reflection: number
    consistency: number
  }
  creatorLevel: number
  momentum: {
    score: number
    level: number
  }
  reflection: {
    score: number
    level: number
    entries: number
  }
  consistency: {
    score: number
    level: number
    currentStreak: number
    bestStreak: number
    lastActiveDate?: string
  }
  studioProgress: {
    score: number
    level: number
    tasksCompleted: number
    milestonesCompleted: number
    projectsCompleted: number
  }
  achievementCount: number
  storybookProgress: {
    score: number
    level: number
    chaptersCreated: number
  }
  eventCount: number
  createdAt: unknown
  updatedAt: unknown
  lastEventAt?: unknown
}

export type ApplyWorldStateEventResponse = {
  applied: boolean
  worldState?: WorldState
}

