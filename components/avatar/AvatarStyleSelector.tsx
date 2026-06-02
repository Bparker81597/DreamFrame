import {
  avatarTypeLabels,
  betaAvatarTypes,
} from '../../lib/avatarPrompts'
import type { DreamFrameBetaAvatarType } from '../../types/avatar'

export function AvatarStyleSelector({
  selectedType,
  onSelectType,
}: {
  selectedType: DreamFrameBetaAvatarType
  onSelectType: (avatarType: DreamFrameBetaAvatarType) => void
}) {
  return (
    <div className="avatar-state-switcher" aria-label="Choose avatar type">
      {betaAvatarTypes.map((avatarType) => (
        <button
          className={selectedType === avatarType ? 'selected' : ''}
          key={avatarType}
          onClick={() => onSelectType(avatarType)}
          type="button"
        >
          {avatarTypeLabels[avatarType]}
        </button>
      ))}
    </div>
  )
}
