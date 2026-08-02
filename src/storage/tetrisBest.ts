import type { Level, TetrisRecord } from '../types'
import { localIsoNow } from './isoTime'
import { readJson, writeJson } from './localJson'

// テトリスモードの自己ベストを、むずかしさごとに保存する。
const STORAGE_KEY = 'math-practice/tetris-best'

type BestMap = Partial<Record<Level, TetrisRecord>>

function isRecord(v: unknown): v is TetrisRecord {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    typeof o.playedAt === 'string' &&
    typeof o.score === 'number' &&
    typeof o.lines === 'number' &&
    typeof o.level === 'number'
  )
}

function loadAll(): BestMap {
  const parsed = readJson(STORAGE_KEY)
  if (typeof parsed !== 'object' || parsed === null) return {}
  const o = parsed as Record<string, unknown>
  const out: BestMap = {}
  for (const level of ['single-digit', 'up-to-19'] as const) {
    if (isRecord(o[level])) out[level] = o[level]
  }
  return out
}

export function loadTetrisBest(level: Level): TetrisRecord | null {
  return loadAll()[level] ?? null
}

// スコアが自己ベストを超えていれば保存する。更新したかどうかを返す。
export function saveTetrisBestIfBetter(
  level: Level,
  result: { score: number; lines: number; level: number },
): boolean {
  const all = loadAll()
  const prev = all[level]
  if (prev && prev.score >= result.score) return false
  all[level] = {
    playedAt: localIsoNow(),
    score: result.score,
    lines: result.lines,
    level: result.level,
  }
  writeJson(STORAGE_KEY, all)
  return true
}
