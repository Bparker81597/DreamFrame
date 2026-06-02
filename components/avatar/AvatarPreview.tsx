export function AvatarPreview({
  imageUrl,
  isLoading,
}: {
  imageUrl: string | null
  isLoading: boolean
}) {
  return (
    <div className="avatar-card-stage" aria-live="polite">
      {isLoading ? (
        <strong>Drawing your DreamSelf...</strong>
      ) : imageUrl ? (
        <img
          alt="Generated DreamFrame avatar"
          className="generated-avatar-cutout"
          src={imageUrl}
        />
      ) : (
        <span>Upload a selfie to generate your DreamFrame avatar.</span>
      )}
    </div>
  )
}
