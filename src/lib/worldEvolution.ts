import type {
  CompanionMessage,
  DreamUser,
  HabitLog,
  WorldEvent,
} from '../models/dreamUser'
import { recalculateLevels } from '../models/progression'

const habitEffects: Record<HabitLog['habitType'], string> = {
  hydration: 'flowers bloom',
  reading: 'new plants unlock',
  fitness: 'trees grow',
  meditation: 'water feature glows',
  coding: 'creative vines grow',
  sleep: 'night sky softens',
}

const habitCategories: Record<HabitLog['habitType'], HabitLog['category']> = {
  hydration: 'wellness',
  reading: 'growth',
  fitness: 'wellness',
  meditation: 'wellness',
  coding: 'creator',
  sleep: 'wellness',
}

export function createCompanionMessage(
  userId: string,
  type: CompanionMessage['type'],
  message: string,
  location: string,
): CompanionMessage {
  return {
    id: `msg_${userId}_${Date.now()}`,
    type,
    location,
    message,
    createdAt: new Date().toISOString(),
    read: false,
  }
}

export function createWorldEvent(
  type: WorldEvent['type'],
  title: string,
  message: string,
  affectedLocation: string,
): WorldEvent {
  return {
    id: `event_${Date.now()}`,
    type,
    title,
    message,
    affectedLocation,
    seenByUser: false,
    createdAt: new Date().toISOString(),
  }
}

export function addXP(user: DreamUser, category: HabitLog['category'], amount: number) {
  if (category === 'creator') {
    return { ...user, creatorXP: user.creatorXP + amount }
  }

  if (category === 'growth') {
    return { ...user, growthXP: user.growthXP + amount }
  }

  return { ...user, wellnessXP: user.wellnessXP + amount }
}

export function checkGardenUpgrade(user: DreamUser): DreamUser {
  const completedHabits = user.habitLogs.length
  const currentGardenLevel = user.currentWorld.gardenLevel

  if (completedHabits >= 7 && currentGardenLevel < 3) {
    return recalculateLevels({
      ...user,
      growthXP: user.growthXP + 10,
      currentWorld: {
        ...user.currentWorld,
        gardenLevel: 3,
      },
      worldEvents: [
        createWorldEvent(
          'upgrade_unlocked',
          'Growth Garden Level 3',
          'Trees grew and the water feature appeared.',
          'growth_garden',
        ),
        ...user.worldEvents,
      ],
      companionMessages: [
        createCompanionMessage(
          user.uid,
          'garden_growth',
          'Your garden grew from your consistency.',
          'growth_garden',
        ),
        ...user.companionMessages,
      ],
    })
  }

  if (completedHabits >= 3 && currentGardenLevel < 2) {
    return recalculateLevels({
      ...user,
      wellnessXP: user.wellnessXP + 25,
      currentWorld: {
        ...user.currentWorld,
        gardenLevel: 2,
      },
      worldEvents: [
        createWorldEvent(
          'upgrade_unlocked',
          'Growth Garden Level 2',
          'Flowers bloomed and butterflies appeared.',
          'growth_garden',
        ),
        ...user.worldEvents,
      ],
      companionMessages: [
        createCompanionMessage(
          user.uid,
          'garden_growth',
          'Your garden grew from your consistency.',
          'growth_garden',
        ),
        ...user.companionMessages,
      ],
    })
  }

  return recalculateLevels(user)
}

export function checkWorldLevel(user: DreamUser) {
  return recalculateLevels(user)
}

export function completeHabit(
  user: DreamUser,
  habitType: HabitLog['habitType'],
): DreamUser {
  const category = habitCategories[habitType]
  const xpReward = category === 'creator' ? 10 : 10
  const habitLog: HabitLog = {
    id: `habit_${Date.now()}`,
    habitType,
    category,
    completed: true,
    xpReward,
    gardenEffect: habitEffects[habitType],
    loggedAt: new Date().toISOString(),
  }

  const withHabit = addXP(
    {
      ...user,
      habitLogs: [habitLog, ...user.habitLogs],
      companionMessages: [
        createCompanionMessage(
          user.uid,
          'garden_growth',
          `Your ${habitEffects[habitType]}.`,
          'growth_garden',
        ),
        ...user.companionMessages,
      ],
    },
    category,
    xpReward,
  )

  return checkWorldLevel(checkGardenUpgrade(withHabit))
}
