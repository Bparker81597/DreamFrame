import { motion } from 'framer-motion'
import type { CompanionMessage } from '../models/dreamUser'

export function WorldLocationCard({
  title,
  status,
  icon,
  onClick,
}: {
  title: string
  status: string
  icon: string
  onClick?: () => void
}) {
  const Component = onClick ? motion.button : motion.div

  return (
    <Component
      className={`world-location-card ${onClick ? 'active-location' : 'coming-soon'}`}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={onClick ? { y: -8, scale: 1.025 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <strong>{title}</strong>
      <small>{status}</small>
    </Component>
  )
}

export function GrowthHabitCard({
  title,
  effect,
  icon,
  onComplete,
}: {
  title: string
  effect: string
  icon: string
  onComplete: () => void
}) {
  return (
    <motion.button
      className="growth-habit-card"
      onClick={onComplete}
      type="button"
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <strong>{title}</strong>
      <small>{effect}</small>
    </motion.button>
  )
}

export function CompanionMessageCard({
  message,
}: {
  message: CompanionMessage
}) {
  return (
    <motion.article
      className="companion-message-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <span>DreamFrame Companion</span>
      <p>{message.message}</p>
      <small>{message.location.replaceAll('_', ' ')}</small>
    </motion.article>
  )
}

export function ProgressTimeline({
  currentLevel,
}: {
  currentLevel: number
}) {
  const milestones = [
    'Dream begins',
    'Studio awakens',
    'Garden grows',
    'Future self clarifies',
    'World expands',
  ]

  return (
    <div className="progress-timeline">
      {milestones.map((milestone, index) => {
        const level = index + 1

        return (
          <motion.div
            className={currentLevel >= level ? 'active' : ''}
            key={milestone}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <span>Level {level}</span>
            <strong>{milestone}</strong>
          </motion.div>
        )
      })}
    </div>
  )
}

export function EraBadge({
  name,
  status,
}: {
  name: string
  status: string
}) {
  return (
    <span className={`era-badge ${status === 'active' ? 'active' : ''}`}>
      {name} / {status.replace('_', ' ')}
    </span>
  )
}

export function XPBar({
  label,
  value,
  max = 120,
}: {
  label: string
  value: number
  max?: number
}) {
  const progress = Math.min(100, Math.round((value / max) * 100))

  return (
    <div className="xp-bar">
      <div>
        <span>{label}</span>
        <strong>{value} XP</strong>
      </div>
      <span className="xp-track">
        <motion.span
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </span>
    </div>
  )
}
