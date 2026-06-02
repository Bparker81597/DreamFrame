import { useState } from 'react'
import { AvatarPreview } from './AvatarPreview'
import { AvatarStyleSelector } from './AvatarStyleSelector'
import {
  generateAvatarFromSelfie,
  uploadAvatarSelfie,
} from '../../lib/avatarStorage'
import type {
  DreamFrameBetaAvatarType,
  DreamFrameCreatorType,
  GeneratedAvatarResult,
} from '../../types/avatar'

function getAvatarErrorMessage(caughtError: unknown) {
  const message =
    caughtError instanceof Error ? caughtError.message : 'Avatar generation failed.'

  if (
    message.includes('billing_hard_limit_reached') ||
    message.toLowerCase().includes('billing limit') ||
    message.toLowerCase().includes('billing hard limit')
  ) {
    return 'OpenAI billing limit reached. Increase the OpenAI project budget or add billing capacity, then try generating again.'
  }

  if (message.toLowerCase().includes('unauthenticated')) {
    return 'Sign in before generating an avatar.'
  }

  return message
}

function getDemoAvatarUrl() {
  return `${import.meta.env.BASE_URL}generated/chibiCompanionAvatar.png`
}

export function AvatarGenerator({
  creatorType = 'app_builder',
  generationLimit,
  generationRemaining,
  onGenerated,
  onGenerationAttempt,
  onGenerationError,
  styleReferenceStoragePath,
}: {
  creatorType?: DreamFrameCreatorType
  generationLimit?: number
  generationRemaining?: number
  onGenerated?: (result: GeneratedAvatarResult) => void
  onGenerationAttempt?: () => boolean
  onGenerationError?: (message: string) => void
  styleReferenceStoragePath?: string
}) {
  const [avatarType, setAvatarType] =
    useState<DreamFrameBetaAvatarType>('chibiCompanionAvatar')
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  function handlePreviewDemoAvatar() {
    const avatarUrl = getDemoAvatarUrl()

    setError(null)
    setIsGenerating(false)
    setPreviewUrl(avatarUrl)
    onGenerated?.({
      avatarType,
      avatarUrl,
      storagePath: 'public/generated/chibiCompanionAvatar.png',
    })
  }

  async function handleGenerateAvatar() {
    if (!selfieFile) {
      setError('Upload a selfie first.')
      return
    }

    if (onGenerationAttempt && !onGenerationAttempt()) {
      setError('Beta generation limit reached for today. Use Preview Demo Avatar or reset the limit in Beta Tools.')
      return
    }

    setError(null)
    setIsGenerating(true)

    try {
      const uploadedSelfie = await uploadAvatarSelfie({
        file: selfieFile,
      })
      const generated = await generateAvatarFromSelfie({
        avatarType,
        creatorType,
        selfieStoragePath: uploadedSelfie.storagePath,
        styleReferenceStoragePath,
      })

      setPreviewUrl(generated.avatarUrl)
      onGenerated?.(generated)
    } catch (caughtError) {
      const message = getAvatarErrorMessage(caughtError)

      setError(message)
      onGenerationError?.(message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <section className="avatar-display-card" aria-label="DreamFrame avatar generator">
      <div className="section-heading-row">
        <div>
          <p className="page-kicker">Avatar Generator</p>
          <h3>Draw your DreamSelf.</h3>
        </div>
        <span>
          {typeof generationRemaining === 'number' && typeof generationLimit === 'number'
            ? `${generationRemaining}/${generationLimit} beta generations`
            : 'transparent PNG'}
        </span>
      </div>

      <label className="avatar-file-input">
        <span>Upload selfie</span>
        <input
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0]

            if (file) {
              setSelfieFile(file)
            }
          }}
          type="file"
        />
      </label>

      <AvatarStyleSelector
        selectedType={avatarType}
        onSelectType={setAvatarType}
      />

      <button
        className="glow-button"
        disabled={!selfieFile || isGenerating || generationRemaining === 0}
        onClick={handleGenerateAvatar}
        type="button"
      >
        <span className="material-symbols-outlined">auto_fix_high</span>
        {isGenerating ? 'Drawing your DreamSelf...' : 'Generate Avatar'}
      </button>

      <button
        className="secondary-button inline-action"
        disabled={isGenerating}
        onClick={handlePreviewDemoAvatar}
        type="button"
      >
        <span className="material-symbols-outlined">visibility</span>
        Preview Demo Avatar
      </button>

      {error && <p className="avatar-error">{error}</p>}

      <AvatarPreview imageUrl={previewUrl} isLoading={isGenerating} />
    </section>
  )
}
