import { initialUser } from '../data/initialUser'
import type { DreamUser } from '../models/dreamUser'
import { recalculateLevels } from '../models/progression'

export const dreamUserStorageKey = 'dreamframe-prototype-user-v1'

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
    } as DreamUser)
  } catch {
    return initialUser
  }
}

export function saveDreamUser(user: DreamUser) {
  window.localStorage.setItem(dreamUserStorageKey, JSON.stringify(user))
}
