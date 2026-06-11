# DreamFrame Progression and Firebase Migration Plan

## Purpose

Move DreamFrame from a local, single-document prototype toward a secure,
subscription-ready Firebase architecture without copying Habitica's RPG
mechanics or the product concepts of the reference Firebase apps.

The target architecture keeps DreamFrame's identity:

- Creator Era
- Creator Studio
- Future Self Observatory
- Storybook Chapters
- Avatar Evolution
- Dream Projects

The migration should preserve the current user experience while making
progression authoritative, auditable, idempotent, and safe to extend.

## Executive Decision

Use a hybrid architecture:

1. Firebase Auth identifies the user.
2. `users/{userId}` stores a small profile and current progression summary.
3. User-owned content lives in per-user subcollections.
4. Callable Cloud Functions own every action that grants XP, unlocks an
   achievement, completes a milestone, creates a Storybook chapter, changes an
   avatar evolution state, or consumes a premium entitlement.
5. An append-only activity ledger records accepted progression events.
6. Firestore transactions update the source item, ledger, summary, and unlocks
   atomically.
7. Firebase Storage holds binary avatar inputs and outputs; Firestore holds
   metadata and references.
8. Subscription state is written only by trusted Cloud Functions and verified
   payment webhooks.

## Reference Research

### Habitica: Reuse the Boundaries, Replace the Mechanics

Habitica has useful architecture boundaries even though its scoring formulas,
damage, currency, streak bonuses, drops, and RPG rewards are not appropriate
for DreamFrame.

| Habitica pattern | DreamFrame decision | DreamFrame adaptation |
| --- | --- | --- |
| A central task-scoring operation validates state before changing progress | Reuse | `completeTask` callable validates ownership, current completion state, and reward eligibility |
| Scoring logic is separate from HTTP/controller orchestration | Reuse | Pure progression domain functions run inside transactional callable handlers |
| Level recalculation is centralized | Reuse | A single progression engine calculates Creator Era, Studio, Observatory, and Avatar levels |
| Completion state is checked before applying a score | Reuse | Idempotency keys and transaction checks prevent duplicate XP |
| Task history and user history are retained | Adapt | Use an append-only `progressEvents` ledger plus compact user summary |
| Achievements are triggered from accepted domain actions | Adapt | Evaluate declarative DreamFrame milestone definitions after accepted events |
| Scheduled daily processing considers user time zones | Adapt | Scheduled functions build weekly Storybook summaries and streak snapshots using user time zone |
| One large user object contains many achievement flags | Replace | Use achievement documents and summary counters rather than an expanding profile object |
| Dynamic task-value scoring, HP loss, gold, drops, critical hits, and penalties | Reject | Use fixed, transparent XP and narrative world effects |
| Reversible scoring formulas for unchecking tasks | Replace | Keep completion immutable by default; use explicit correction events for mistakes |

Useful source boundaries:

- [Habitica task scoring operation](https://github.com/HabitRPG/habitica/blob/d466e9bc5e51205b61598dc1d5a413851ba3e8be/website/common/script/ops/scoreTask.js)
- [Habitica server task orchestration](https://github.com/HabitRPG/habitica/blob/d466e9bc5e51205b61598dc1d5a413851ba3e8be/website/server/libs/tasks/index.js)
- [Habitica centralized level updates](https://github.com/HabitRPG/habitica/blob/d466e9bc5e51205b61598dc1d5a413851ba3e8be/website/common/script/fns/updateStats.js)
- [Habitica date and cron helpers](https://github.com/HabitRPG/habitica/blob/d466e9bc5e51205b61598dc1d5a413851ba3e8be/website/common/script/cron.js)

### Firebase Functions Samples

Patterns to reuse:

- Callable functions receive Auth context automatically, validate input, and
  return structured `HttpsError` failures.
- `defineSecret` binds private API keys only to functions that need them.
- Storage finalize triggers can derive assets and must include stop conditions
  so generated outputs do not recursively retrigger processing.
- App Check can protect expensive callable functions.
- Admin SDK initialization and privileged writes stay server-side.

Sources:

- [Authenticated callable function](https://github.com/firebase/functions-samples/blob/e6f88befa351324fe5c7300ab1f1e172e933f7f1/Node/quickstarts/callable-functions/functions/index.js)
- [TypeScript callable with `defineSecret`](https://github.com/firebase/functions-samples/blob/e6f88befa351324fe5c7300ab1f1e172e933f7f1/Node/youtube/functions/index.ts)
- [Storage-triggered image derivation](https://github.com/firebase/functions-samples/blob/e6f88befa351324fe5c7300ab1f1e172e933f7f1/Node/quickstarts/thumbnails/functions/index.js)
- [App Check callable client](https://github.com/firebase/functions-samples/blob/e6f88befa351324fe5c7300ab1f1e172e933f7f1/Node/call-vertex-remote-config-server/client/main.ts)

### Fireact

Patterns to reuse:

- Separate public, authenticated, and entitlement-protected application areas.
- Keep subscription documents separate from user profile documents.
- Use callable functions for user-initiated billing operations and a signed
  HTTP webhook for payment-provider lifecycle events.
- Block client writes to invoices and subscription authority fields.
- Represent plans as data and permissions as explicit entitlements.
- Use Firebase Emulator Suite and separate staging/production projects.

Patterns to replace:

- Do not store Stripe secrets in source-controlled JSON configuration. Use
  Firebase Secret Manager through `defineSecret`.
- Do not allow broad subscription listing. Query a user's subscription
  membership or entitlement document directly.

Sources:

- [Fireact architecture](https://github.com/fireact-dev/main/blob/a0deb893d813eb5e318d820c0939ef42e23b4366/ARCHITECTURE.md)
- [Fireact rules template](https://github.com/fireact-dev/main/blob/a0deb893d813eb5e318d820c0939ef42e23b4366/create-fireact-app/templates/firestore.rules)

### Firebase Cloud Functions TypeScript Example

Patterns to reuse:

- Keep HTTP/controller code, domain services, Firestore models, and event
  triggers in separate modules.
- Convert between domain entities and Firestore representations at a clear
  repository/model boundary.
- Use custom claims only for coarse global roles, not frequently changing
  progression or subscription state.

Patterns to replace:

- Prefer callable functions for DreamFrame client commands instead of a custom
  Express token interceptor. Callable functions already verify Firebase Auth
  tokens and provide Auth context.
- Avoid making Firestore triggers the primary progression command path. They
  are at-least-once events and need additional idempotency protection.

Sources:

- [TypeScript function entry point](https://github.com/RodrigoBertotti/firebase-cloud-functions-typescript-example/blob/57ad6c9f4f0ae91898d2904a95895d6dc3f85c65/functions/src/index.ts)
- [Auth interceptor](https://github.com/RodrigoBertotti/firebase-cloud-functions-typescript-example/blob/57ad6c9f4f0ae91898d2904a95895d6dc3f85c65/functions/src/api/interceptors/verify-idtoken-interceptor.ts)
- [Service and Firestore model boundary](https://github.com/RodrigoBertotti/firebase-cloud-functions-typescript-example/blob/57ad6c9f4f0ae91898d2904a95895d6dc3f85c65/functions/src/core/services/accounts-service.ts)
- [Document trigger organization](https://github.com/RodrigoBertotti/firebase-cloud-functions-typescript-example/blob/57ad6c9f4f0ae91898d2904a95895d6dc3f85c65/functions/src/event-triggers/by-document/users-event-triggers.ts)

### Loop

Patterns to reuse:

- A dedicated Auth context owns sign-in state and does not mix Auth lifecycle
  with feature components.
- A centralized data service owns subscriptions and returns unsubscribe
  functions.
- User-scoped paths keep data isolated.
- Vite PWA setup provides an installable shell and explicit asset caching.
- Public Firebase web configuration can use `VITE_FIREBASE_*` environment
  variables.

Patterns to replace:

- Do not store avatar binaries or large generated assets as Base64 database
  values. Use Firebase Storage.
- Do not grant progress from direct client writes.
- Do not cache authenticated Firestore API responses in the service worker.

Sources:

- [Loop Auth context](https://github.com/imnexerio/Loop/blob/7bb2ddf05d61c599a83b97878b79eb23cf03992b/src/contexts/AuthContext.tsx)
- [Loop centralized Firebase service](https://github.com/imnexerio/Loop/blob/7bb2ddf05d61c599a83b97878b79eb23cf03992b/src/services/firebaseService.ts)
- [Loop PWA configuration](https://github.com/imnexerio/Loop/blob/7bb2ddf05d61c599a83b97878b79eb23cf03992b/vite.config.ts)

## Current DreamFrame Assessment

DreamFrame already has:

- TypeScript Cloud Functions v2.
- A callable avatar generator.
- `defineSecret` for the OpenAI API key.
- Auth validation and user-scoped Storage-path validation.
- Firestore and Storage rules for avatar assets.
- Pure helpers for XP levels and world evolution.
- Rich domain types for projects, tasks, achievements, chapters, and avatars.

The primary migration risks are:

- Most app state is currently one `DreamUser` aggregate persisted locally.
- Completion and XP logic is distributed across UI handlers and helpers.
- Client code can currently decide XP and completion outcomes.
- Arrays such as projects, chapters, history, feedback, and logs will keep
  growing inside the aggregate.
- Existing Firestore rules only cover `users/{userId}/avatar/main`.
- There is no authoritative progression ledger or idempotency contract.

## Target Firestore Structure

Use the requested user-scoped collections, with a few supporting collections:

```text
users/{userId}
  profile and progression summary only

users/{userId}/projects/{projectId}
users/{userId}/tasks/{taskId}
users/{userId}/journalEntries/{entryId}
users/{userId}/achievements/{achievementId}
users/{userId}/storybookChapters/{chapterId}
users/{userId}/avatar/main

users/{userId}/progressEvents/{eventId}
users/{userId}/dailyCheckIns/{checkInId}
users/{userId}/betaFeedback/{feedbackId}
users/{userId}/entitlements/main
users/{userId}/subscriptionRefs/{subscriptionId}

subscriptions/{subscriptionId}
plans/{planId}
betaReports/{reportId}
```

### `users/{userId}`

Keep this document small and bounded:

```ts
type UserSummary = {
  displayName: string
  email: string
  photoURL: string
  onboardingComplete: boolean
  currentEra: 'creator'
  timeZone: string
  progression: {
    creatorXP: number
    reflectionXP: number
    wellnessXP: number
    growthXP: number
    creatorLevel: number
    worldLevel: number
    studioLevel: number
    observatoryLevel: number
    avatarLevel: number
  }
  counters: {
    completedTasks: number
    completedMilestones: number
    completedProjects: number
    journalEntries: number
    storybookChapters: number
    currentStreak: number
    bestStreak: number
  }
  createdAt: Timestamp
  updatedAt: Timestamp
  lastActiveAt: Timestamp
  schemaVersion: number
}
```

The client may update a narrow profile allowlist. Progression, counters, and
entitlements are server-only.

### `users/{userId}/projects/{projectId}`

```ts
type ProjectDocument = {
  title: string
  description?: string
  status: 'idea' | 'planning' | 'building' | 'launched' | 'archived'
  activeMilestoneId?: string
  progressPercent: number
  taskCount: number
  completedTaskCount: number
  milestoneCount: number
  completedMilestoneCount: number
  worldImpact: string
  createdAt: Timestamp
  updatedAt: Timestamp
  completedAt?: Timestamp
}
```

Client-created descriptive fields are acceptable. Server-only fields include
progress, counters, and completion timestamps.

### `users/{userId}/tasks/{taskId}`

Keep tasks independently queryable and link them to projects:

```ts
type TaskDocument = {
  projectId: string
  milestoneId?: string
  title: string
  status: 'open' | 'completed' | 'archived'
  rewardKey: 'project_next_step' | 'focus_session' | 'reflection'
  completedAt?: Timestamp
  completionEventId?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

Never trust an `xpReward` sent by the client. Resolve rewards from a
server-owned reward catalog.

### `users/{userId}/achievements/{achievementId}`

```ts
type AchievementDocument = {
  definitionId: string
  status: 'locked' | 'unlocked'
  progress: number
  target: number
  unlockedAt?: Timestamp
  sourceEventId?: string
}
```

Achievement definitions should be versioned server-owned data. User documents
store only state.

### `users/{userId}/storybookChapters/{chapterId}`

Storybook chapters are durable narrative records. The server creates triggered
chapters; users may edit only explicit reflection fields.

```ts
type StorybookChapterDocument = {
  chapterNumber: number
  triggerKey: string
  title: string
  body: string
  highlights: string[]
  sourceEventIds: string[]
  reflection: {
    wentWell: string
    challenged: string
    proudOf: string
    next: string
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### `users/{userId}/avatar/main`

Store avatar state and Storage references, not binary data:

```ts
type AvatarDocument = {
  creatorType: string
  level: number
  mood: string
  pose: string
  unlockedItems: string[]
  currentAssetId?: string
  futureAssetId?: string
  generationUsage: {
    dateKey: string
    used: number
  }
  updatedAt: Timestamp
}
```

### `users/{userId}/progressEvents/{eventId}`

This is the key new architectural component:

```ts
type ProgressEventDocument = {
  type: string
  sourceType: 'task' | 'project' | 'journal' | 'check_in' | 'system'
  sourceId: string
  idempotencyKey: string
  xp: {
    creator?: number
    reflection?: number
    wellness?: number
    growth?: number
  }
  effects: string[]
  createdAt: Timestamp
  schemaVersion: number
}
```

Use the event ID or `idempotencyKey` as the transaction guard. This makes
retries safe and creates the source data for the Future Self Observatory and
Storybook.

## Firebase Storage Structure

```text
users/{userId}/avatar/uploads/{uploadId}/selfie.{ext}
users/{userId}/avatar/uploads/{uploadId}/style-reference.{ext}
users/{userId}/avatar/generated/{generationId}/current.png
users/{userId}/avatar/generated/{generationId}/future.png
users/{userId}/avatar/generated/{generationId}/companion.png
users/{userId}/storybook/{chapterId}/{assetId}.png
users/{userId}/feedback/{feedbackId}/{attachmentId}.{ext}
```

Rules should enforce:

- Authenticated owner access.
- Image MIME allowlist and size limits.
- Separate upload and generated paths.
- Client writes allowed only to upload and feedback attachment paths.
- Generated avatar and Storybook paths writable only through Admin SDK.

Use Firestore asset metadata documents when lifecycle status matters:
`uploaded`, `processing`, `ready`, `failed`, `deleted`.

## Callable Function Commands

Organize TypeScript functions by domain:

```text
functions/src/
  index.ts
  shared/
    auth.ts
    errors.ts
    idempotency.ts
    validation.ts
  progression/
    rewardCatalog.ts
    progressionEngine.ts
    milestoneEngine.ts
    completeTask.ts
    completeMilestone.ts
    completeProject.ts
    submitJournalEntry.ts
    completeDailyCheckIn.ts
  storybook/
    createTriggeredChapter.ts
    buildWeeklyChapter.ts
  avatar/
    generateAvatar.ts
    evolveAvatar.ts
  feedback/
    submitBetaFeedback.ts
  billing/
    createCheckoutSession.ts
    createPortalSession.ts
    stripeWebhook.ts
```

Recommended callable commands:

| Function | Responsibility |
| --- | --- |
| `completeTask` | Validate task, atomically complete it, append event, grant XP, update project counters, evaluate triggers |
| `completeMilestone` | Complete eligible milestone and evaluate Studio, achievement, avatar, and chapter triggers |
| `completeProject` | Complete eligible project and update Future Self evidence |
| `submitJournalEntry` | Create entry and award reflection progress once |
| `completeDailyCheckIn` | Enforce one check-in per date key and update streak |
| `generateAvatar` | Validate entitlement and usage, consume quota, generate assets, persist metadata |
| `evolveAvatar` | Apply server-approved avatar level and unlock state |
| `submitBetaFeedback` | Sanitize and persist feedback with route/build context |
| `createCheckoutSession` | Create payment-provider checkout for an authenticated user |
| `createPortalSession` | Create billing-management portal session |

Every progression callable should:

1. Require Auth.
2. Enforce App Check in production.
3. Validate input with a schema.
4. Derive `userId` from Auth, never request data.
5. Resolve rewards and triggers server-side.
6. Run a Firestore transaction.
7. Use an idempotency key.
8. Return the accepted event and updated summary.

## Milestone Trigger Engine

Replace scattered conditional unlock logic with declarative definitions:

```ts
type MilestoneDefinition = {
  id: string
  version: number
  eventTypes: string[]
  conditions: Array<{
    metric: string
    operator: 'gte' | 'eq'
    value: number
  }>
  effects: Array<
    | { type: 'unlockAchievement'; achievementId: string }
    | { type: 'setStudioLevel'; level: number }
    | { type: 'setObservatoryLevel'; level: number }
    | { type: 'setAvatarLevel'; level: number }
    | { type: 'createStorybookChapter'; templateId: string }
  >
}
```

The engine receives the accepted event and current summary, evaluates only
definitions subscribed to that event type, and applies effects in the same
transaction where possible.

DreamFrame examples:

- First completed project task: unlock `first_step`.
- First completed milestone: evolve Creator Studio and create a chapter.
- Three active projects: unlock a Studio project wall.
- Five completed projects: brighten Future Self Observatory.
- Seven-day check-in streak: evolve Avatar presence without granting combat or
  RPG power.

## Security Rules Strategy

Rules should distinguish content writes from authority writes.

Client-writable:

- Safe profile fields.
- Project and task descriptive fields on owned records.
- Storybook reflection fields.
- Beta feedback creation.
- Avatar source image uploads.

Server-only:

- XP and levels.
- Completion state and completion timestamps.
- Achievement unlocks.
- Progress events.
- Storybook triggered content.
- Avatar level, generated asset references, and usage counters.
- Entitlements, subscription state, invoices, and plan authority fields.

Use field-level `diff().affectedKeys().hasOnly(...)` checks for allowed client
updates. Deny all direct writes to authority collections.

## Secure API Key Handling

- Keep Firebase web config in `VITE_FIREBASE_*`; it identifies the Firebase
  project and is not a server secret.
- Store OpenAI, Stripe secret, and Stripe webhook signing keys in Firebase
  Secret Manager with `defineSecret`.
- Bind each secret only to functions that need it.
- Never expose provider secret keys in React, Firestore, Storage metadata,
  source-controlled JSON, logs, or callable responses.
- Enable App Check on costly avatar and billing callables.
- Apply per-user generation limits inside transactions.

## Subscription-Ready Architecture

Do not place Stripe authority fields directly in the user profile.

```text
subscriptions/{subscriptionId}
  ownerId
  providerCustomerId
  providerSubscriptionId
  planId
  status
  currentPeriodEnd
  createdAt
  updatedAt

users/{userId}/entitlements/main
  planId
  status
  features:
    avatarGenerationsPerDay
    storybookImageGeneration
    projectLimit
    observatoryHistoryDays
  updatedAt
```

The webhook is the source of truth for paid status. It updates the subscription
and materialized user entitlement document. Feature code checks entitlements,
not raw Stripe status.

Suggested initial plans:

- `beta`: current beta limits.
- `creator`: increased avatar generation and project history.
- `studio`: future premium Storybook and Observatory features.

Plans describe limits and capabilities. They must not alter the meaning of XP
or make paid progress more valuable.

## PWA Plan

Add `vite-plugin-pwa` with:

- `registerType: 'autoUpdate'`.
- DreamFrame manifest, icons, theme color, and standalone display.
- Precache only versioned static shell assets.
- Network-first navigation fallback.
- No service-worker caching of authenticated Firestore, callable function,
  Storage download, or billing responses.
- An explicit offline state for reads.
- Queue only safe descriptive edits after conflict behavior is defined.
- Never queue progression completion commands blindly; retries require stable
  idempotency keys.

## Migration Phases

### Phase 0: Contracts and Safety

- Add shared domain schemas and `schemaVersion`.
- Define server reward catalog and milestone definitions.
- Add App Check configuration.
- Expand Firestore and Storage emulator tests.
- Preserve local storage as a temporary fallback.

Exit condition: reward amounts and milestone effects have one authoritative
definition.

### Phase 1: Auth and User Summary

- Add a dedicated Auth provider.
- Create `users/{userId}` on first authenticated session.
- Migrate profile and bounded progression summary.
- Keep existing arrays local during this phase.

Exit condition: every active user has a versioned Firestore summary.

### Phase 2: Projects and Tasks

- Migrate projects and tasks to requested subcollections.
- Add repositories and real-time query hooks.
- Introduce `completeTask` callable and progress event ledger.
- Stop granting project XP in React.

Exit condition: project task completion is transactional, idempotent, and
server-authoritative.

### Phase 3: Achievements and Milestones

- Move achievement state to its subcollection.
- Add declarative milestone engine.
- Migrate Studio, Observatory, and Avatar evolution triggers.
- Add correction-event tooling for beta support.

Exit condition: no UI handler directly unlocks an achievement or changes a
progression level.

### Phase 4: Journal and Storybook

- Migrate journal entries and chapters.
- Create chapters from accepted progress events.
- Add scheduled weekly chapter generation using user time zone.
- Keep user reflection fields editable.

Exit condition: Storybook chapters can be rebuilt or audited from events.

### Phase 5: Avatar Pipeline

- Keep the existing callable generator as the base.
- Separate upload and generated Storage paths.
- Add generation job state, App Check, entitlement checks, and transactional
  quota consumption.
- Add optional Storage-triggered derived assets with recursion guards.

Exit condition: avatar generation is resumable, quota-safe, and leaves no
provider secrets client-side.

### Phase 6: Beta Feedback, PWA, and Subscriptions

- Move beta feedback into a user subcollection and optional admin report index.
- Add PWA shell and offline UX.
- Add plans, subscriptions, entitlements, checkout callable, portal callable,
  and signed webhook.
- Gate premium capabilities through entitlements.

Exit condition: paid state is webhook-authoritative and premium limits are
enforced server-side.

### Phase 7: Retire Local Aggregate

- Run a one-time import from the local `DreamUser` aggregate.
- Compare migrated summaries and record counts.
- Remove local progression writes.
- Keep a time-limited rollback export path.

Exit condition: Firestore and Storage are the production source of truth.

## First Implementation Slice

The safest first vertical slice is project task completion:

1. Create project, task, progress-event, and user-summary schemas.
2. Add Firestore rules for owned project/task reads and restricted writes.
3. Add `completeTask` callable with Auth, App Check, validation, transaction,
   idempotency, reward lookup, and event append.
4. Update Creator Studio to call `completeTask`.
5. Subscribe to projects, tasks, and user summary.
6. Add emulator tests for duplicate calls, cross-user access, forged XP,
   already-completed tasks, and trigger effects.

This slice proves the architecture before migrating Storybook, achievements,
and avatar evolution.

## Explicit Non-Goals

- No HP, damage, combat, gold, equipment, loot, or critical-hit systems.
- No penalty for missed tasks.
- No opaque variable XP formulas.
- No paid XP multipliers.
- No direct copying of Habitica, Fireact, Loop, or example-app product
  concepts.
- No large binary payloads in Firestore.
- No client authority over progression or subscriptions.
