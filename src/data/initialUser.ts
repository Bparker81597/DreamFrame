import type { DreamUser } from '../models/dreamUser'

const now = new Date().toISOString()

export const initialUser: DreamUser = {
  uid: 'prototype_user',
  displayName: 'Brittany',
  email: 'prototype@dreamframe.local',
  photoURL: '',
  onboardingComplete: false,
  currentEra: 'Creator Era',
  creatorType: 'app_builder',
  futureSelfVision:
    'I want to become a confident creative founder building apps that help people grow.',
  dreamLifeDescription:
    'A peaceful creative lifestyle with successful apps, financial freedom, and emotional balance.',
  worldLevel: 1,
  creatorLevel: 1,
  wellnessLevel: 1,
  reflectionLevel: 1,
  growthLevel: 1,
  creatorXP: 0,
  wellnessXP: 0,
  reflectionXP: 0,
  growthXP: 0,
  currentWorld: {
    worldType: 'creator_studio',
    studioLevel: 1,
    gardenLevel: 0,
    sanctuaryLevel: 0,
    observatoryLevel: 0,
    visualState: 'starter_studio',
  },
  firstUpgradeUnlocked: false,
  firstReflectionComplete: false,
  firstFocusSessionComplete: false,
  firstGoalComplete: false,
  goals: [],
  journalEntries: [],
  worldEvents: [],
  createdAt: now,
  updatedAt: now,
  lastActiveAt: now,
}
