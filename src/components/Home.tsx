import { useState } from 'react'
import type { Level, Mode } from '../types'
import { loadLastSelection, saveLastSelection } from '../storage/lastSelection'

type Props = {
  onSelectMode: (mode: Mode, level: Level) => void
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

export default function Home({ onSelectMode }: Props) {
  // 前回の選択を復元する。初回はむずかしさ=9まで、モードは未選択状態。
  const [lastSelection] = useState(() => loadLastSelection())
  const [level, setLevel] = useState<Level>(lastSelection?.level ?? 'single-digit')

  function handleSelectMode(mode: Mode) {
    saveLastSelection(mode, level)
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
              onClick={() => setLevel(l.level)}
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
              className={`mode-button ${m.className} ${
                m.mode === lastSelection?.mode ? 'mode-button-selected' : ''
              }`}
              onClick={() => handleSelectMode(m.mode)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
