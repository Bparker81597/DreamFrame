# DreamFrame World State Engine

World State is the single server-authoritative progression projection for
DreamFrame.

## Firestore Source of Truth

```text
users/{userId}/worldState/current
users/{userId}/worldStateEvents/{eventId}
```

`current` is the bounded state consumed by Creator Studio, Avatar Evolution,
Storybook Chapters, Future Self, and Monthly Reflections.

`worldStateEvents` is an immutable ledger. Its deterministic event IDs prevent
the same source action from granting progress twice.

Clients may read both paths but cannot write either path directly.

## Centralized State

World State owns:

- XP totals and categories
- Creator Level
- Momentum score and level
- Reflection score, level, and entry count
- Consistency score, level, and streaks
- Studio Progress score, level, and completion counters
- Achievement Count
- Storybook Progress score, level, and chapter count

No feature should calculate or persist its own copy of these values.

## Update Contract

The `applyWorldStateEvent` callable accepts:

```ts
{
  type: WorldStateEventType
  sourceId: string
}
```

The function:

1. Derives the user from Firebase Auth.
2. Validates the event type and source ID.
3. Verifies that the owned source document exists and proves completion.
4. Resolves XP and progress effects from the server-owned event catalog.
5. Uses a deterministic event ID for idempotency.
6. Updates World State and creates the ledger event in one transaction.

Clients cannot submit XP values, levels, counters, or unlock effects.

## Source Contracts

| Event | Verified source |
| --- | --- |
| `focus_session_completed` | `users/{uid}/focusSessions/{sourceId}` |
| `project_task_completed` | `users/{uid}/tasks/{sourceId}` |
| `project_milestone_completed` | Project `completedMilestoneIds` |
| `project_completed` | `users/{uid}/projects/{sourceId}` |
| `journal_entry_created` | `users/{uid}/journalEntries/{sourceId}` |
| `daily_check_in_completed` | `users/{uid}/dailyCheckIns/{sourceId}` |
| `achievement_unlocked` | `users/{uid}/achievements/{sourceId}` |
| `storybook_chapter_created` | `users/{uid}/storybookChapters/{sourceId}` |
| `monthly_reflection_completed` | `users/{uid}/monthlyReflections/{sourceId}` |

Source documents must be created or completed by their owning server-side
feature command before applying the corresponding World State event.

## Feature Integration

Feature Cloud Functions should:

1. Validate and update their source document.
2. Apply the matching World State event in the same transaction or invoke the
   shared engine immediately afterward with idempotency.
3. Return updated World State to the client.

Frontend systems consume `subscribeToWorldState` from `lib/worldState.ts`.
They should render World State and stop deriving progression from local arrays
as each feature migrates to Firestore.

`ensureWorldState` creates the initial Firestore projection idempotently before
the first subscription or progression event.

## Files

- `functions/src/worldState/types.ts`: authoritative backend contract
- `functions/src/worldState/engine.ts`: pure progression reducer and reward catalog
- `functions/src/worldState/applyWorldStateEvent.ts`: Auth, source verification,
  idempotency, and Firestore transaction
- `functions/src/worldState/ensureWorldState.ts`: idempotent initial projection
- `types/worldState.ts`: frontend read contract
- `lib/worldState.ts`: frontend subscription and callable command service
- `firestore.rules`: read-only client access to progression authority
