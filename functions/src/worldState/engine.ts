import { Timestamp } from 'firebase-admin/firestore'
import type {
  WorldState,
  WorldStateEventEffect,
  WorldStateEventType,
} from './types.js'

const creatorLevelThresholds = [0, 50, 120, 250, 500, 800, 1200, 1700, 2300, 3000]
const momentumThresholds = [0, 25, 75, 160, 300, 500]
const reflectionThresholds = [0, 30, 90, 180, 320, 500]
const consistencyThresholds = [0, 30, 90, 210, 420, 700]
const studioThresholds = [0, 100, 250, 500, 900, 1400]
const storybookThresholds = [0, 20, 60, 120, 220, 360]

export const worldStateEventCatalog: Record<
  WorldStateEventType,
  WorldStateEventEffect
> = {
  focus_session_completed: {
    creatorXP: 20,
    momentum: 10,
    studioProgress: 4,
  },
  project_task_completed: {
    creatorXP: 10,
    momentum: 8,
    studioProgress: 5,
    tasksCompleted: 1,
  },
  project_milestone_completed: {
    creatorXP: 50,
    momentum: 20,
    studioProgress: 20,
    milestonesCompleted: 1,
    storybookProgress: 5,
  },
  project_completed: {
    creatorXP: 100,
    momentum: 30,
    studioProgress: 35,
    projectsCompleted: 1,
    storybookProgress: 10,
  },
  journal_entry_created: {
    reflectionXP: 10,
    reflection: 10,
    storybookProgress: 2,
  },
  daily_check_in_completed: {
    consistencyXP: 15,
    consistency: 10,
    momentum: 3,
  },
  achievement_unlocked: {
    achievements: 1,
    studioProgress: 5,
    storybookProgress: 3,
  },
  storybook_chapter_created: {
    chaptersCreated: 1,
    storybookProgress: 15,
    reflection: 5,
  },
  monthly_reflection_completed: {
    reflectionXP: 40,
    reflection: 30,
    storybookProgress: 20,
    consistency: 10,
  },
}

function getLevel(score: number, thresholds: number[]) {
  return thresholds.reduce(
    (level, threshold, index) => (score >= threshold ? index + 1 : level),
    1,
  )
}

function add(value: number, increment = 0) {
  return Math.max(0, value + increment)
}

function dateKey(timestamp: Timestamp) {
  return timestamp.toDate().toISOString().slice(0, 10)
}

function daysBetween(previousDate: string, nextDate: string) {
  const previous = Date.parse(`${previousDate}T00:00:00.000Z`)
  const next = Date.parse(`${nextDate}T00:00:00.000Z`)

  return Math.round((next - previous) / 86_400_000)
}

export function createInitialWorldState(now = Timestamp.now()): WorldState {
  return {
    schemaVersion: 1,
    xp: {
      total: 0,
      creator: 0,
      reflection: 0,
      consistency: 0,
    },
    creatorLevel: 1,
    momentum: {
      score: 0,
      level: 1,
    },
    reflection: {
      score: 0,
      level: 1,
      entries: 0,
    },
    consistency: {
      score: 0,
      level: 1,
      currentStreak: 0,
      bestStreak: 0,
    },
    studioProgress: {
      score: 0,
      level: 1,
      tasksCompleted: 0,
      milestonesCompleted: 0,
      projectsCompleted: 0,
    },
    achievementCount: 0,
    storybookProgress: {
      score: 0,
      level: 1,
      chaptersCreated: 0,
    },
    eventCount: 0,
    createdAt: now,
    updatedAt: now,
  }
}

export function applyWorldStateEffect({
  current,
  effect,
  eventType,
  occurredAt,
}: {
  current: WorldState
  effect: WorldStateEventEffect
  eventType: WorldStateEventType
  occurredAt: Timestamp
}): WorldState {
  const creatorXP = add(current.xp.creator, effect.creatorXP)
  const reflectionXP = add(current.xp.reflection, effect.reflectionXP)
  const consistencyXP = add(current.xp.consistency, effect.consistencyXP)
  const momentumScore = add(current.momentum.score, effect.momentum)
  const reflectionScore = add(current.reflection.score, effect.reflection)
  const consistencyScore = add(current.consistency.score, effect.consistency)
  const studioScore = add(current.studioProgress.score, effect.studioProgress)
  const storybookScore = add(
    current.storybookProgress.score,
    effect.storybookProgress,
  )
  const nextConsistency = { ...current.consistency }

  if (eventType === 'daily_check_in_completed') {
    const nextDate = dateKey(occurredAt)
    const difference = nextConsistency.lastActiveDate
      ? daysBetween(nextConsistency.lastActiveDate, nextDate)
      : undefined

    if (difference === undefined) {
      nextConsistency.currentStreak = 1
    } else if (difference === 1) {
      nextConsistency.currentStreak += 1
    } else if (difference > 1) {
      nextConsistency.currentStreak = 1
    }

    nextConsistency.bestStreak = Math.max(
      nextConsistency.bestStreak,
      nextConsistency.currentStreak,
    )
    nextConsistency.lastActiveDate = nextDate
  }

  return {
    ...current,
    xp: {
      total: creatorXP + reflectionXP + consistencyXP,
      creator: creatorXP,
      reflection: reflectionXP,
      consistency: consistencyXP,
    },
    creatorLevel: getLevel(creatorXP, creatorLevelThresholds),
    momentum: {
      score: momentumScore,
      level: getLevel(momentumScore, momentumThresholds),
    },
    reflection: {
      score: reflectionScore,
      level: getLevel(reflectionScore, reflectionThresholds),
      entries: add(
        current.reflection.entries,
        eventType === 'journal_entry_created' ? 1 : 0,
      ),
    },
    consistency: {
      ...nextConsistency,
      score: consistencyScore,
      level: getLevel(consistencyScore, consistencyThresholds),
    },
    studioProgress: {
      score: studioScore,
      level: getLevel(studioScore, studioThresholds),
      tasksCompleted: add(
        current.studioProgress.tasksCompleted,
        effect.tasksCompleted,
      ),
      milestonesCompleted: add(
        current.studioProgress.milestonesCompleted,
        effect.milestonesCompleted,
      ),
      projectsCompleted: add(
        current.studioProgress.projectsCompleted,
        effect.projectsCompleted,
      ),
    },
    achievementCount: add(current.achievementCount, effect.achievements),
    storybookProgress: {
      score: storybookScore,
      level: getLevel(storybookScore, storybookThresholds),
      chaptersCreated: add(
        current.storybookProgress.chaptersCreated,
        effect.chaptersCreated,
      ),
    },
    eventCount: current.eventCount + 1,
    updatedAt: occurredAt,
    lastEventAt: occurredAt,
  }
}

