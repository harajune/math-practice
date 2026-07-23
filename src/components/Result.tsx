import type { Mode } from '../types'
import { TOTAL_QUESTIONS } from '../game/problems'
import Confetti from './Confetti'

type Props = {
  mode: Mode
  correctCount: number
  onReplay: () => void
  onHome: () => void
}

// 正解数に応じた演出(仕様5.3)。
function celebration(correct: number) {
  if (correct >= TOTAL_QUESTIONS) {
    return { emoji: '🏆', headline: 'ぜんもん せいかい!', confetti: 120, extraClass: 'result-perfect' }
  }
  if (correct >= 15) {
    return { emoji: '🌟', headline: 'すごいね!', confetti: 70, extraClass: 'result-great' }
  }
  return { emoji: '💪', headline: 'よく がんばったね!', confetti: 0, extraClass: 'result-good' }
}

export default function Result({ correctCount, onReplay, onHome }: Props) {
  const c = celebration(correctCount)

  return (
    <div className={`screen result ${c.extraClass}`}>
      {c.confetti > 0 && <Confetti count={c.confetti} />}

      <div className="result-emoji">{c.emoji}</div>
      <div className="result-headline">{c.headline}</div>

      <div className="result-score">
        {TOTAL_QUESTIONS}もんちゅう <span className="result-score-num">{correctCount}</span>もん せいかい!
      </div>

      <div className="result-buttons">
        <button type="button" className="big-button primary-button" onClick={onReplay}>
          もういちど
        </button>
        <button type="button" className="big-button secondary-button" onClick={onHome}>
          ホームへ
        </button>
      </div>
    </div>
  )
}
