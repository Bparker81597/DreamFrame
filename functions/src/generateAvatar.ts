import { randomUUID } from 'node:crypto'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { defineSecret } from 'firebase-functions/params'
import { HttpsError, onCall } from 'firebase-functions/v2/https'

initializeApp()

const openAIAPIKey = defineSecret('OPENAI_API_KEY')

type AvatarType =
  | 'currentSelfAvatar'
  | 'chibiCompanionAvatar'
  | 'futureSelfAvatar'

type CreatorType =
  | 'app_builder'
  | 'artist'
  | 'music_creator'
  | 'writer'
  | 'game_developer'
  | 'entrepreneur'

type GenerateAvatarInput = {
  avatarType: AvatarType
  selfieStoragePath: string
  styleReferenceStoragePath?: string
  creatorType?: CreatorType
}

type StorageImage = {
  buffer: Buffer
  contentType: string
  filename: string
}

type OpenAIImageEditPayload = {
  data?: Array<{
    b64_json?: string
  }>
}

type OpenAIErrorPayload = {
  error?: {
    message?: string
    code?: string
    type?: string
  }
}

const avatarOutputFilenames: Record<AvatarType, string> = {
  currentSelfAvatar: 'currentSelfAvatar.png',
  chibiCompanionAvatar: 'chibiCompanionAvatar.png',
  futureSelfAvatar: 'futureSelfAvatar.png',
}

const creatorTypeCopy: Record<CreatorType, string> = {
  app_builder: 'app builder with laptop, product-builder energy, focused creator details, and cozy tech lifestyle',
  artist: 'visual artist with sketchbook, expressive style, and creative workspace details',
  music_creator: 'music creator with headphones, rhythm, and studio details',
  writer: 'writer with journal, notes, and reflective creator details',
  game_developer: 'game developer with laptop, playful game-world accents, and builder energy',
  entrepreneur: 'entrepreneur with launch-board confidence and polished creator details',
}

const baseStylePrompt = `
Generate a transparent PNG cutout in DreamFrame's signature avatar style.

Use the uploaded selfie for the user's facial features, skin tone, hairstyle,
outfit vibe, and overall personality. Use any uploaded style reference only for
the hand-drawn character-art direction.

Style target:
- hand-drawn sketchbook anime/comic illustration
- expressive human face, not a generic mascot
- cozy creator fashion, black hoodie or streetwear when it matches the selfie
- soft warm shading
- visible black pencil/ink line texture
- slightly imperfect artistic lines
- no square box, no card background, no sticker border
- transparent background only

Do NOT create:
3D avatar, blocky body, cube body, flat corporate vector, Bitmoji style,
plastic sticker, square box background, thick sticker border, generic cartoon
mascot, fantasy costume, AI-glossy portrait, robotic avatar, emoji avatar, or
react-avatar/DiceBear-style SVG character.
`.trim()

function getAvatarPrompt(
  avatarType: AvatarType,
  creatorType: CreatorType = 'app_builder',
) {
  const creatorDirection = creatorTypeCopy[creatorType]

  if (avatarType === 'chibiCompanionAvatar') {
    return `
${baseStylePrompt}

Create a transparent PNG cutout of the user as a cute full-body chibi companion
avatar for DreamFrame.

Style:
hand-drawn sketchbook anime/comic illustration, oversized head, expressive brown
eyes, tiny body, cozy creator outfit, soft warm shading, visible black pencil/ink
line texture, slightly imperfect artistic lines, cute but still recognizable.

Pose:
sitting with a small laptop and coffee cup, cheerful and focused, like "mini me
building my dream world."

Preserve:
- warm brown skin tone
- long braid hairstyle when present in the selfie
- black hoodie/cozy streetwear vibe when present in the selfie
- soft facial expression
- creator energy

Creator identity:
${creatorDirection}.

Background:
transparent PNG cutout only.
`.trim()
  }

  if (avatarType === 'futureSelfAvatar') {
    return `
${baseStylePrompt}

Create a full-body future self avatar of the user. Make the person recognizable
from the selfie, with preserved skin tone, hairstyle, face shape, and core outfit
vibe, but evolved into a more confident DreamFrame creator self.

Style:
semi-realistic sketchbook anime/comic character art, expressive eyes, fashionable
cozy creator outfit, subtle luxury/future-self details, stronger posture, warm
growth energy, visible black pencil/ink texture.

Pose:
standing or lightly angled with confident calm energy, as if ready to build their
next world.

Creator identity:
${creatorDirection}.

Background:
transparent PNG cutout only.
`.trim()
  }

  return `
${baseStylePrompt}

Create a full-body current self avatar of the user. Make the person recognizable
from the selfie, preserving facial features, warm brown skin tone, hairstyle,
outfit vibe, and personality.

Style:
semi-realistic sketchbook anime/comic illustration, expressive hand-drawn face,
cozy creator outfit, soft warm shading, visible black pencil/ink texture, fashion
sketch energy.

Pose:
relaxed full-body creator pose with natural confidence, suitable for sitting
inside Creator Studio, Growth Garden, Journal Corner, and Future Self Observatory.

Creator identity:
${creatorDirection}.

Background:
transparent PNG cutout only.
`.trim()
}

function isAvatarType(value: unknown): value is AvatarType {
  return (
    value === 'currentSelfAvatar' ||
    value === 'chibiCompanionAvatar' ||
    value === 'futureSelfAvatar'
  )
}

function isCreatorType(value: unknown): value is CreatorType {
  return (
    value === 'app_builder' ||
    value === 'artist' ||
    value === 'music_creator' ||
    value === 'writer' ||
    value === 'game_developer' ||
    value === 'entrepreneur'
  )
}

function assertUserStoragePath(uid: string, storagePath: string) {
  if (!storagePath.startsWith(`users/${uid}/avatar/`)) {
    throw new HttpsError(
      'permission-denied',
      'Avatar source images must live under the authenticated user avatar path.',
    )
  }
}

async function readStorageImage(storagePath: string): Promise<StorageImage> {
  const bucket = getStorage().bucket()
  const file = bucket.file(storagePath)
  const [exists] = await file.exists()

  if (!exists) {
    throw new HttpsError('not-found', `Storage image not found: ${storagePath}`)
  }

  const [metadata] = await file.getMetadata()
  const [buffer] = await file.download()

  return {
    buffer,
    contentType: metadata.contentType ?? 'image/png',
    filename: storagePath.split('/').pop() ?? 'selfie.png',
  }
}

function blobFromBuffer(buffer: Buffer, contentType: string) {
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer

  return new Blob([arrayBuffer], { type: contentType })
}

async function callOpenAIImageGeneration({
  apiKey,
  prompt,
  selfieImage,
  styleReferenceImage,
}: {
  apiKey: string
  prompt: string
  selfieImage: StorageImage
  styleReferenceImage?: StorageImage
}) {
  const body = new FormData()
  body.append('model', 'gpt-image-1')
  body.append('prompt', prompt)
  body.append('background', 'transparent')
  body.append('output_format', 'png')
  body.append('quality', 'high')
  body.append('size', '1024x1024')
  body.append(
    'image[]',
    blobFromBuffer(selfieImage.buffer, selfieImage.contentType),
    selfieImage.filename,
  )

  if (styleReferenceImage) {
    body.append(
      'image[]',
      blobFromBuffer(styleReferenceImage.buffer, styleReferenceImage.contentType),
      styleReferenceImage.filename,
    )
  }

  const response = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
    },
    body,
  })

  if (!response.ok) {
    const detail = await response.text()
    let message = 'OpenAI avatar generation failed.'
    let code: HttpsError['code'] = 'internal'

    try {
      const parsed = JSON.parse(detail) as OpenAIErrorPayload
      const openAIError = parsed.error

      if (
        openAIError?.code === 'billing_hard_limit_reached' ||
        openAIError?.type === 'billing_limit_user_error'
      ) {
        message =
          'OpenAI billing limit reached. Increase the OpenAI project budget or add billing capacity, then try generating again.'
        code = 'resource-exhausted'
      } else if (openAIError?.message) {
        message = `OpenAI avatar generation failed: ${openAIError.message}`
      }
    } catch {
      message = `OpenAI avatar generation failed: ${detail}`
    }

    throw new HttpsError(code, message)
  }

  const payload = (await response.json()) as OpenAIImageEditPayload
  const imageOutput = payload.data?.find((output) => output.b64_json)

  if (!imageOutput?.b64_json) {
    throw new HttpsError('internal', 'OpenAI did not return an image result.')
  }

  return Buffer.from(imageOutput.b64_json, 'base64')
}

async function uploadGeneratedAvatar({
  uid,
  avatarType,
  pngBuffer,
}: {
  uid: string
  avatarType: AvatarType
  pngBuffer: Buffer
}) {
  const bucket = getStorage().bucket()
  const token = randomUUID()
  const filename = avatarOutputFilenames[avatarType]
  const storagePath = `users/${uid}/avatar/${filename}`
  const file = bucket.file(storagePath)

  await file.save(pngBuffer, {
    contentType: 'image/png',
    resumable: false,
    metadata: {
      metadata: {
        firebaseStorageDownloadTokens: token,
        avatarType,
        style: 'dreamframe_sketch_chibi',
      },
    },
  })

  return {
    storagePath,
    downloadUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`,
  }
}

export const generateAvatar = onCall(
  {
    secrets: [openAIAPIKey],
    invoker: 'public',
    timeoutSeconds: 300,
    memory: '1GiB',
  },
  async (request) => {
    const uid = request.auth?.uid

    if (!uid) {
      throw new HttpsError('unauthenticated', 'Sign in before generating an avatar.')
    }

    const data = request.data as Partial<GenerateAvatarInput>

    if (!isAvatarType(data.avatarType)) {
      throw new HttpsError('invalid-argument', 'Invalid beta avatar type.')
    }

    if (!data.selfieStoragePath) {
      throw new HttpsError('invalid-argument', 'selfieStoragePath is required.')
    }

    assertUserStoragePath(uid, data.selfieStoragePath)

    if (data.styleReferenceStoragePath) {
      assertUserStoragePath(uid, data.styleReferenceStoragePath)
    }

    const creatorType = isCreatorType(data.creatorType)
      ? data.creatorType
      : 'app_builder'
    const firestore = getFirestore()
    const avatarDocRef = firestore.doc(`users/${uid}/avatar/main`)
    const avatarUrlField = `${data.avatarType}Url`

    await avatarDocRef.set(
      {
        style: 'dreamframe_sketch_chibi',
        creatorType,
        generatedAt: Timestamp.now(),
        status: 'pending',
      },
      { merge: true },
    )

    try {
      const selfieImage = await readStorageImage(data.selfieStoragePath)
      const styleReferenceImage = data.styleReferenceStoragePath
        ? await readStorageImage(data.styleReferenceStoragePath)
        : undefined
      const pngBuffer = await callOpenAIImageGeneration({
        apiKey: openAIAPIKey.value(),
        prompt: getAvatarPrompt(data.avatarType, creatorType),
        selfieImage,
        styleReferenceImage,
      })
      const generated = await uploadGeneratedAvatar({
        uid,
        avatarType: data.avatarType,
        pngBuffer,
      })

      await avatarDocRef.set(
        {
          [avatarUrlField]: generated.downloadUrl,
          style: 'dreamframe_sketch_chibi',
          creatorType,
          generatedAt: Timestamp.now(),
          status: 'complete',
        },
        { merge: true },
      )

      return {
        avatarType: data.avatarType,
        avatarUrl: generated.downloadUrl,
        storagePath: generated.storagePath,
      }
    } catch (error) {
      await avatarDocRef.set(
        {
          style: 'dreamframe_sketch_chibi',
          creatorType,
          generatedAt: Timestamp.now(),
          status: 'failed',
        },
        { merge: true },
      )

      throw error
    }
  },
)
