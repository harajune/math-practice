import type { Mode, QuizResult } from '../types'

// 仕様6: LocalStorage にプレイ履歴を保存する。
const STORAGE_KEY = 'math-practice/history'
const MAX_HISTORY = 100

function isQuizResult(v: unknown): v is QuizResult {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    typeof o.playedAt === 'string' &&
    (o.mode === 'addition' || o.mode === 'subtraction' || o.mode === 'word-problem') &&
    typeof o.correctCount === 'number' &&
    typeof o.totalCount === 'number'
  )
}

export function loadHistory(): QuizResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isQuizResult)
  } catch {
    // 壊れたデータや LocalStorage 不可の環境では空履歴として扱う。
    return []
  }
}

// ローカルタイムゾーン付きの ISO8601 文字列(例: 2026-07-23T10:30:00+09:00)。
function localIsoNow(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const tzMin = -d.getTimezoneOffset()
  const sign = tzMin >= 0 ? '+' : '-'
  const abs = Math.abs(tzMin)
  const tz = `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${tz}`
  )
}

// セッション終了ごとに1件追記する。最新 MAX_HISTORY 件を保持。
export function appendHistory(params: {
  mode: Mode
  correctCount: number
  totalCount: number
}): void {
  const entry: QuizResult = {
    playedAt: localIsoNow(),
    mode: params.mode,
    correctCount: params.correctCount,
    totalCount: params.totalCount,
  }
  try {
    const history = loadHistory()
    history.push(entry)
    // 超過分は古いものから削除。
    const trimmed = history.slice(-MAX_HISTORY)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    // 保存できなくてもアプリ動作は継続する。
  }
}
