import { useEffect, useState, type CSSProperties, type MouseEvent } from 'react'
import type { DreamUser, DreamUserUpdate } from './models/dreamUser'
import { applyFirstUpgrade, getLevel, xpRewards } from './models/progression'
import { loadDreamUser, saveDreamUser } from './storage/dreamUserStorage'
import './App.css'

type Era = {
  title: string
  description: string
  image: string
  alt: string
}

type Tab = 'Home' | 'DreamFrame' | 'World' | 'Journal' | 'Me'

const eras: Era[] = [
  {
    title: 'Healing Era',
    description: 'Soft florals, gentle mornings, and radical peace.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBtyd1f-1G-7vBqiiYP5OdkR4joEcRBWkbKLhe4zVnMeDs3xSNXB6scAt3miDClfTsAdGeGgOJnG4cdf1ajEG6S22k4AqmVfVsTeSv_O6Quzi2m0FKwZi9QTI2Gq0TugC_AdUPGjDCFXciWgd8hgE50wRRSacwj6U579sQalbXs7PGkkNy2buZx3nzAe0VZCcjU-Hkq7UBwgEHS9ETEySOIGv_q7sat0fTM6R7eDtDs028QiI-pBGKg0VQMFkDwRv6pq16KZDKrn9o',
    alt: 'Pastel peonies and wildflowers in soft morning light.',
  },
  {
    title: 'Creator Era',
    description: 'Modern tech meets timeless art. Expression is key.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBnqYfG_Xqz0J8WPQwjVt_EZTOPeEW0FaYDAuWfLOtkY1AOIKrSaHGQKOst8VhlPuoKZ6HDpS_-TJAbJWLvMytsnq4ewcB1snGKXBPfDAaD_eSOiQdi8giFk9Kv_JHcJ9AVxQWEpc7zzlH-elwj_S-3NYDnksd_EnNQhsa5uU1g7Y0Wo5PJVNZlK6BPOmvbbTveUjpHydd4HC4foyfLYef516xPEsSpWk1XoFBefcF_WQZICi-lm1D6etQG5zrjJ3ApcyDrEUA3i8w',
    alt: 'A cinematic creative workspace with a glowing tablet and tools.',
  },
  {
    title: 'Glow Up Era',
    description: 'Sparkles, luxury, and the best version of you.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCY6rlOzTFiuNHkk4ETSd84hiTosIm-OsoFmxNHTXKWuiejdGGjdSLT8zZ1ryhQEMngQWaDOLu4rRD0E36qmUwpXDj6hbp5D9E7XfjBawD-3pE-wocU8VazyPKwGmSw6m2oHD1p-Hsy_f5JVCGYMJPjYJU0cm5ZVgrnGmXpHA9Mdp38txxdYKL26OT-4bkeP917lClGwurRyWtcKRyG8cft4Er0G5BA_m2g1iMVM_WQKLugPojPDrdlzDsSSxSuGYSIqwVOGTJd06Y',
    alt: 'Luxury jewelry, skincare bottles, and shimmering fabric.',
  },
  {
    title: 'Soft Life Era',
    description: 'Beige linens, slow coffee, and zero-stress days.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCAL7Hd-IjX8NSLZAMafH_njjBjSJRFqWQstkjzFNhn7iJVg-iyYGjIzqQ20M_B7B5pPa8LSZMtsMChKjB1_Z89vNVwkKh1_BcJ5erd-0RG0s1k8Ivz8pAd7B6RFg6VPwDNYgq6oyEtmnNa5TD2vD7a21ghpjxxhQYhP9pWf_V81R1hY6ioKKGi-fRvSxfeVVKnb6r83L4koB0YW0royYMJSHU7HkJpM0DRt2Q7Plv6GPWF6piXUKYhapxbCDYMyU-dnmXDND2g7SE',
    alt: 'A serene interior with linens, ceramics, and tea.',
  },
  {
    title: 'Adventure Era',
    description: 'Wild nature, crisp air, and unknown horizons.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC9qWPJjYxZZlcJlgNBOtrtaYhU_mkloEQ--B2BOMi5FIyj-0n9fS5y1NtGAUPsOwUycuH7jTgLNYW5nUO5dl-tRJDPh2sS0Hp59kbSFA1ByWcrr9sIY58FTNudqb5QyK4tj2MdHdprB5WKNamkpazISiZLChhMlFY0-SPRuYDb5exo0R5HVoVoNVGZgQP-g_D7Yk7QmPdmv5KhgsDsVyeWMljfy8IfOm8yVuQpruUAtzt9s4beqPwthlSagXmJIrFUen-wgByzNtc',
    alt: 'A majestic mountain landscape at dawn.',
  },
  {
    title: 'Leadership Era',
    description: 'Stately spaces, strong visions, and steady hands.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDwisk9QL64OvQ2omPb6PpXtiNkWVnIaD7HN2drqQsd_5v3yaCAocqaNrLEBZVicJKz8PYYqu8hvK0eG-o4ZKVd2WgaEgj2MMioPSlivnEaM_pfVkIhrQ8eO7qBOIoUlk-i4_HQ9hV26wkBGCACj4z-JETAChEMWdftB0O9A1bpOrnV-SfGCEgKi6gmGgZ9vyCw8PCaCNgDOh97xUbYkDwzpcczd8mIfO2i0rmG_w5ToUL-YYichwbS8ObFYZM5pO3PWzfCLu19z6E',
    alt: 'A modern architectural interior with dark wood and leather.',
  },
]

const navItems: Array<[string, Tab]> = [
  ['home', 'Home'],
  ['filter_frames', 'DreamFrame'],
  ['public', 'World'],
  ['auto_stories', 'Journal'],
  ['person', 'Me'],
]

const hubCards: Array<[Tab, string, string, string]> = [
  ['DreamFrame', 'filter_frames', 'Choose Era', 'Pick the energy for your next chapter.'],
  ['World', 'public', 'Build World', 'See the environment forming around your choice.'],
  ['Journal', 'auto_stories', 'Write Ritual', 'Capture thoughts, prompts, and reflections.'],
  ['Me', 'person', 'Profile', 'Keep your identity, goals, and progress close.'],
]

const tabSlugs: Record<Tab, string> = {
  Home: 'home',
  DreamFrame: 'dreamframe',
  World: 'world',
  Journal: 'journal',
  Me: 'me',
}

const slugTabs = Object.fromEntries(
  Object.entries(tabSlugs).map(([tab, slug]) => [slug, tab]),
) as Record<string, Tab>

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')

function getPathForTab(tab: Tab) {
  return `${basePath}/${tabSlugs[tab]}`
}

function getTabFromPath(pathname: string): Tab {
  const fallbackPath = basePath || ''
  const trimmedPath = pathname.replace(/\/$/, '')

  if (trimmedPath === fallbackPath) {
    return 'Home'
  }

  const slug = trimmedPath.replace(`${fallbackPath}/`, '').split('/')[0]

  return slugTabs[slug] ?? 'Home'
}

function App() {
  const [user, setUser] = useState<DreamUser>(loadDreamUser)
  const [journalDraft, setJournalDraft] = useState('')
  const [ritualPulse, setRitualPulse] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>(() =>
    getTabFromPath(window.location.pathname),
  )

  useEffect(() => {
    saveDreamUser(user)
  }, [user])

  useEffect(() => {
    function syncRoute() {
      setActiveTab(getTabFromPath(window.location.pathname))
      window.scrollTo({ top: 0 })
    }

    window.addEventListener('popstate', syncRoute)

    return () => window.removeEventListener('popstate', syncRoute)
  }, [])

  function selectEra(title: string) {
    setUser((currentUser) => ({ ...currentUser, currentEra: title }))
    setRitualPulse(true)
    window.setTimeout(() => setRitualPulse(false), 900)
  }

  function updateUser(updater: DreamUserUpdate) {
    setUser((currentUser) => applyFirstUpgrade(updater(currentUser)))
    setRitualPulse(true)
    window.setTimeout(() => setRitualPulse(false), 900)
  }

  function completeReflection() {
    updateUser((currentUser) => ({
      ...currentUser,
      reflectionXP: currentUser.reflectionXP + xpRewards.complete_reflection,
      firstReflectionComplete: true,
    }))
    setJournalDraft('')
  }

  function completeFocusSession() {
    updateUser((currentUser) => ({
      ...currentUser,
      creatorXP: currentUser.creatorXP + xpRewards.complete_focus_session,
      firstFocusSessionComplete: true,
    }))
  }

  function completeGoal() {
    updateUser((currentUser) => ({
      ...currentUser,
      growthXP: currentUser.growthXP + xpRewards.complete_goal,
      firstGoalComplete: true,
    }))
  }

  function completeHabit() {
    updateUser((currentUser) => ({
      ...currentUser,
      wellnessXP: currentUser.wellnessXP + xpRewards.complete_habit,
    }))
  }

  function navigate(tab: Tab, event?: MouseEvent<HTMLAnchorElement>) {
    event?.preventDefault()
    setActiveTab(tab)
    window.history.pushState({}, '', getPathForTab(tab))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={`dreamframe-shell ${ritualPulse ? 'ritual-pulse' : ''}`}>
      <header className="top-nav">
        <button
          className="brand-lockup"
          onClick={() => navigate('Home')}
          type="button"
          aria-label="Open Home"
        >
          <div className="avatar">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMKZSj0Ie-rSmRP0OdXbDGY1wOElkuqBlmMj0Y0sUU-E5rlSw-LKDiynosWKSlBDtEHV4utC70pyFd9Nr20KpGh61xMcNte_kJC1Z86znUlMRPuk4IRiQ1Up9AT0PJmcaKo9k_i-FHEg72MTAJdu7ExRHlrGpA_0UXho9wDoDvDINVLv7LGC27-mzEQCiluuM4xcsF-AWFindYC6TdSr8tWAtN-mp6YhiAR1Do1XssLpG3n6lzKSs6JuYqZnKqinpPCw_Dv2YEp-0"
              alt="DreamFrame profile"
            />
          </div>
          <h1>DreamFrame</h1>
        </button>
        <button className="icon-button" type="button" aria-label="Settings">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </header>

      <main className="main-canvas">
        {activeTab === 'Home' && (
          <HomePage user={user} onNavigate={navigate} />
        )}
        {activeTab === 'DreamFrame' && (
          <DreamFramePage
            user={user}
            onSelectEra={selectEra}
            onCompleteFocusSession={completeFocusSession}
            onCompleteGoal={completeGoal}
          />
        )}
        {activeTab === 'World' && (
          <WorldPage user={user} onNavigate={navigate} />
        )}
        {activeTab === 'Journal' && (
          <JournalPage
            user={user}
            journalDraft={journalDraft}
            onJournalDraftChange={setJournalDraft}
            onCompleteReflection={completeReflection}
            onNavigate={navigate}
          />
        )}
        {activeTab === 'Me' && (
          <MePage user={user} onCompleteHabit={completeHabit} onNavigate={navigate} />
        )}
      </main>

      <nav className="bottom-nav" aria-label="Primary navigation">
        {navItems.map(([icon, label]) => (
          <a
            className={label === activeTab ? 'active' : ''}
            href={getPathForTab(label)}
            key={label}
            onClick={(event) => navigate(label, event)}
            aria-current={label === activeTab ? 'page' : undefined}
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span>{label}</span>
          </a>
        ))}
      </nav>
    </div>
  )
}

function HomePage({
  user,
  onNavigate,
}: {
  user: DreamUser
  onNavigate: (tab: Tab) => void
}) {
  const completedFirstQuests = [
    user.firstReflectionComplete,
    user.firstFocusSessionComplete,
    user.firstGoalComplete,
  ].filter(Boolean).length

  return (
    <section className="page-view home-view">
      <div className="intro-panel">
        <p className="page-kicker">Home</p>
        <h2>Your DreamFrame hub</h2>
        <p>
          Start from one place, then move into the frame, world, journal, or
          profile without losing the era you chose.
        </p>
      </div>
      <div className="home-summary">
        <span>Current Era</span>
        <strong>{user.currentEra}</strong>
        <small>
          Studio Level {user.currentWorld.studioLevel} / First quest{' '}
          {completedFirstQuests} of 3
        </small>
      </div>
      <section className="hub-grid" aria-label="DreamFrame sections">
        {hubCards.map(([tab, icon, title, body], index) => (
          <button
            className="hub-card"
            key={tab}
            onClick={() => onNavigate(tab)}
            style={{ '--delay': `${index * 80}ms` } as CSSProperties}
            type="button"
          >
            <span className="material-symbols-outlined">{icon}</span>
            <strong>{title}</strong>
            <span>{body}</span>
          </button>
        ))}
      </section>
    </section>
  )
}

function DreamFramePage({
  user,
  onSelectEra,
  onCompleteFocusSession,
  onCompleteGoal,
}: {
  user: DreamUser
  onSelectEra: (title: string) => void
  onCompleteFocusSession: () => void
  onCompleteGoal: () => void
}) {
  return (
    <section className="page-view">
      <div className="intro-panel">
        <p className="page-kicker">DreamFrame</p>
        <h2>What world are you building?</h2>
        <p>
          Choose the essence of your next chapter. Your DreamFrame will manifest
          based on this ritual choice.
        </p>
      </div>

      <section className="era-grid" aria-label="DreamFrame eras">
        {eras.map((era, index) => (
          <button
            className={`glass-card ${user.currentEra === era.title ? 'selected' : ''}`}
            key={era.title}
            onClick={() => onSelectEra(era.title)}
            style={{ '--delay': `${index * 80}ms` } as CSSProperties}
            type="button"
            aria-pressed={user.currentEra === era.title}
          >
            <span className="image-frame">
              <img src={era.image} alt={era.alt} />
            </span>
            <span className="card-copy">
              <strong>{era.title}</strong>
              <span>{era.description}</span>
            </span>
          </button>
        ))}
      </section>

      <section className="action-panel" aria-label="DreamFrame actions">
        <button
          className="glow-button"
          onClick={onCompleteFocusSession}
          type="button"
        >
          <span className="material-symbols-outlined">timer</span>
          Complete Focus Session
        </button>
        <button
          className="secondary-button"
          onClick={onCompleteGoal}
          type="button"
        >
          <span className="material-symbols-outlined">target</span>
          Complete First Goal
        </button>
        <p>
          Creator XP {user.creatorXP} / Growth XP {user.growthXP}
        </p>
      </section>
    </section>
  )
}

function WorldPage({
  user,
  onNavigate,
}: {
  user: DreamUser
  onNavigate: (tab: Tab) => void
}) {
  return (
    <section className="page-view detail-view">
      <div className="intro-panel">
        <p className="page-kicker">World</p>
        <h2>Your world is taking shape.</h2>
        <p>
          The environment, mood, and visual rules for {user.currentEra} live
          here. Real actions now update this world state.
        </p>
      </div>
      <div className={`studio-preview level-${user.currentWorld.studioLevel}`}>
        <div>
          <span>Creator Studio</span>
          <strong>Level {user.currentWorld.studioLevel}</strong>
          <p>{user.currentWorld.visualState.replaceAll('_', ' ')}</p>
        </div>
        <div className="reward-shelf" aria-label="Unlocked visual rewards">
          <span className={user.firstUpgradeUnlocked ? 'unlocked' : ''}>Plant</span>
          <span className={user.firstUpgradeUnlocked ? 'unlocked' : ''}>Lighting</span>
          <span className={user.firstUpgradeUnlocked ? 'unlocked' : ''}>Vision Board</span>
        </div>
      </div>
      <FirstQuestChecklist user={user} />
      <div className="detail-grid">
        <InfoPanel title="World Type" body={user.currentWorld.worldType} />
        <InfoPanel
          title="Upgrade Rule"
          body="Finish one reflection, one focus session, and one goal."
        />
        <InfoPanel
          title="Latest Event"
          body={user.worldEvents[0]?.message ?? 'No world events yet.'}
        />
      </div>
      <button
        className="secondary-button inline-action"
        onClick={() => onNavigate('Home')}
        type="button"
      >
        <span className="material-symbols-outlined">home</span>
        Back Home
      </button>
    </section>
  )
}

function JournalPage({
  user,
  journalDraft,
  onJournalDraftChange,
  onCompleteReflection,
  onNavigate,
}: {
  user: DreamUser
  journalDraft: string
  onJournalDraftChange: (value: string) => void
  onCompleteReflection: () => void
  onNavigate: (tab: Tab) => void
}) {
  return (
    <section className="page-view detail-view">
      <div className="intro-panel">
        <p className="page-kicker">Journal</p>
        <h2>Write the ritual down.</h2>
        <p>
          Prompts, intentions, and reflections for {user.currentEra} can gather
          here as this prototype grows.
        </p>
      </div>
      <div className="journal-card">
        <label htmlFor="journal-entry">Today I am building toward</label>
        <textarea
          id="journal-entry"
          value={journalDraft}
          onChange={(event) => onJournalDraftChange(event.target.value)}
          placeholder="A calmer frame, a clearer world, and one next action..."
        />
        <button className="glow-button compact-action" onClick={onCompleteReflection} type="button">
          <span className="material-symbols-outlined">auto_stories</span>
          Save Reflection +10 XP
        </button>
      </div>
      <button
        className="secondary-button inline-action"
        onClick={() => onNavigate('Home')}
        type="button"
      >
        <span className="material-symbols-outlined">home</span>
        Back Home
      </button>
    </section>
  )
}

function MePage({
  user,
  onCompleteHabit,
  onNavigate,
}: {
  user: DreamUser
  onCompleteHabit: () => void
  onNavigate: (tab: Tab) => void
}) {
  return (
    <section className="page-view detail-view">
      <div className="intro-panel">
        <p className="page-kicker">Me</p>
        <h2>Your profile anchors the frame.</h2>
        <p>
          Keep your selfie, goals, and active era connected to the rest of the
          experience.
        </p>
      </div>
      <div className="profile-card">
        <div className="large-avatar">
          <span className="material-symbols-outlined">person</span>
        </div>
        <div>
          <span>Active Era</span>
          <strong>{user.currentEra}</strong>
        </div>
      </div>
      <div className="xp-grid">
        <InfoPanel title={`Creator Level ${getLevel(user.creatorXP)}`} body={`${user.creatorXP} XP`} />
        <InfoPanel title={`Wellness Level ${getLevel(user.wellnessXP)}`} body={`${user.wellnessXP} XP`} />
        <InfoPanel title={`Reflection Level ${getLevel(user.reflectionXP)}`} body={`${user.reflectionXP} XP`} />
        <InfoPanel title={`Growth Level ${getLevel(user.growthXP)}`} body={`${user.growthXP} XP`} />
      </div>
      <button className="glow-button inline-action" onClick={onCompleteHabit} type="button">
        <span className="material-symbols-outlined">local_florist</span>
        Complete Habit +10 XP
      </button>
      <button
        className="secondary-button inline-action"
        onClick={() => onNavigate('Home')}
        type="button"
      >
        <span className="material-symbols-outlined">home</span>
        Back Home
      </button>
    </section>
  )
}

function FirstQuestChecklist({ user }: { user: DreamUser }) {
  const quests = [
    ['Write first reflection', user.firstReflectionComplete],
    ['Complete first focus session', user.firstFocusSessionComplete],
    ['Complete first goal', user.firstGoalComplete],
  ] as const

  return (
    <section className="quest-card" aria-label="First upgrade checklist">
      <div>
        <span>First Upgrade</span>
        <strong>
          {user.firstUpgradeUnlocked ? 'Studio Level 2 Unlocked' : '3 actions to unlock'}
        </strong>
      </div>
      <ul>
        {quests.map(([quest, complete]) => (
          <li className={complete ? 'complete' : ''} key={quest}>
            <span className="material-symbols-outlined">
              {complete ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            {quest}
          </li>
        ))}
      </ul>
    </section>
  )
}

function InfoPanel({ title, body }: { title: string; body: string }) {
  return (
    <article className="info-panel">
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  )
}

export default App
