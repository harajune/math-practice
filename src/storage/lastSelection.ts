import type { Level, Mode } from '../types'

// ホーム画面で前回選んだモード・むずかしさを記憶し、次回ホームに戻った時に
// 選択済みの状態として表示するための LocalStorage。
const STORAGE_KEY = 'math-practice/last-selection'

type LastSelection = { mode: Mode; level: Level }

function isMode(v: unknown): v is Mode {
  return v === 'addition' || v === 'subtraction' || v === 'word-problem'
}

function isLevel(v: unknown): v is Level {
  return v === 'single-digit' || v === 'up-to-19'
}

export function loadLastSelection(): LastSelection | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    const o = parsed as Record<string, unknown>
    if (!isMode(o.mode) || !isLevel(o.level)) return null
    return { mode: o.mode, level: o.level }
  } catch {
    return null
  }
}

export function saveLastSelection(mode: Mode, level: Level): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, level }))
  } catch {
    // 保存できなくてもアプリ動作は継続する。
  }
}
