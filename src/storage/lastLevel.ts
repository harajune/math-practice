import type { Level } from '../types'

// ホーム画面で前回選んだむずかしさを記憶し、次回ホームに戻った時に
// 選択済みの状態として表示するための LocalStorage。
const STORAGE_KEY = 'math-practice/last-level'

function isLevel(v: unknown): v is Level {
  return v === 'single-digit' || v === 'up-to-19'
}

export function loadLastLevel(): Level | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isLevel(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

export function saveLastLevel(level: Level): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(level))
  } catch {
    // 保存できなくてもアプリ動作は継続する。
  }
}
