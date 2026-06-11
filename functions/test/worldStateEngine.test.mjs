import assert from 'node:assert/strict'
import test from 'node:test'
import { Timestamp } from 'firebase-admin/firestore'
import {
  applyWorldStateEffect,
  createInitialWorldState,
  worldStateEventCatalog,
} from '../lib/worldState/engine.js'

function apply(current, type, isoDate) {
  return applyWorldStateEffect({
    current,
    effect: worldStateEventCatalog[type],
    eventType: type,
    occurredAt: Timestamp.fromDate(new Date(isoDate)),
  })
}

test('project events update centralized XP, momentum, studio, and counters', () => {
  const initial = createInitialWorldState(
    Timestamp.fromDate(new Date('2026-06-01T12:00:00.000Z')),
  )
  const afterTask = apply(
    initial,
    'project_task_completed',
    '2026-06-01T12:01:00.000Z',
  )
  const afterMilestone = apply(
    afterTask,
    'project_milestone_completed',
    '2026-06-01T12:02:00.000Z',
  )

  assert.equal(afterMilestone.xp.creator, 60)
  assert.equal(afterMilestone.xp.total, 60)
  assert.equal(afterMilestone.creatorLevel, 2)
  assert.equal(afterMilestone.momentum.score, 28)
  assert.equal(afterMilestone.momentum.level, 2)
  assert.equal(afterMilestone.studioProgress.tasksCompleted, 1)
  assert.equal(afterMilestone.studioProgress.milestonesCompleted, 1)
  assert.equal(afterMilestone.eventCount, 2)
})

test('reflection and storybook events update their projections', () => {
  const initial = createInitialWorldState()
  const afterJournal = apply(
    initial,
    'journal_entry_created',
    '2026-06-01T12:00:00.000Z',
  )
  const afterChapter = apply(
    afterJournal,
    'storybook_chapter_created',
    '2026-06-01T12:05:00.000Z',
  )

  assert.equal(afterChapter.xp.reflection, 10)
  assert.equal(afterChapter.reflection.entries, 1)
  assert.equal(afterChapter.reflection.score, 15)
  assert.equal(afterChapter.storybookProgress.chaptersCreated, 1)
  assert.equal(afterChapter.storybookProgress.score, 17)
})

test('daily check-ins calculate current and best consistency streaks', () => {
  const initial = createInitialWorldState()
  const dayOne = apply(
    initial,
    'daily_check_in_completed',
    '2026-06-01T12:00:00.000Z',
  )
  const dayTwo = apply(
    dayOne,
    'daily_check_in_completed',
    '2026-06-02T12:00:00.000Z',
  )
  const afterGap = apply(
    dayTwo,
    'daily_check_in_completed',
    '2026-06-05T12:00:00.000Z',
  )

  assert.equal(dayTwo.consistency.currentStreak, 2)
  assert.equal(afterGap.consistency.currentStreak, 1)
  assert.equal(afterGap.consistency.bestStreak, 2)
  assert.equal(afterGap.consistency.score, 30)
  assert.equal(afterGap.consistency.level, 2)
})

