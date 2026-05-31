# DreamFrame Database & Progression Architecture v1

DreamFrame is built around one core mechanic:

> Real-life growth changes the user's visual world.

The v1 data model supports onboarding, era selection, future self setup, world
state, goals, journaling, focus sessions, habit actions, level progression,
visual upgrades, companion messages, and future social sharing.

## Recommended Stack

- Frontend: Next.js, React, Tailwind CSS, Framer Motion
- Backend: Firebase Auth, Firestore, Firebase Storage
- Later AI: OpenAI text generation, image generation, prompt templates in Firestore

## Firestore Structure

```txt
users/{userId}
users/{userId}/goals/{goalId}
users/{userId}/journalEntries/{entryId}
users/{userId}/focusSessions/{sessionId}
users/{userId}/habitLogs/{logId}
users/{userId}/worldEvents/{eventId}
users/{userId}/unlockedItems/{itemId}
users/{userId}/companionMessages/{messageId}
worldTemplates/{templateId}
eraTemplates/{eraId}
upgradeRules/{ruleId}
```

## User Document

```js
{
  uid: "user_123",
  displayName: "Brittany",
  email: "example@email.com",
  photoURL: "firebase-storage-url",
  onboardingComplete: true,
  currentEra: "creator_era",
  creatorType: "app_builder",
  futureSelfVision: "I want to become a confident creative founder building apps that help people grow.",
  dreamLifeDescription: "A peaceful creative lifestyle with successful apps, financial freedom, and emotional balance.",
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
    worldType: "creator_studio",
    studioLevel: 1,
    gardenLevel: 0,
    sanctuaryLevel: 0,
    observatoryLevel: 0,
    visualState: "starter_studio"
  },
  firstUpgradeUnlocked: false,
  firstReflectionComplete: false,
  firstFocusSessionComplete: false,
  firstGoalComplete: false,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastActiveAt: Timestamp
}
```

## XP Rewards

```txt
Journal Entry: +10 reflectionXP
Focus Session: +20 creatorXP
Goal Completed: +20 growthXP
Habit Completed: +10 wellnessXP
```

## Level Thresholds

```txt
Level 1: 0 XP
Level 2: 50 XP
Level 3: 120 XP
Level 4: 250 XP
Level 5: 500 XP
```

## First Upgrade Logic

Required actions:

```txt
firstReflectionComplete === true
firstFocusSessionComplete === true
firstGoalComplete === true
```

Result:

```txt
creatorStudioLevel = 2
firstUpgradeUnlocked = true
```

Visual rewards:

```txt
Plant appears
Lighting improves
Vision board appears
Future Self card brightens
```

Companion message:

```txt
"Your world noticed. Consistency creates momentum."
```

## MVP Build Order

1. Firebase setup: Auth, Firestore, Storage, starter security rules.
2. User onboarding: create user document, save selected era, save starter world.
3. Creator Studio: read world state and show first quest checklist.
4. Journal Corner: save first reflection, update reflection flag and XP.
5. Focus Session: complete session, update focus flag and creator XP.
6. Goal Completion: complete first goal, update goal flag and growth XP.
7. Upgrade Trigger: update Studio Level 2, create worldEvent, unlock items, show modal.

## MVP Rule

Do not build advanced social, marketplace, multiplayer, or 3D worlds yet.

The only goal of v1 is to prove:

> Users emotionally care when their real-life actions evolve their DreamFrame world.
