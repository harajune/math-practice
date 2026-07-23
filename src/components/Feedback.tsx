import Confetti from './Confetti'

type Props = {
  correct: boolean
  correctAnswer: number
  message: string
}

// 回答直後の正誤フィードバック(仕様5.1 / 5.2)。
export default function Feedback({ correct, correctAnswer, message }: Props) {
  return (
    <div className={`feedback feedback-${correct ? 'correct' : 'wrong'}`} role="status" aria-live="assertive">
      {correct && <Confetti count={36} />}
      <div className="feedback-mark">{correct ? '⭕' : '❌'}</div>
      {correct ? (
        <div className="feedback-message">{message}</div>
      ) : (
        <div className="feedback-message">こたえは {correctAnswer} だよ</div>
      )}
    </div>
  )
}
