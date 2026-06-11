import { createHash } from 'node:crypto'
import {
  getFirestore,
  Timestamp,
  type DocumentData,
  type DocumentReference,
  type Transaction,
} from 'firebase-admin/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import {
  applyWorldStateEffect,
  createInitialWorldState,
  worldStateEventCatalog,
} from './engine.js'
import type {
  WorldState,
  WorldStateEvent,
  WorldStateEventType,
} from './types.js'

type ApplyWorldStateEventInput = {
  type: WorldStateEventType
  sourceId: string
}

type SourceContract = {
  path: (uid: string, sourceId: string) => string
  isComplete: (data: DocumentData, sourceId: string) => boolean
}

const sourceContracts: Record<WorldStateEventType, SourceContract> = {
  focus_session_completed: {
    path: (uid, sourceId) => `users/${uid}/focusSessions/${sourceId}`,
    isComplete: (data) => data.status === 'completed' || data.completed === true,
  },
  project_task_completed: {
    path: (uid, sourceId) => `users/${uid}/tasks/${sourceId}`,
    isComplete: (data) => data.status === 'completed' || data.completed === true,
  },
  project_milestone_completed: {
    path: (uid, sourceId) => {
      const [projectId] = sourceId.split(':')
      return `users/${uid}/projects/${projectId}`
    },
    isComplete: (data, sourceId) => {
      const [, milestoneId] = sourceId.split(':')
      return (
        Boolean(milestoneId) &&
        Array.isArray(data.completedMilestoneIds) &&
        data.completedMilestoneIds.includes(milestoneId)
      )
    },
  },
  project_completed: {
    path: (uid, sourceId) => `users/${uid}/projects/${sourceId}`,
    isComplete: (data) =>
      data.status === 'completed' || data.status === 'launched',
  },
  journal_entry_created: {
    path: (uid, sourceId) => `users/${uid}/journalEntries/${sourceId}`,
    isComplete: () => true,
  },
  daily_check_in_completed: {
    path: (uid, sourceId) => `users/${uid}/dailyCheckIns/${sourceId}`,
    isComplete: (data) => data.status === 'completed' || data.completed === true,
  },
  achievement_unlocked: {
    path: (uid, sourceId) => `users/${uid}/achievements/${sourceId}`,
    isComplete: (data) => data.status === 'unlocked' || data.unlocked === true,
  },
  storybook_chapter_created: {
    path: (uid, sourceId) => `users/${uid}/storybookChapters/${sourceId}`,
    isComplete: () => true,
  },
  monthly_reflection_completed: {
    path: (uid, sourceId) => `users/${uid}/monthlyReflections/${sourceId}`,
    isComplete: (data) => data.status === 'completed' || data.completed === true,
  },
}

function isWorldStateEventType(value: unknown): value is WorldStateEventType {
  return typeof value === 'string' && value in worldStateEventCatalog
}

function assertSourceId(value: unknown): asserts value is string {
  if (
    typeof value !== 'string' ||
    value.length < 1 ||
    value.length > 200 ||
    !/^[a-zA-Z0-9_:-]+$/.test(value)
  ) {
    throw new HttpsError('invalid-argument', 'A valid sourceId is required.')
  }
}

function eventId(uid: string, type: WorldStateEventType, sourceId: string) {
  return createHash('sha256')
    .update(`${uid}:${type}:${sourceId}`)
    .digest('hex')
}

async function assertVerifiedSource({
  transaction,
  sourceRef,
  sourceId,
  contract,
}: {
  transaction: Transaction
  sourceRef: DocumentReference
  sourceId: string
  contract: SourceContract
}) {
  const sourceSnapshot = await transaction.get(sourceRef)

  if (!sourceSnapshot.exists) {
    throw new HttpsError(
      'failed-precondition',
      'The source record must exist before World State can be updated.',
    )
  }

  if (!contract.isComplete(sourceSnapshot.data() ?? {}, sourceId)) {
    throw new HttpsError(
      'failed-precondition',
      'The source record does not prove this progression event is complete.',
    )
  }
}

export const applyWorldStateEvent = onCall(
  {
    invoker: 'public',
  },
  async (request) => {
    const uid = request.auth?.uid

    if (!uid) {
      throw new HttpsError(
        'unauthenticated',
        'Sign in before updating World State.',
      )
    }

    const data = request.data as Partial<ApplyWorldStateEventInput>

    if (!isWorldStateEventType(data.type)) {
      throw new HttpsError('invalid-argument', 'Invalid World State event type.')
    }

    assertSourceId(data.sourceId)
    const type = data.type
    const sourceId = data.sourceId

    const firestore = getFirestore()
    const contract = sourceContracts[type]
    const sourcePath = contract.path(uid, sourceId)
    const sourceRef = firestore.doc(sourcePath)
    const stateRef = firestore.doc(`users/${uid}/worldState/current`)
    const progressEventRef = firestore.doc(
      `users/${uid}/worldStateEvents/${eventId(uid, type, sourceId)}`,
    )

    return firestore.runTransaction(async (transaction) => {
      const existingEvent = await transaction.get(progressEventRef)

      if (existingEvent.exists) {
        const stateSnapshot = await transaction.get(stateRef)
        return {
          applied: false,
          worldState: stateSnapshot.data() as WorldState | undefined,
        }
      }

      await assertVerifiedSource({
        transaction,
        sourceRef,
        sourceId,
        contract,
      })

      const stateSnapshot = await transaction.get(stateRef)
      const now = Timestamp.now()
      const current = stateSnapshot.exists
        ? (stateSnapshot.data() as WorldState)
        : createInitialWorldState(now)
      const effect = worldStateEventCatalog[type]
      const next = applyWorldStateEffect({
        current,
        effect,
        eventType: type,
        occurredAt: now,
      })
      const progressEvent: WorldStateEvent = {
        schemaVersion: 1,
        type,
        sourceId,
        sourcePath,
        effect,
        createdAt: now,
      }

      transaction.set(stateRef, next)
      transaction.create(progressEventRef, progressEvent)

      return {
        applied: true,
        worldState: next,
      }
    })
  },
)
