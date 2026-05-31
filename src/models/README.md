# User Model Layer

`UserProfile` is the compact shape the UI can use when it only needs the core
profile and progression fields:

```ts
interface UserProfile {
  uid: string
  displayName: string
  photoURL?: string
  currentEra: string
  futureSelfVision: string
  worldLevel: number
  creatorLevel: number
  creatorXP: number
  firstReflectionComplete: boolean
  firstFocusSessionComplete: boolean
  firstGoalComplete: boolean
  firstUpgradeUnlocked: boolean
  studioLevel: number
}
```

`DreamUser` is the fuller Firestore-ready document model for `users/{userId}`.
Use `toUserProfile(user)` when a page only needs the compact profile state.

Progression rules live in `progression.ts`; local prototype persistence lives in
`storage/dreamUserStorage.ts`. Firebase can replace that storage module later
without forcing page components to own database details.
