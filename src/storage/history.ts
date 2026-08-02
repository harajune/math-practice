import type { Level, Mode, QuizResult } from '../types'
import { localIsoNow } from './isoTime'
import { readJson, writeJson } from './localJson'

// 仕様6: LocalStorage にプレイ履歴を保存する。
const STORAGE_KEY = 'math-practice/history'
const MAX_HISTORY = 100

// level 追加前の旧データには level が存在しないため、single-digit として扱う。
function normalizeLevel(v: unknown): Level | null {
  if (v === undefined) return 'single-digit'
  if (v === 'single-digit' || v === 'up-to-19') return v
  return null
}

function isQuizResult(v: unknown): v is QuizResult {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    typeof o.playedAt === 'string' &&
    (o.mode === 'addition' || o.mode === 'subtraction' || o.mode === 'word-problem') &&
    normalizeLevel(o.level) !== null &&
    typeof o.correctCount === 'number' &&
    typeof o.totalCount === 'number'
  )
}

export function loadHistory(): QuizResult[] {
  const parsed = readJson(STORAGE_KEY)
  if (!Array.isArray(parsed)) return []
  return parsed.filter(isQuizResult).map((r) => ({ ...r, level: normalizeLevel(r.level) ?? 'single-digit' }))
}

// セッション終了ごとに1件追記する。最新 MAX_HISTORY 件を保持。
export function appendHistory(params: {
  mode: Mode
  level: Level
  correctCount: number
  totalCount: number
}): void {
  const entry: QuizResult = {
    playedAt: localIsoNow(),
    mode: params.mode,
    level: params.level,
    correctCount: params.correctCount,
    totalCount: params.totalCount,
  }
  const history = loadHistory()
  history.push(entry)
  // 超過分は古いものから削除。
  const trimmed = history.slice(-MAX_HISTORY)
  writeJson(STORAGE_KEY, trimmed)
}
