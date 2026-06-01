import type { DreamUser, DreamUserAction } from './dreamUser'

export const levelThresholds = [0, 50, 120, 250, 500]

export const xpRewards: Record<DreamUserAction, number> = {
  complete_reflection: 10,
  complete_focus_session: 20,
  complete_goal: 20,
  complete_habit: 10,
  complete_daily_check_in: 15,
}

export function getLevel(xp: number) {
  return levelThresholds.reduce((level, threshold, index) => {
    return xp >= threshold ? index + 1 : level
  }, 1)
}

export function recalculateLevels(user: DreamUser): DreamUser {
  return {
    ...user,
    creatorLevel: getLevel(user.creatorXP),
    wellnessLevel: getLevel(user.wellnessXP),
    reflectionLevel: getLevel(user.reflectionXP),
    growthLevel: getLevel(user.growthXP),
    worldLevel: Math.max(
      user.currentWorld.studioLevel,
      user.currentWorld.gardenLevel,
      user.currentWorld.sanctuaryLevel,
      user.currentWorld.observatoryLevel,
    ),
  }
}

export function checkFirstUpgrade(user: DreamUser): DreamUser {
  const readyForUpgrade =
    user.firstReflectionComplete &&
    user.firstFocusSessionComplete &&
    user.firstGoalComplete &&
    !user.firstUpgradeUnlocked

  if (!readyForUpgrade) {
    return recalculateLevels(user)
  }

  const upgradedUser: DreamUser = {
    ...user,
    creatorXP: user.creatorXP + 50,
    firstUpgradeUnlocked: true,
    currentWorld: {
      ...user.currentWorld,
      studioLevel: 2,
      visualState: 'studio_level_2',
    },
    worldEvents: [
      {
        id: `event_${Date.now()}`,
        type: 'upgrade_unlocked',
        title: 'Studio Level 2 Unlocked',
        message: 'Your world noticed. Consistency creates momentum.',
        affectedLocation: 'creator_studio',
        previousLevel: 1,
        newLevel: 2,
        seenByUser: false,
        createdAt: new Date().toISOString(),
      },
      ...user.worldEvents,
    ],
  }

  return recalculateLevels(upgradedUser)
}

export const applyFirstUpgrade = checkFirstUpgrade
