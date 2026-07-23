// アプリ全体で使う型定義

export type Mode = 'addition' | 'subtraction' | 'word-problem'

// 出題の内部演算種別(数字パッドの範囲を決める)。
// 文章題は足し算系/引き算系のどちらかになる。
export type Op = 'addition' | 'subtraction'

// 問題の表示内容。数式か文章のどちらか。
export type ProblemDisplay =
  | { type: 'equation'; a: number; b: number; operator: '+' | '-' }
  | { type: 'text'; text: string }

export type Problem = {
  // セッション内で同一問題を出さないための一意キー
  key: string
  // 内部演算(パッド範囲 0〜18 or 0〜9 の判定に使う)
  op: Op
  display: ProblemDisplay
  answer: number
}

export type QuizResult = {
  playedAt: string // ISO8601(タイムゾーン付き)
  mode: Mode
  correctCount: number
  totalCount: number
}
