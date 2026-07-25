import type { Level } from '../types'
import { readJson, writeJson } from './localJson'

// ホーム画面で前回選んだむずかしさを記憶し、次回ホームに戻った時に
// 選択済みの状態として表示するための LocalStorage。
const STORAGE_KEY = 'math-practice/last-level'

function isLevel(v: unknown): v is Level {
  return v === 'single-digit' || v === 'up-to-19'
}

export function loadLastLevel(): Level | null {
  const parsed = readJson(STORAGE_KEY)
  return isLevel(parsed) ? parsed : null
}

export function saveLastLevel(level: Level): void {
  writeJson(STORAGE_KEY, level)
}
