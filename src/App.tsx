import { useEffect, useState, type CSSProperties, type MouseEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CompanionMessageCard,
  EraBadge,
  GrowthHabitCard,
  ProgressTimeline,
  WorldLocationCard,
  XPBar,
} from './components/Phase2Cards'
import { activeEra, eras as eraConfigs } from './lib/eras'
import { completeHabit as evolveHabit } from './lib/worldEvolution'
import type {
  CheckInMood,
  DailyActionType,
  DreamUser,
  DreamUserUpdate,
  HabitLog,
} from './models/dreamUser'
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
  | 'Landing'
  | 'Start'
  | 'Home'
  | 'DreamFrame'
  | 'World'
  | 'CreatorStudio'
  | 'GrowthGarden'
  | 'FutureSelf'
  | 'Companion'
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
  ['favorite', 'Companion'],
  ['auto_stories', 'Journal'],
  ['person', 'Me'],
]

const tabSlugs: Record<Tab, string> = {
  Landing: '',
  Start: 'start',
  Home: 'home',
  DreamFrame: 'dreamframe',
  World: 'world',
  CreatorStudio: 'creator-studio',
  GrowthGarden: 'growth-garden',
  FutureSelf: 'future-self',
  Companion: 'companion',
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
    return 'Landing'
  }

  const slug = trimmedPath.replace(`${fallbackPath}/`, '').split('/')[0]

  return slugTabs[slug] ?? 'Home'
}

const dailyActions: Record<
  DailyActionType,
  { label: string; xpReward: number; worldEffect: string; icon: string }
> = {
  breathe: {
    label: 'Take three grounding breaths',
    xpReward: 10,
    worldEffect: 'the sanctuary air softens',
    icon: 'self_improvement',
  },
  hydrate: {
    label: 'Drink a full glass of water',
    xpReward: 10,
    worldEffect: 'fresh flowers open in the garden',
    icon: 'water_drop',
  },
  focus: {
    label: 'Do a 10 minute creator sprint',
    xpReward: 15,
    worldEffect: 'the studio desk begins to glow',
    icon: 'timer',
  },
  reflect: {
    label: 'Write one honest sentence',
    xpReward: 10,
    worldEffect: 'the observatory clears a patch of sky',
    icon: 'edit_note',
  },
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

function isYesterday(dateKey?: string) {
  if (!dateKey) {
    return false
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  return dateKey === yesterday.toISOString().slice(0, 10)
}

function getCompanionGuidance(tab: Tab, user: DreamUser) {
  if (tab === 'Home') {
    return user.lastCheckInDate === getTodayKey()
      ? 'Your ritual is complete for today. Let the win count before you chase the next one.'
      : 'Start small today. Pick the action that feels possible, then let your world respond.'
  }

  if (tab === 'DreamFrame') {
    return 'Choose an era like a direction, not a verdict. Your next action is what makes it real.'
  }

  if (tab === 'World') {
    return 'Look for the places that changed recently. Your history is proof that tiny rituals compound.'
  }

  if (tab === 'CreatorStudio') {
    return 'A short sprint is enough. The studio gets brighter when you give it focused attention.'
  }

  if (tab === 'GrowthGarden') {
    return 'Your garden responds best to repeatable care. Choose the smallest habit you will actually do.'
  }

  if (tab === 'FutureSelf') {
    return 'Read this page as evidence. You are not starting from zero anymore.'
  }

  if (tab === 'Journal') {
    return 'One honest sentence is a complete reflection. Clarity grows when you return tomorrow.'
  }

  if (tab === 'Me') {
    return 'Share the progress, not perfection. The ritual is working because you keep returning.'
  }

  return 'DreamFrame turns one small daily action into visible progress.'
}

function getTotalXP(user: DreamUser) {
  return user.creatorXP + user.wellnessXP + user.reflectionXP + user.growthXP
}

function App() {
  const [user, setUser] = useState<DreamUser>(loadDreamUser)
  const [journalDraft, setJournalDraft] = useState('')
  const [ritualPulse, setRitualPulse] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistJoined, setWaitlistJoined] = useState(false)
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

  function completeDailyCheckIn({
    mood,
    intention,
    actionType,
  }: {
    mood: CheckInMood
    intention: string
    actionType: DailyActionType
  }) {
    const today = getTodayKey()
    const action = dailyActions[actionType]
    const cleanedIntention =
      intention.trim() || 'I will take one small step and let it count.'

    updateUser((currentUser) => {
      const existingCheckIn = currentUser.dailyCheckIns.find(
        (checkIn) => checkIn.date === today,
      )

      if (existingCheckIn?.completed) {
        return currentUser
      }

      const nextStreak = isYesterday(currentUser.lastCheckInDate)
        ? currentUser.dailyStreak + 1
        : currentUser.lastCheckInDate === today
          ? currentUser.dailyStreak || 1
          : 1
      const createdAt = new Date().toISOString()
      const companionNote = `You checked in while feeling ${mood}. ${action.worldEffect}.`
      const checkIn = {
        id: `checkin_${Date.now()}`,
        date: today,
        mood,
        intention: cleanedIntention,
        action: {
          type: actionType,
          label: action.label,
          xpReward: action.xpReward,
          worldEffect: action.worldEffect,
          completedAt: createdAt,
        },
        completed: true,
        companionNote,
        createdAt,
        completedAt: createdAt,
      }
      const progressEntry = {
        id: `progress_${Date.now()}`,
        date: today,
        title: 'Daily ritual complete',
        detail: cleanedIntention,
        xpGained: action.xpReward,
        worldEffect: action.worldEffect,
        createdAt,
      }
      const nextWorld = {
        ...currentUser.currentWorld,
        gardenLevel:
          nextStreak >= 3
            ? Math.max(currentUser.currentWorld.gardenLevel, 2)
            : currentUser.currentWorld.gardenLevel,
        observatoryLevel:
          actionType === 'reflect'
            ? Math.max(currentUser.currentWorld.observatoryLevel, 1)
            : currentUser.currentWorld.observatoryLevel,
      }
      const xpUpdate =
        actionType === 'focus'
          ? { creatorXP: currentUser.creatorXP + action.xpReward }
          : actionType === 'reflect'
            ? { reflectionXP: currentUser.reflectionXP + action.xpReward }
            : { wellnessXP: currentUser.wellnessXP + action.xpReward }

      return {
        ...currentUser,
        ...xpUpdate,
        currentWorld: nextWorld,
        dailyStreak: nextStreak,
        bestDailyStreak: Math.max(currentUser.bestDailyStreak, nextStreak),
        lastCheckInDate: today,
        lastActiveAt: createdAt,
        dailyCheckIns: [
          checkIn,
          ...currentUser.dailyCheckIns.filter(
            (storedCheckIn) => storedCheckIn.date !== today,
          ),
        ],
        progressHistory: [progressEntry, ...currentUser.progressHistory],
        companionMessages: [
          {
            id: `msg_daily_${Date.now()}`,
            type: 'encouragement',
            location: 'daily_check_in',
            message: companionNote,
            createdAt,
            read: false,
          },
          ...currentUser.companionMessages,
        ],
        worldEvents: [
          {
            id: `event_daily_${Date.now()}`,
            type: 'daily_check_in',
            title: 'Daily ritual complete',
            message: action.worldEffect,
            affectedLocation:
              actionType === 'focus'
                ? 'creator_studio'
                : actionType === 'reflect'
                  ? 'future_self_observatory'
                  : 'growth_garden',
            seenByUser: false,
            createdAt,
          },
          ...currentUser.worldEvents,
        ],
      }
    })
  }

  function joinWaitlist(email: string) {
    const cleanedEmail = email.trim().toLowerCase()

    if (!cleanedEmail) {
      return
    }

    updateUser((currentUser) => {
      const alreadyJoined = currentUser.waitlistSignups.some(
        (signup) => signup.email === cleanedEmail,
      )

      if (alreadyJoined) {
        return currentUser
      }

      return {
        ...currentUser,
        waitlistSignups: [
          {
            id: `waitlist_${Date.now()}`,
            email: cleanedEmail,
            createdAt: new Date().toISOString(),
          },
          ...currentUser.waitlistSignups,
        ],
      }
    })
    setWaitlistEmail('')
    setWaitlistJoined(true)
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

  function completeGardenHabit(habitType: HabitLog['habitType']) {
    updateUser((currentUser) => evolveHabit(currentUser, habitType))
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
          onClick={() => navigate(activeTab === 'Landing' ? 'Landing' : 'Home')}
          type="button"
          aria-label={activeTab === 'Landing' ? 'Open landing page' : 'Open Home'}
        >
          <div className="avatar">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMKZSj0Ie-rSmRP0OdXbDGY1wOElkuqBlmMj0Y0sUU-E5rlSw-LKDiynosWKSlBDtEHV4utC70pyFd9Nr20KpGh61xMcNte_kJC1Z86znUlMRPuk4IRiQ1Up9AT0PJmcaKo9k_i-FHEg72MTAJdu7ExRHlrGpA_0UXho9wDoDvDINVLv7LGC27-mzEQCiluuM4xcsF-AWFindYC6TdSr8tWAtN-mp6YhiAR1Do1XssLpG3n6lzKSs6JuYqZnKqinpPCw_Dv2YEp-0"
              alt="DreamFrame profile"
            />
          </div>
          <h1>DreamFrame</h1>
        </button>
        <button
          className="icon-button"
          onClick={() =>
            activeTab === 'Landing' && navigate(user.onboardingComplete ? 'Home' : 'Start')
          }
          type="button"
          aria-label={activeTab === 'Landing' ? 'Open app' : 'Settings'}
        >
          <span className="material-symbols-outlined">
            {activeTab === 'Landing' ? 'login' : 'settings'}
          </span>
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
            {activeTab === 'Landing' && (
              <LandingPage
                email={waitlistEmail}
                joined={waitlistJoined}
                onEmailChange={setWaitlistEmail}
                onJoinWaitlist={joinWaitlist}
                onOpenApp={() => navigate(user.onboardingComplete ? 'Home' : 'Start')}
              />
            )}
            {activeTab === 'Start' && (
              <StartPage user={user} onCreateStarterWorld={createStarterWorld} />
            )}
            {activeTab === 'Home' && (
              <HomePage
                user={user}
                onCompleteDailyCheckIn={completeDailyCheckIn}
              />
            )}
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
            {activeTab === 'GrowthGarden' && (
              <GrowthGardenPage
                user={user}
                onCompleteHabit={completeGardenHabit}
                onNavigate={navigate}
              />
            )}
            {activeTab === 'FutureSelf' && (
              <FutureSelfPage user={user} onNavigate={navigate} />
            )}
            {activeTab === 'Companion' && (
              <CompanionPage user={user} onNavigate={navigate} />
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
            {activeTab !== 'Landing' && activeTab !== 'Start' && (
              <CompanionGuide message={getCompanionGuidance(activeTab, user)} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {activeTab !== 'Landing' && (
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
      )}
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  )
}

function LandingPage({
  email,
  joined,
  onEmailChange,
  onJoinWaitlist,
  onOpenApp,
}: {
  email: string
  joined: boolean
  onEmailChange: (value: string) => void
  onJoinWaitlist: (email: string) => void
  onOpenApp: () => void
}) {
  return (
    <section className="page-view landing-page">
      <div className="landing-hero">
        <div className="landing-copy">
          <p className="page-kicker">DreamFrame</p>
          <h2>Your daily emotional ritual, made visible.</h2>
          <p>
            Check in, complete one small action, and watch a personal world
            reflect the person you are becoming.
          </p>
          <div className="landing-actions">
            <button className="glow-button" onClick={onOpenApp} type="button">
              <span className="material-symbols-outlined">auto_fix_high</span>
              Open Prototype
            </button>
          </div>
          <form
            className="waitlist-form"
            onSubmit={(event) => {
              event.preventDefault()
              onJoinWaitlist(email)
            }}
          >
            <label htmlFor="waitlist-email">Join the waitlist</label>
            <div>
              <input
                id="waitlist-email"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                placeholder="you@example.com"
                type="email"
              />
              <button className="secondary-button" type="submit">
                Join
              </button>
            </div>
            {joined && <small>You're on the local prototype waitlist.</small>}
          </form>
        </div>
        <div className="landing-world" aria-label="DreamFrame world preview">
          <span className="landing-sun"></span>
          <span className="landing-studio"></span>
          <span className="landing-garden"></span>
          <span className="landing-path"></span>
          <div>
            <strong>One action today</strong>
            <p>Studio glows. Garden blooms. Streak continues.</p>
          </div>
        </div>
      </div>
      <section className="landing-proof" aria-label="DreamFrame ritual steps">
        {[
          ['mood', 'Check in honestly'],
          ['task_alt', 'Complete one small action'],
          ['public', 'Watch your world respond'],
        ].map(([icon, label]) => (
          <article key={label}>
            <span className="material-symbols-outlined">{icon}</span>
            <strong>{label}</strong>
          </article>
        ))}
      </section>
    </section>
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
  onCompleteDailyCheckIn,
}: {
  user: DreamUser
  onCompleteDailyCheckIn: (input: {
    mood: CheckInMood
    intention: string
    actionType: DailyActionType
  }) => void
}) {
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'
  const todaysCheckIn = user.dailyCheckIns.find(
    (checkIn) => checkIn.date === getTodayKey(),
  )
  const latestProgress = user.progressHistory[0]

  return (
    <section className="page-view home-view">
      <section className="home-greeting" aria-label="Home summary">
        <p className="page-kicker">Home</p>
        <h2>
          {greeting}, {user.displayName}.
        </h2>
        <p className="home-ritual-subtitle">
          {todaysCheckIn
            ? "Your world already received today's signal."
            : 'Begin with one honest check-in and one small action.'}
        </p>
        {user.companionMessages[0] && (
          <div className="home-companion">
            <CompanionMessageCard message={user.companionMessages[0]} />
          </div>
        )}
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
      <DailyCheckInCard
        todaysCheckIn={todaysCheckIn}
        onCompleteDailyCheckIn={onCompleteDailyCheckIn}
      />
      <section className="daily-response-grid">
        <article className="ritual-response-card">
          <span>Current Streak</span>
          <strong>{user.dailyStreak} days</strong>
          <p>Best streak: {user.bestDailyStreak} days</p>
        </article>
        <article className="ritual-response-card">
          <span>World Response</span>
          <strong>{latestProgress?.worldEffect ?? 'waiting for today'}</strong>
          <p>{latestProgress?.detail ?? 'Complete a ritual to change the world.'}</p>
        </article>
      </section>
    </section>
  )
}

function DailyCheckInCard({
  todaysCheckIn,
  onCompleteDailyCheckIn,
}: {
  todaysCheckIn: DreamUser['dailyCheckIns'][number] | undefined
  onCompleteDailyCheckIn: (input: {
    mood: CheckInMood
    intention: string
    actionType: DailyActionType
  }) => void
}) {
  const [mood, setMood] = useState<CheckInMood>('steady')
  const [actionType, setActionType] = useState<DailyActionType>('breathe')
  const [intention, setIntention] = useState('')
  const moods: Array<{ value: CheckInMood; label: string }> = [
    { value: 'bright', label: 'Bright' },
    { value: 'steady', label: 'Steady' },
    { value: 'tender', label: 'Tender' },
    { value: 'stuck', label: 'Stuck' },
  ]

  if (todaysCheckIn) {
    return (
      <section className="daily-check-card complete" aria-label="Daily check-in">
        <div>
          <span>Daily Check-In Complete</span>
          <strong>{todaysCheckIn.action.label}</strong>
          <p>{todaysCheckIn.companionNote}</p>
        </div>
        <span className="material-symbols-outlined">verified</span>
      </section>
    )
  }

  return (
    <section className="daily-check-card" aria-label="Daily check-in">
      <div className="ritual-card-heading">
        <span>Daily Check-In</span>
        <strong>How are you arriving today?</strong>
      </div>
      <div className="mood-options" aria-label="Mood options">
        {moods.map((option) => (
          <button
            className={mood === option.value ? 'selected' : ''}
            key={option.value}
            onClick={() => setMood(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
      <label htmlFor="daily-intention">Today I want to feel...</label>
      <input
        id="daily-intention"
        value={intention}
        onChange={(event) => setIntention(event.target.value)}
        placeholder="clear, brave, calm, consistent"
      />
      <div className="daily-action-options" aria-label="Small actions">
        {Object.entries(dailyActions).map(([type, action]) => (
          <button
            className={actionType === type ? 'selected' : ''}
            key={type}
            onClick={() => setActionType(type as DailyActionType)}
            type="button"
          >
            <span className="material-symbols-outlined">{action.icon}</span>
            <strong>{action.label}</strong>
            <small>{action.worldEffect}</small>
          </button>
        ))}
      </div>
      <button
        className="glow-button"
        onClick={() => onCompleteDailyCheckIn({ mood, intention, actionType })}
        type="button"
      >
        <span className="material-symbols-outlined">task_alt</span>
        Complete Today's Ritual
      </button>
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
      status: 'Active',
      tab: 'GrowthGarden' as const,
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
    <section className="page-view detail-view world-map-page">
      <div className="intro-panel">
        <p className="page-kicker">World</p>
        <h2>Enter your DreamFrame world.</h2>
        <p>
          This is your personal world map. Each real action brings more light,
          color, and life into the places you are building.
        </p>
      </div>
      <div className="era-row">
        <EraBadge name={activeEra.name} status={activeEra.status} />
        {eraConfigs
          .filter((era) => era.id !== activeEra.id)
          .slice(0, 3)
          .map((era) => (
            <EraBadge key={era.id} name={era.name} status={era.status} />
          ))}
      </div>
      <div className={`world-preview-card level-${user.currentWorld.studioLevel}`}>
        <div>
          <span>Main World</span>
          <strong>Creator Studio Level {user.currentWorld.studioLevel}</strong>
          <p>Status: Growing</p>
        </div>
      </div>
      {user.companionMessages[0] && (
        <CompanionMessageCard message={user.companionMessages[0]} />
      )}
      <section className="world-map-grid" aria-label="Interactive world map">
        {quickAccessCards.map((card) =>
          card.tab ? (
            <WorldLocationCard
              key={card.title}
              title={card.title}
              icon={card.icon}
              status={card.status}
              onClick={() => onNavigate(card.tab)}
            />
          ) : (
            <WorldLocationCard
              key={card.title}
              title={card.title}
              icon={card.icon}
              status={card.status}
            />
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

      <div className="future-observatory-grid">
        <div className="profile-card cinematic-self-card">
          <div className="large-avatar profile-photo">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} />
            ) : (
              <span className="material-symbols-outlined">person</span>
            )}
          </div>
          <div>
            <span>Current Era</span>
            <strong>{user.currentEra}</strong>
          </div>
        </div>
        <div className="xp-grid observatory-xp">
          <XPBar label="Creator" value={user.creatorXP} />
          <XPBar label="Wellness" value={user.wellnessXP} />
          <XPBar label="Reflection" value={user.reflectionXP} />
          <XPBar label="Growth" value={user.growthXP} />
        </div>
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
            <strong>Garden Level {user.currentWorld.gardenLevel}</strong>
            <strong>Creator Level {user.creatorLevel}</strong>
            <strong>{user.creatorXP} XP</strong>
          </div>
        </motion.article>
      </div>

      <ProgressTimeline currentLevel={user.worldLevel} />

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

function GrowthGardenPage({
  user,
  onCompleteHabit,
  onNavigate,
}: {
  user: DreamUser
  onCompleteHabit: (habitType: HabitLog['habitType']) => void
  onNavigate: (tab: Tab) => void
}) {
  const habits: Array<{
    type: HabitLog['habitType']
    title: string
    effect: string
    icon: string
  }> = [
    { type: 'hydration', title: 'Hydration', effect: 'flowers bloom', icon: 'water_drop' },
    { type: 'reading', title: 'Reading', effect: 'new plants unlock', icon: 'menu_book' },
    { type: 'fitness', title: 'Fitness', effect: 'trees grow', icon: 'fitness_center' },
    { type: 'meditation', title: 'Meditation', effect: 'water feature glows', icon: 'self_improvement' },
    { type: 'coding', title: 'Coding', effect: 'creative vines grow', icon: 'code' },
    { type: 'sleep', title: 'Sleep', effect: 'night sky softens', icon: 'bedtime' },
  ]
  const latestHabit = user.habitLogs[0]

  return (
    <section className="page-view detail-view">
      <div className="intro-panel">
        <p className="page-kicker">Growth Garden</p>
        <h2>Your habits are becoming a living garden.</h2>
        <p>
          Complete small real-life actions and watch the garden respond with
          flowers, trees, vines, water, and light.
        </p>
      </div>

      <motion.div
        className={`garden-scene level-${user.currentWorld.gardenLevel}`}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="garden-sky"></div>
        <div className="garden-ground">
          <span className="garden-flower"></span>
          <span className="garden-tree"></span>
          <span className="garden-water"></span>
          <span className="garden-vines"></span>
          <span className="garden-butterflies"></span>
        </div>
        <div>
          <span>Garden Level {user.currentWorld.gardenLevel || 1}</span>
          <strong>{latestHabit?.gardenEffect ?? 'starter garden'}</strong>
          <p>{user.habitLogs.length} completed habit logs</p>
        </div>
      </motion.div>

      {latestHabit && (
        <CompanionMessageCard message={user.companionMessages[0]} />
      )}

      <section className="habit-grid" aria-label="Growth Garden habits">
        {habits.map((habit) => (
          <GrowthHabitCard
            key={habit.type}
            title={habit.title}
            effect={habit.effect}
            icon={habit.icon}
            onComplete={() => onCompleteHabit(habit.type)}
          />
        ))}
      </section>

      <div className="xp-grid">
        <XPBar label="Wellness" value={user.wellnessXP} />
        <XPBar label="Creator" value={user.creatorXP} />
        <XPBar label="Growth" value={user.growthXP} />
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

function CompanionPage({
  user,
  onNavigate,
}: {
  user: DreamUser
  onNavigate: (tab: Tab) => void
}) {
  return (
    <section className="page-view detail-view">
      <div className="intro-panel">
        <p className="page-kicker">Companion</p>
        <h2>Your DreamFrame companion is listening.</h2>
        <p>
          Gentle messages appear when your actions evolve your world, clarify
          your future self, or make your garden grow.
        </p>
      </div>
      <section className="companion-list">
        {user.companionMessages.length > 0 ? (
          user.companionMessages.map((message) => (
            <CompanionMessageCard key={message.id} message={message} />
          ))
        ) : (
          <CompanionMessageCard
            message={{
              id: 'empty_companion',
              type: 'encouragement',
              location: 'home',
              message: 'Small steps still shape the world.',
              createdAt: new Date().toISOString(),
              read: false,
            }}
          />
        )}
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
      <ShareProgressCard user={user} />
      <ProgressHistoryList user={user} />
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

function ShareProgressCard({ user }: { user: DreamUser }) {
  const [copied, setCopied] = useState(false)
  const shareText = `DreamFrame progress: ${user.dailyStreak} day streak, World Level ${user.worldLevel}, ${getTotalXP(user)} total XP. Today's world: ${user.progressHistory[0]?.worldEffect ?? 'ready for a ritual'}.`

  async function shareProgress() {
    if (navigator.share) {
      await navigator.share({
        title: 'My DreamFrame Progress',
        text: shareText,
      })
      return
    }

    await navigator.clipboard.writeText(shareText)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section className="share-progress-card" aria-label="Shareable progress card">
      <div>
        <span>Shareable Progress Card</span>
        <strong>{user.dailyStreak} day ritual streak</strong>
        <p>World Level {user.worldLevel} / {getTotalXP(user)} total XP</p>
      </div>
      <div className="share-card-preview">
        <span>DreamFrame</span>
        <strong>{user.currentEra}</strong>
        <p>{user.progressHistory[0]?.worldEffect ?? 'a new ritual is waiting'}</p>
      </div>
      <button className="secondary-button compact-action" onClick={shareProgress} type="button">
        <span className="material-symbols-outlined">ios_share</span>
        {copied ? 'Copied' : 'Share Progress'}
      </button>
    </section>
  )
}

function ProgressHistoryList({ user }: { user: DreamUser }) {
  const entries = user.progressHistory.slice(0, 6)

  return (
    <section className="progress-history-card" aria-label="Progress history">
      <div className="ritual-card-heading">
        <span>Progress History</span>
        <strong>What your rituals changed</strong>
      </div>
      {entries.length > 0 ? (
        <ol>
          {entries.map((entry) => (
            <li key={entry.id}>
              <time>{entry.date}</time>
              <div>
                <strong>{entry.title}</strong>
                <p>{entry.worldEffect}</p>
              </div>
              <span>+{entry.xpGained} XP</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="empty-history">Complete a daily ritual to start your progress history.</p>
      )}
    </section>
  )
}

function CompanionGuide({ message }: { message: string }) {
  return (
    <aside className="companion-guide" aria-label="Companion guidance">
      <span className="material-symbols-outlined">favorite</span>
      <p>{message}</p>
    </aside>
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
