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
import { getDreamFrameFirebaseApp } from './firebaseApp'

export async function uploadAvatarSelfie({
  file,
}: {
  file: File
}): Promise<UploadedSelfieResult> {
  const app = getDreamFrameFirebaseApp()
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
  const app = getDreamFrameFirebaseApp()
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
