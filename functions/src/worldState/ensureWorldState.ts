import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { createInitialWorldState } from './engine.js'
import type { WorldState } from './types.js'

export const ensureWorldState = onCall(
  {
    invoker: 'public',
  },
  async (request) => {
    const uid = request.auth?.uid

    if (!uid) {
      throw new HttpsError(
        'unauthenticated',
        'Sign in before loading World State.',
      )
    }

    const stateRef = getFirestore().doc(`users/${uid}/worldState/current`)

    return getFirestore().runTransaction(async (transaction) => {
      const snapshot = await transaction.get(stateRef)

      if (snapshot.exists) {
        return snapshot.data() as WorldState
      }

      const initialState = createInitialWorldState(Timestamp.now())
      transaction.create(stateRef, initialState)

      return initialState
    })
  },
)

