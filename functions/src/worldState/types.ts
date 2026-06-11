import type { Timestamp } from 'firebase-admin/firestore'

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
  createdAt: Timestamp
  updatedAt: Timestamp
  lastEventAt?: Timestamp
}

export type WorldStateEventEffect = {
  creatorXP?: number
  reflectionXP?: number
  consistencyXP?: number
  momentum?: number
  reflection?: number
  consistency?: number
  studioProgress?: number
  tasksCompleted?: number
  milestonesCompleted?: number
  projectsCompleted?: number
  achievements?: number
  storybookProgress?: number
  chaptersCreated?: number
}

export type WorldStateEvent = {
  schemaVersion: 1
  type: WorldStateEventType
  sourceId: string
  sourcePath: string
  effect: WorldStateEventEffect
  createdAt: Timestamp
}

