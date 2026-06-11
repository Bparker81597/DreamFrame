import { getAuth, signInAnonymously } from 'firebase/auth'
import { doc, getFirestore, onSnapshot, type Unsubscribe } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import type {
  ApplyWorldStateEventResponse,
  WorldState,
  WorldStateEventType,
} from '../types/worldState'
import { getDreamFrameFirebaseApp } from './firebaseApp'

async function getAuthenticatedUserId() {
  const auth = getAuth(getDreamFrameFirebaseApp())
  const user = auth.currentUser ?? (await signInAnonymously(auth)).user

  return user.uid
}

export async function applyWorldStateEvent({
  sourceId,
  type,
}: {
  sourceId: string
  type: WorldStateEventType
}) {
  const app = getDreamFrameFirebaseApp()
  await getAuthenticatedUserId()
  const callable = httpsCallable<
    { sourceId: string; type: WorldStateEventType },
    ApplyWorldStateEventResponse
  >(getFunctions(app), 'applyWorldStateEvent')

  return (await callable({ sourceId, type })).data
}

export async function ensureWorldState() {
  const app = getDreamFrameFirebaseApp()
  await getAuthenticatedUserId()
  const callable = httpsCallable<Record<string, never>, WorldState>(
    getFunctions(app),
    'ensureWorldState',
  )

  return (await callable({})).data
}

export async function subscribeToWorldState(
  onState: (worldState: WorldState | null) => void,
  onError?: (error: Error) => void,
): Promise<Unsubscribe> {
  const app = getDreamFrameFirebaseApp()
  const uid = await getAuthenticatedUserId()
  await ensureWorldState()
  const stateRef = doc(getFirestore(app), `users/${uid}/worldState/current`)

  return onSnapshot(
    stateRef,
    (snapshot) => {
      onState(snapshot.exists() ? (snapshot.data() as WorldState) : null)
    },
    (error) => onError?.(error),
  )
}
