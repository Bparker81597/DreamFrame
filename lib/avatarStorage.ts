import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  signInAnonymously,
} from 'firebase/auth'
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage'
import { getFunctions, httpsCallable } from 'firebase/functions'
import type {
  AvatarGenerateRequest,
  AvatarGenerateResponse,
  DreamFrameBetaAvatarType,
  DreamFrameCreatorType,
  GeneratedAvatarResult,
  UploadedSelfieResult,
} from '../types/avatar'

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp()
  }

  return initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  })
}

export async function uploadAvatarSelfie({
  file,
}: {
  file: File
}): Promise<UploadedSelfieResult> {
  const app = getFirebaseApp()
  const auth = getAuth(app)
  const currentUser = auth.currentUser ?? (await signInAnonymously(auth)).user
  const storage = getStorage(app)
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const storagePath = `users/${currentUser.uid}/avatar/selfies/${Date.now()}.${extension}`
  const storageRef = ref(storage, storagePath)

  await uploadBytes(storageRef, file, {
    contentType: file.type || 'image/jpeg',
    customMetadata: {
      purpose: 'dreamframe-avatar-selfie',
    },
  })

  return {
    storagePath,
    downloadUrl: await getDownloadURL(storageRef),
  }
}

export async function generateAvatarFromSelfie({
  avatarType,
  creatorType,
  selfieStoragePath,
  styleReferenceStoragePath,
}: {
  avatarType: DreamFrameBetaAvatarType
  creatorType: DreamFrameCreatorType
  selfieStoragePath: string
  styleReferenceStoragePath?: string
}): Promise<GeneratedAvatarResult> {
  const app = getFirebaseApp()
  const functions = getFunctions(app)
  const generateAvatar = httpsCallable<
    AvatarGenerateRequest,
    AvatarGenerateResponse
  >(functions, 'generateAvatar')

  const response = await generateAvatar({
    avatarType,
    selfieStoragePath,
    styleReferenceStoragePath,
    creatorType,
  })

  return response.data
}
