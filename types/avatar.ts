export type DreamFrameAvatarType =
  | 'currentSelfAvatar'
  | 'chibiCompanionAvatar'
  | 'futureSelfAvatar'
  | 'focusModePose'
  | 'journalModePose'
  | 'celebrationPose'

export type DreamFrameBetaAvatarType = Extract<
  DreamFrameAvatarType,
  'currentSelfAvatar' | 'chibiCompanionAvatar' | 'futureSelfAvatar'
>

export type DreamFrameAvatarStyle = 'dreamframe_sketch_chibi'

export type DreamFrameCreatorType =
  | 'app_builder'
  | 'artist'
  | 'music_creator'
  | 'writer'
  | 'game_developer'
  | 'entrepreneur'

export type AvatarGenerationStatus = 'pending' | 'complete' | 'failed'

export type FirestoreAvatarMainDocument = {
  currentSelfAvatarUrl: string | null
  chibiCompanionAvatarUrl: string | null
  futureSelfAvatarUrl: string | null
  style: DreamFrameAvatarStyle
  creatorType: DreamFrameCreatorType
  generatedAt: unknown
  status: AvatarGenerationStatus
}

export type AvatarGenerateRequest = {
  avatarType: DreamFrameBetaAvatarType
  selfieStoragePath: string
  styleReferenceStoragePath?: string
  creatorType?: DreamFrameCreatorType
}

export type AvatarGenerateResponse = {
  avatarType: DreamFrameBetaAvatarType
  avatarUrl: string
  storagePath: string
}

export type UploadedSelfieResult = {
  storagePath: string
  downloadUrl: string
}

export type GeneratedAvatarResult = {
  avatarType: DreamFrameBetaAvatarType
  avatarUrl: string
  storagePath: string
}
