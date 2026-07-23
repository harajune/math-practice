type Props = {
  choices: number[] // 正解を含む回答選択肢(仕様: 重複なし)
  disabled: boolean
  onAnswer: (value: number) => void
}

// 回答用の数字ボタン。ワンタップで確定(確定ボタン・テキスト入力なし)。
export default function NumberPad({ choices, disabled, onAnswer }: Props) {
  return (
    <div className="number-pad">
      {choices.map((n) => (
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
