import type { Mode } from '../types'

type Props = {
  onSelectMode: (mode: Mode) => void
}

// 仕様2.1: タイトルとモード選択ボタン3つ。文言はすべてひらがな。
const MODES: { mode: Mode; label: string; className: string }[] = [
  { mode: 'addition', label: 'たしざん', className: 'mode-addition' },
  { mode: 'subtraction', label: 'ひきざん', className: 'mode-subtraction' },
  { mode: 'word-problem', label: 'ぶんしょうだい', className: 'mode-word' },
]

export default function Home({ onSelectMode }: Props) {
  return (
    <div className="screen home">
      <h1 className="home-title">
        <span className="home-title-emoji">🧮</span>
        けいさん れんしゅう
      </h1>
      <p className="home-subtitle">すきな もんだいを えらんでね</p>

      <div className="mode-list">
        {MODES.map((m) => (
          <button
            key={m.mode}
            type="button"
            className={`mode-button ${m.className}`}
            onClick={() => onSelectMode(m.mode)}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  )
}
