import { useState } from 'react'
import type { Level, Mode } from '../types'
import { loadLastLevel, saveLastLevel } from '../storage/lastLevel'

type Props = {
  onSelectMode: (mode: Mode, level: Level) => void
  onSelectTetris: (level: Level) => void
}

// 仕様2.1: タイトルとモード選択ボタン3つ。文言はすべてひらがな。
const MODES: { mode: Mode; label: string; className: string }[] = [
  { mode: 'addition', label: 'たしざん', className: 'mode-addition' },
  { mode: 'subtraction', label: 'ひきざん', className: 'mode-subtraction' },
  { mode: 'word-problem', label: 'ぶんしょうだい', className: 'mode-word' },
]

// 出題する数の範囲。モードとは独立して選べる。
const LEVELS: { level: Level; label: string }[] = [
  { level: 'single-digit', label: 'かんたん' },
  { level: 'up-to-19', label: 'ちょいむず' },
]

export default function Home({ onSelectMode, onSelectTetris }: Props) {
  const [level, setLevel] = useState<Level>(() => loadLastLevel() ?? 'single-digit')

  function handleSelectLevel(level: Level) {
    setLevel(level)
    saveLastLevel(level)
  }

  function handleSelectMode(mode: Mode) {
    onSelectMode(mode, level)
  }

  return (
    <div className="screen home">
      <h1 className="home-title">
        <span className="home-title-emoji">🧮</span>
        けいさん れんしゅう
      </h1>
      <p className="home-subtitle">すきな もんだいを えらんでね</p>

      <div className="option-group">
        <p className="option-group-label">むずかしさ</p>
        <div className="level-list" role="group" aria-label="むずかしさ">
          {LEVELS.map((l) => (
            <button
              key={l.level}
              type="button"
              className={`level-button ${l.level === level ? 'level-button-selected' : ''}`}
              aria-pressed={l.level === level}
              onClick={() => handleSelectLevel(l.level)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="option-group">
        <p className="option-group-label">モード</p>
        <div className="mode-list">
          {MODES.map((m) => (
            <button
              key={m.mode}
              type="button"
              className={`mode-button ${m.className}`}
              onClick={() => handleSelectMode(m.mode)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="option-group">
        <p className="option-group-label">あそぶ</p>
        <div className="mode-list">
          <button
            type="button"
            className="mode-button mode-tetris"
            onClick={() => onSelectTetris(level)}
          >
            <span className="mode-button-emoji">🍰</span>
            きらきら テトリス
          </button>
        </div>
      </div>
    </div>
  )
}
