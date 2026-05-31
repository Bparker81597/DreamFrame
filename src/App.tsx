import { useEffect, useState, type CSSProperties, type MouseEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { DreamUser, DreamUserUpdate } from './models/dreamUser'
import { createStarterWorldUser } from './models/createStarterWorld'
import { checkFirstUpgrade, getLevel, xpRewards } from './models/progression'
import { loadDreamUser, saveDreamUser } from './storage/dreamUserStorage'
import './App.css'

type Era = {
  title: string
  description: string
  image: string
  alt: string
}

type Tab =
  | 'Start'
  | 'Home'
  | 'DreamFrame'
  | 'World'
  | 'CreatorStudio'
  | 'FutureSelf'
  | 'Journal'
  | 'Me'

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

const tabSlugs: Record<Tab, string> = {
  Start: 'start',
  Home: 'home',
  DreamFrame: 'dreamframe',
  World: 'world',
  CreatorStudio: 'creator-studio',
  FutureSelf: 'future-self',
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
    return 'Start'
  }

  const slug = trimmedPath.replace(`${fallbackPath}/`, '').split('/')[0]

  return slugTabs[slug] ?? 'Home'
}

function App() {
  const [user, setUser] = useState<DreamUser>(loadDreamUser)
  const [journalDraft, setJournalDraft] = useState('')
  const [ritualPulse, setRitualPulse] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
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
    setUser((currentUser) => {
      const nextUser = checkFirstUpgrade(updater(currentUser))

      if (!currentUser.firstUpgradeUnlocked && nextUser.firstUpgradeUnlocked) {
        setShowUpgradeModal(true)
      }

      return nextUser
    })
    setRitualPulse(true)
    window.setTimeout(() => setRitualPulse(false), 900)
  }

  function completeReflection(response: string) {
    const trimmedResponse = response.trim()

    if (!trimmedResponse) {
      return
    }

    updateUser((currentUser) => ({
      ...currentUser,
      reflectionXP: currentUser.reflectionXP + xpRewards.complete_reflection,
      firstReflectionComplete: true,
      journalEntries: [
        {
          id: `entry_${Date.now()}`,
          prompt: 'Why does this dream matter to you?',
          response: trimmedResponse,
          reflectionXP: xpRewards.complete_reflection,
          createdAt: new Date().toISOString(),
        },
        ...currentUser.journalEntries,
      ],
    }))
    setJournalDraft('')
  }

  function completeFocusSession(durationMinutes = 25) {
    updateUser((currentUser) => ({
      ...currentUser,
      creatorXP: currentUser.creatorXP + xpRewards.complete_focus_session,
      firstFocusSessionComplete: true,
      worldEvents: [
        {
          id: `focus_${Date.now()}`,
          type: 'companion_message',
          title: `${durationMinutes} Minute Focus Session Complete`,
          message: 'You showed up today. Your studio feels brighter.',
          affectedLocation: 'creator_studio',
          seenByUser: false,
          createdAt: new Date().toISOString(),
        },
        ...currentUser.worldEvents,
      ],
    }))
  }

  function completeGoal() {
    updateUser((currentUser) => ({
      ...currentUser,
      goals: currentUser.goals.map((goal) =>
        goal.title === 'Work on DreamFrame'
          ? {
              ...goal,
              status: 'completed',
              completedAt: new Date().toISOString(),
            }
          : goal,
      ),
      growthXP: currentUser.firstGoalComplete
        ? currentUser.growthXP
        : currentUser.growthXP + xpRewards.complete_goal,
      firstGoalComplete: true,
    }))
  }

  function createFirstGoal() {
    updateUser((currentUser) => {
      const hasFirstGoal = currentUser.goals.some(
        (goal) => goal.title === 'Work on DreamFrame',
      )

      if (hasFirstGoal) {
        return currentUser
      }

      return {
        ...currentUser,
        goals: [
          {
            id: `goal_${Date.now()}`,
            title: 'Work on DreamFrame',
            status: 'active',
            xpReward: xpRewards.complete_goal,
            createdAt: new Date().toISOString(),
          },
          ...currentUser.goals,
        ],
      }
    })
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

  function createStarterWorld() {
    const starterUser = createStarterWorldUser({
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      currentEra: 'Creator Era',
      futureSelfVision: user.futureSelfVision,
    })

    saveDreamUser(starterUser)
    setUser(starterUser)
    setRitualPulse(true)
    window.setTimeout(() => setRitualPulse(false), 900)
    navigate('Home')
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
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeTab === 'Start' && (
              <StartPage user={user} onCreateStarterWorld={createStarterWorld} />
            )}
            {activeTab === 'Home' && <HomePage user={user} />}
            {activeTab === 'DreamFrame' && (
              <DreamFramePage
                user={user}
                onSelectEra={selectEra}
                onCompleteFocusSession={completeFocusSession}
                onCreateFirstGoal={createFirstGoal}
                onCompleteGoal={completeGoal}
              />
            )}
            {activeTab === 'World' && (
              <WorldPage user={user} onNavigate={navigate} />
            )}
            {activeTab === 'CreatorStudio' && (
              <CreatorStudioPage
                user={user}
                onCompleteFocusSession={completeFocusSession}
                onNavigate={navigate}
              />
            )}
            {activeTab === 'FutureSelf' && (
              <FutureSelfPage user={user} onNavigate={navigate} />
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
              <MePage
                user={user}
                onCompleteHabit={completeHabit}
                onNavigate={navigate}
              />
            )}
          </motion.div>
        </AnimatePresence>
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
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  )
}

function StartPage({
  user,
  onCreateStarterWorld,
}: {
  user: DreamUser
  onCreateStarterWorld: () => void
}) {
  return (
    <section className="page-view start-view">
      <div className="intro-panel">
        <p className="page-kicker">Starter World</p>
        <h2>Create Creator Studio Level 1.</h2>
        <p>
          This generates the first user document, saves the starter world state,
          and redirects into the Home hub.
        </p>
      </div>
      <div className="starter-card">
        <span>users/{user.uid}</span>
        <strong>Creator Studio Level 1</strong>
        <p>starter_studio / Creator Era / 0 XP</p>
        <button className="glow-button" onClick={onCreateStarterWorld} type="button">
          <span className="material-symbols-outlined">auto_fix_high</span>
          Generate Starter World
        </button>
      </div>
    </section>
  )
}

function HomePage({
  user,
}: {
  user: DreamUser
}) {
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'

  return (
    <section className="page-view home-view">
      <section className="home-greeting" aria-label="Home summary">
        <p className="page-kicker">Home</p>
        <h2>
          {greeting}, {user.displayName}.
        </h2>
        <div className="home-stats">
          <div>
            <span>Current Era</span>
            <strong>{user.currentEra}</strong>
          </div>
          <div>
            <span>Creator Level</span>
            <strong>{user.creatorLevel}</strong>
          </div>
          <div>
            <span>World Level</span>
            <strong>{user.worldLevel}</strong>
          </div>
        </div>
      </section>
    </section>
  )
}

function DreamFramePage({
  user,
  onSelectEra,
  onCompleteFocusSession,
  onCreateFirstGoal,
  onCompleteGoal,
}: {
  user: DreamUser
  onSelectEra: (title: string) => void
  onCompleteFocusSession: () => void
  onCreateFirstGoal: () => void
  onCompleteGoal: () => void
}) {
  const firstGoal = user.goals.find((goal) => goal.title === 'Work on DreamFrame')

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
        {!firstGoal && (
          <button
            className="secondary-button"
            onClick={onCreateFirstGoal}
            type="button"
          >
            <span className="material-symbols-outlined">target</span>
            Create First Goal: Work on DreamFrame
          </button>
        )}
        {firstGoal?.status === 'active' && (
          <button
            className="secondary-button"
            onClick={onCompleteGoal}
            type="button"
          >
            <span className="material-symbols-outlined">check_circle</span>
            Complete Goal: Work on DreamFrame
          </button>
        )}
        {firstGoal?.status === 'completed' && (
          <div className="goal-complete-note">
            <span className="material-symbols-outlined">check_circle</span>
            Work on DreamFrame complete
          </div>
        )}
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
  const quickAccessCards = [
    {
      title: 'Creator Studio',
      icon: 'computer',
      status: 'Active',
      tab: 'CreatorStudio' as const,
    },
    {
      title: 'Growth Garden',
      icon: 'local_florist',
      status: 'Coming Soon',
    },
    {
      title: 'Journal Corner',
      icon: 'auto_stories',
      status: 'Active',
      tab: 'Journal' as const,
    },
    {
      title: 'Future Self Observatory',
      icon: 'visibility',
      status: 'Active',
      tab: 'FutureSelf' as const,
    },
    {
      title: 'Dream Sanctuary',
      icon: 'night_shelter',
      status: 'Coming Soon',
    },
  ]

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
      <div className={`world-preview-card level-${user.currentWorld.studioLevel}`}>
        <div>
          <span>Main World</span>
          <strong>Creator Studio Level {user.currentWorld.studioLevel}</strong>
          <p>Status: Growing</p>
        </div>
      </div>
      <section className="quick-access-grid" aria-label="World quick access">
        {quickAccessCards.map((card) =>
          card.tab ? (
            <motion.button
              className="quick-access-card active-location"
              key={card.title}
              onClick={() => onNavigate(card.tab)}
              type="button"
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="material-symbols-outlined">{card.icon}</span>
              <strong>{card.title}</strong>
              <small>{card.status}</small>
            </motion.button>
          ) : (
            <div className="quick-access-card coming-soon" key={card.title}>
              <span className="material-symbols-outlined">{card.icon}</span>
              <strong>{card.title}</strong>
              <small>{card.status}</small>
            </div>
          ),
        )}
      </section>
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

function CreatorStudioPage({
  user,
  onCompleteFocusSession,
  onNavigate,
}: {
  user: DreamUser
  onCompleteFocusSession: (durationMinutes?: number) => void
  onNavigate: (tab: Tab) => void
}) {
  const timerOptions = [25, 45, 60]
  const [selectedMinutes, setSelectedMinutes] = useState(25)
  const [focusStarted, setFocusStarted] = useState(false)

  function completeSelectedFocusSession() {
    onCompleteFocusSession(selectedMinutes)
    setFocusStarted(false)
  }

  return (
    <section className="page-view detail-view">
      <div className="intro-panel">
        <p className="page-kicker">Creator Studio</p>
        <h2>Creator Studio Level {user.currentWorld.studioLevel}</h2>
        <p>
          Your starter studio is quiet and ready: a creator desk, laptop, mood
          lighting, an empty shelf, and a small plant placeholder.
        </p>
      </div>

      <div
        className={`creator-studio-scene level-${user.currentWorld.studioLevel}`}
        aria-label="Creator Studio visual"
      >
        <div className="mood-light left-light"></div>
        <div className="mood-light right-light"></div>
        {user.firstUpgradeUnlocked && (
          <motion.div
            className="vision-board"
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span></span>
            <span></span>
            <span></span>
          </motion.div>
        )}
        <div className="wall-shelf">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="desk">
          <div className="laptop">
            <div className="laptop-screen"></div>
            <div className="laptop-base"></div>
          </div>
          {user.firstUpgradeUnlocked && (
            <motion.div
              className="second-monitor"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
            >
              <div></div>
            </motion.div>
          )}
          <div className="plant-placeholder">
            <span></span>
          </div>
        </div>
      </div>

      <FirstQuestChecklist user={user} />

      <section className="action-panel" aria-label="Creator Studio actions">
        <div className="focus-timer-card">
          <span>Focus Session</span>
          <strong>{selectedMinutes} min</strong>
          <div className="timer-options" aria-label="Timer options">
            {timerOptions.map((minutes) => (
              <button
                className={selectedMinutes === minutes ? 'selected' : ''}
                key={minutes}
                onClick={() => {
                  setSelectedMinutes(minutes)
                  setFocusStarted(false)
                }}
                type="button"
              >
                {minutes} min
              </button>
            ))}
          </div>
          {!focusStarted ? (
            <button
              className="glow-button compact-action center-action"
              onClick={() => setFocusStarted(true)}
              type="button"
            >
              <span className="material-symbols-outlined">timer</span>
              Start Timer
            </button>
          ) : (
            <button
              className="glow-button compact-action center-action"
              onClick={completeSelectedFocusSession}
              type="button"
            >
              <span className="material-symbols-outlined">check_circle</span>
              Complete Session +20 XP
            </button>
          )}
        </div>
        <p>Creator XP {user.creatorXP}</p>
      </section>

      <button
        className="secondary-button inline-action"
        onClick={() => onNavigate('World')}
        type="button"
      >
        <span className="material-symbols-outlined">public</span>
        Back to World
      </button>
    </section>
  )
}

function FutureSelfPage({
  user,
  onNavigate,
}: {
  user: DreamUser
  onNavigate: (tab: Tab) => void
}) {
  return (
    <section className="page-view detail-view">
      <div className="intro-panel">
        <p className="page-kicker">Future Self</p>
        <h2>Future Self Observatory</h2>
        <p>
          A simple view of who you are now, who you are becoming, and what your
          DreamFrame has already changed.
        </p>
      </div>

      <div className="future-self-flow">
        <motion.article className="future-panel" whileHover={{ y: -5 }}>
          <span>Current Self</span>
          <strong>{user.displayName}</strong>
          <p>{user.currentEra}</p>
        </motion.article>
        <span className="flow-arrow">↓</span>
        <motion.article className="future-panel highlighted" whileHover={{ y: -5 }}>
          <span>Future Self Vision</span>
          <strong>{user.futureSelfVision}</strong>
        </motion.article>
        <span className="flow-arrow">↓</span>
        <motion.article className="future-panel" whileHover={{ y: -5 }}>
          <span>Progress Summary</span>
          <div className="progress-row">
            <strong>Studio Level {user.currentWorld.studioLevel}</strong>
            <strong>Creator Level {user.creatorLevel}</strong>
            <strong>{user.creatorXP} XP</strong>
          </div>
        </motion.article>
      </div>

      <button
        className="secondary-button inline-action"
        onClick={() => onNavigate('World')}
        type="button"
      >
        <span className="material-symbols-outlined">public</span>
        Back to World
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
  onCompleteReflection: (response: string) => void
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
        <label htmlFor="journal-entry">Why does this dream matter to you?</label>
        <textarea
          id="journal-entry"
          value={journalDraft}
          onChange={(event) => onJournalDraftChange(event.target.value)}
          placeholder="Because I want to build something meaningful and become more consistent..."
        />
        <button
          className="glow-button compact-action"
          onClick={() => onCompleteReflection(journalDraft)}
          type="button"
        >
          <span className="material-symbols-outlined">auto_stories</span>
          Submit Journal +10 XP
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
        <h2>Profile</h2>
        <p>
          Your identity, era, future self vision, and world progress stay
          connected to the core DreamFrame loop.
        </p>
      </div>
      <div className="profile-card">
        <div className="large-avatar profile-photo">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} />
          ) : (
            <span className="material-symbols-outlined">person</span>
          )}
        </div>
        <div>
          <span>Name</span>
          <strong>{user.displayName}</strong>
        </div>
      </div>
      <div className="profile-detail-grid">
        <InfoPanel title="Current Era" body={user.currentEra} />
        <InfoPanel title="Future Self Vision" body={user.futureSelfVision} />
        <InfoPanel
          title="World Progress"
          body={`Studio Level ${user.currentWorld.studioLevel} / World Level ${user.worldLevel}`}
        />
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

function UpgradeModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="upgrade-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <motion.div
            className="upgrade-modal"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 18 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-title"
          >
            <motion.div
              className="upgrade-orb"
              initial={{ scale: 0.72, opacity: 0 }}
              animate={{ scale: [0.72, 1.08, 1], opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
            <p className="page-kicker">Upgrade Unlocked</p>
            <h2 id="upgrade-title">✨ Studio Level 2 Unlocked</h2>
            <p>Your world noticed.</p>
            <p>Consistency creates momentum.</p>
            <ul>
              <li>brighter lighting</li>
              <li>larger plant</li>
              <li>vision board added</li>
              <li>second monitor appears</li>
            </ul>
            <button className="glow-button compact-action center-action" onClick={onClose} type="button">
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function FirstQuestChecklist({ user }: { user: DreamUser }) {
  const quests = [
    ['Complete first reflection', user.firstReflectionComplete],
    ['Complete first focus session', user.firstFocusSessionComplete],
    ['Complete first goal', user.firstGoalComplete],
  ] as const

  return (
    <section className="quest-card" aria-label="First upgrade checklist">
      <div>
        <span>Creator Spark Quest</span>
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
