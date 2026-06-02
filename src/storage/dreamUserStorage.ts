import { initialUser } from '../data/initialUser'
import type { CreatorProject, DreamUser } from '../models/dreamUser'
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
        parsedUser.storybookChapters ?? initialUser.storybookChapters,
      creatorAchievements:
        parsedUser.creatorAchievements ?? initialUser.creatorAchievements,
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
