import { useEffect, useRef, useState } from 'react'
import type { Mode } from '../types'
import { generateProblems, TOTAL_QUESTIONS } from '../game/problems'
import { CORRECT_MESSAGES } from '../game/messages'
import { pick } from '../game/rng'
import { appendHistory } from '../storage/history'
import NumberPad from './NumberPad'
import Feedback from './Feedback'

type Props = {
  mode: Mode
  onFinish: (correctCount: number) => void
  onQuit: () => void
}

type Phase =
  | { kind: 'answering' }
  | { kind: 'feedback'; correct: boolean; correctAnswer: number; message: string }

const CORRECT_MS = 1000
const WRONG_MS = 1500

export default function Quiz({ mode, onFinish, onQuit }: Props) {
  // 20問を生成してからセッション開始(仕様3.4)。
  const [problems] = useState(() => generateProblems(mode))
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>({ kind: 'answering' })
  const correctCountRef = useRef(0)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [])

  const current = problems[index]
  const questionNo = index + 1
  const progressPct = (questionNo / TOTAL_QUESTIONS) * 100

  function handleAnswer(value: number) {
    if (phase.kind !== 'answering') return
    const isCorrect = value === current.answer
    if (isCorrect) correctCountRef.current += 1

    setPhase({
      kind: 'feedback',
      correct: isCorrect,
      correctAnswer: current.answer,
      message: pick(CORRECT_MESSAGES),
    })

    const delay = isCorrect ? CORRECT_MS : WRONG_MS
    timerRef.current = window.setTimeout(() => {
      if (index + 1 >= problems.length) {
        // セッション完了時のみ履歴に保存(「やめる」では保存しない)。
        appendHistory({
          mode,
          correctCount: correctCountRef.current,
          totalCount: problems.length,
        })
        onFinish(correctCountRef.current)
      } else {
        setIndex((i) => i + 1)
        setPhase({ kind: 'answering' })
      }
    }, delay)
  }

  return (
    <div className="screen quiz">
      <div className="quiz-topbar">
        <button type="button" className="quit-button" onClick={onQuit}>
          やめる
        </button>
        <div className="progress">
          <div className="progress-text">
            {questionNo} / {TOTAL_QUESTIONS}
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      <div className="quiz-body">
        {current.display.type === 'equation' ? (
          <div className="equation">
            {current.display.a} {current.display.operator} {current.display.b} = <span className="equation-q">?</span>
          </div>
        ) : (
          <p className="word-problem">{current.display.text}</p>
        )}
      </div>

      <NumberPad
        choices={current.choices}
        disabled={phase.kind !== 'answering'}
        onAnswer={handleAnswer}
      />
      <div className="quiz-pad-spacer" />

      {phase.kind === 'feedback' && (
        <Feedback
          correct={phase.correct}
          correctAnswer={phase.correctAnswer}
          message={phase.message}
        />
      )}
    </div>
  )
}
