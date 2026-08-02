import type { TetrisRecord } from '../types'
import Confetti from './Confetti'

type Props = {
  score: number
  lines: number
  level: number
  best: TetrisRecord | null
  newBest: boolean
  onRetry: () => void
  onHome: () => void
}

// 消したライン数に応じたねぎらい。責めない・こわがらせない演出にする(仕様5.2と同じ方針)。
function celebration(lines: number, newBest: boolean) {
  if (newBest) return { emoji: '👑', headline: 'じこベスト こうしん!', confetti: 120 }
  if (lines >= 10) return { emoji: '🌟', headline: 'たくさん けせたね!', confetti: 70 }
  if (lines >= 1) return { emoji: '🎀', headline: 'よく がんばったね!', confetti: 30 }
  return { emoji: '🌷', headline: 'また あそぼうね!', confetti: 0 }
}

export default function TetrisOver({ score, lines, level, best, newBest, onRetry, onHome }: Props) {
  const c = celebration(lines, newBest)

  return (
    <div className="tetris-overlay">
      {c.confetti > 0 && <Confetti count={c.confetti} />}

      <div className="tetris-panel">
        <div className="tetris-panel-emoji">{c.emoji}</div>
        <div className="tetris-panel-title">{c.headline}</div>

        <dl className="tetris-score-list">
          <div className="tetris-score-row">
            <dt>スコア</dt>
            <dd className="tetris-score-main">{score}</dd>
          </div>
          <div className="tetris-score-row">
            <dt>けした ライン</dt>
            <dd>{lines}</dd>
          </div>
          <div className="tetris-score-row">
            <dt>レベル</dt>
            <dd>{level}</dd>
          </div>
          {best && (
            <div className="tetris-score-row tetris-score-best">
              <dt>じこベスト</dt>
              <dd>{best.score}</dd>
            </div>
          )}
        </dl>

        <div className="result-buttons">
          <button type="button" className="big-button primary-button" onClick={onRetry}>
            もういちど
          </button>
          <button type="button" className="big-button secondary-button" onClick={onHome}>
            ホームへ
          </button>
        </div>
      </div>
    </div>
  )
}
