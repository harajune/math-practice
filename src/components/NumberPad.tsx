type Props = {
  max: number // 0〜max のボタンを表示(仕様4)
  disabled: boolean
  onAnswer: (value: number) => void
}

// 回答用の数字ボタン。ワンタップで確定(確定ボタン・テキスト入力なし)。
export default function NumberPad({ max, disabled, onAnswer }: Props) {
  const numbers = Array.from({ length: max + 1 }, (_, i) => i)
  return (
    <div className={`number-pad ${max > 9 ? 'number-pad-wide' : ''}`}>
      {numbers.map((n) => (
        <button
          key={n}
          type="button"
          className="number-button"
          disabled={disabled}
          onClick={() => onAnswer(n)}
        >
          {n}
        </button>
      ))}
    </div>
  )
}
