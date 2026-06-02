import type {
  DreamFrameAvatarType,
  DreamFrameBetaAvatarType,
  DreamFrameCreatorType,
} from '../types/avatar'

export const dreamFrameAvatarStyle = 'dreamframe_sketch_chibi' as const

export const betaAvatarTypes: DreamFrameBetaAvatarType[] = [
  'currentSelfAvatar',
  'chibiCompanionAvatar',
  'futureSelfAvatar',
]

export const avatarOutputFilenames: Record<DreamFrameAvatarType, string> = {
  currentSelfAvatar: 'currentSelfAvatar.png',
  chibiCompanionAvatar: 'chibiCompanionAvatar.png',
  futureSelfAvatar: 'futureSelfAvatar.png',
  focusModePose: 'focusModePose.png',
  journalModePose: 'journalModePose.png',
  celebrationPose: 'celebrationPose.png',
}

export const avatarTypeLabels: Record<DreamFrameBetaAvatarType, string> = {
  currentSelfAvatar: 'Current',
  chibiCompanionAvatar: 'Chibi',
  futureSelfAvatar: 'Future',
}

const baseStylePrompt = `
Generate a transparent PNG cutout in DreamFrame's signature avatar style.

Use the uploaded selfie for the user's facial features, skin tone, hairstyle,
outfit vibe, and overall personality. Use the uploaded style reference only for
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

const creatorTypeCopy: Record<DreamFrameCreatorType, string> = {
  app_builder: 'app builder with laptop, product-builder energy, and focused creator details',
  artist: 'visual artist with sketchbook, expressive style, and creative workspace details',
  music_creator: 'music creator with headphones, rhythm, and studio details',
  writer: 'writer with journal, notes, and reflective creator details',
  game_developer: 'game developer with laptop, playful game-world accents, and builder energy',
  entrepreneur: 'entrepreneur with launch-board confidence and polished creator details',
}

export function getAvatarPrompt(
  avatarType: DreamFrameAvatarType,
  creatorType: DreamFrameCreatorType = 'app_builder',
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
