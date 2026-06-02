import { initialUser } from '../data/initialUser'
import type {
  CreatorAchievement,
  CreatorProject,
  DreamFrameMemory,
  DreamUser,
  StorybookChapter,
} from '../models/dreamUser'
import { recalculateLevels } from '../models/progression'

export const dreamUserStorageKey = 'dreamframe-prototype-user-v1'

function normalizeCreatorProjects(projects: CreatorProject[]) {
  return projects.map((project) => {
    const now = new Date().toISOString()
    const milestones = project.milestones ?? [
      {
        id: `milestone_${project.id}_next`,
        title: project.nextMilestone,
        completed: false,
        createdAt: project.createdAt ?? now,
        updatedAt: project.updatedAt ?? now,
        tasks: [
          {
            id: `task_${project.id}_next_step`,
            title: project.nextMilestone,
            completed: false,
            xpReward: 10,
            createdAt: project.createdAt ?? now,
          },
        ],
      },
    ]

    return {
      ...project,
      worldImpact:
        project.worldImpact ??
        'This Dream Project adds visible proof to the Creator Studio.',
      milestones,
    }
  })
}

function normalizeStorybookChapters(chapters: StorybookChapter[]) {
  return chapters.map((chapter, index) => ({
    ...chapter,
    weekLabel: chapter.weekLabel ?? `Week ${index + 1}`,
    subtitle: chapter.subtitle ?? 'A new piece of the journey appeared.',
    triggerType: chapter.triggerType ?? 'milestone',
    highlights: chapter.highlights ?? [],
    reflections: chapter.reflections ?? {
      wentWell: '',
      challenged: '',
      proudOf: '',
      next: '',
    },
    comicPanels: chapter.comicPanels ?? [],
  }))
}

function normalizeDreamFrameMemories(memories?: DreamFrameMemory[]) {
  return memories ?? initialUser.dreamFrameMemories
}

function normalizeCreatorAchievements(achievements?: CreatorAchievement[]) {
  return initialUser.creatorAchievements.map((achievement) => {
    const savedAchievement = achievements?.find((item) => item.id === achievement.id)

    return {
      ...achievement,
      unlocked: savedAchievement?.unlocked ?? achievement.unlocked,
      unlockedAt: savedAchievement?.unlockedAt ?? achievement.unlockedAt,
    }
  })
}

export function loadDreamUser() {
  const storedUser = window.localStorage.getItem(dreamUserStorageKey)

  if (!storedUser) {
    return initialUser
  }

  try {
    const parsedUser = JSON.parse(storedUser) as Partial<DreamUser>

    return recalculateLevels({
      ...initialUser,
      ...parsedUser,
      currentWorld: {
        ...initialUser.currentWorld,
        ...parsedUser.currentWorld,
      },
      goals: parsedUser.goals ?? initialUser.goals,
      dailyCheckIns: parsedUser.dailyCheckIns ?? initialUser.dailyCheckIns,
      progressHistory:
        parsedUser.progressHistory ?? initialUser.progressHistory,
      waitlistSignups:
        parsedUser.waitlistSignups ?? initialUser.waitlistSignups,
      creatorProjects:
        normalizeCreatorProjects(
          parsedUser.creatorProjects ?? initialUser.creatorProjects,
        ),
      creatorQuestlines:
        parsedUser.creatorQuestlines ?? initialUser.creatorQuestlines,
      storybookChapters:
        normalizeStorybookChapters(
          parsedUser.storybookChapters ?? initialUser.storybookChapters,
        ),
      dreamFrameMemories:
        normalizeDreamFrameMemories(parsedUser.dreamFrameMemories),
      creatorAchievements:
        normalizeCreatorAchievements(parsedUser.creatorAchievements),
      avatar: {
        ...initialUser.avatar,
        ...parsedUser.avatar,
      },
      habitLogs: parsedUser.habitLogs ?? initialUser.habitLogs,
      journalEntries: parsedUser.journalEntries ?? initialUser.journalEntries,
      companionMessages:
        parsedUser.companionMessages ?? initialUser.companionMessages,
      worldEvents: parsedUser.worldEvents ?? initialUser.worldEvents,
    } as DreamUser)
  } catch {
    return initialUser
  }
}

export function saveDreamUser(user: DreamUser) {
  window.localStorage.setItem(dreamUserStorageKey, JSON.stringify(user))
}

export function clearDreamUser() {
  window.localStorage.removeItem(dreamUserStorageKey)
}
