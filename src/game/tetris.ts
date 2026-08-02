// テトリスモードのゲームロジック。React に依存しない純粋関数で実装し、単体テストで検証する。
import type { Level } from '../types'
import { shuffle } from './rng'

export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

export const PIECE_TYPES: readonly PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']

export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 20

// 空きマスは null、埋まったマスはそのミノの種類を持つ(色分けのため)。
export type Cell = PieceType | null
// board[row][col]。row 0 が一番上。
export type Board = Cell[][]

export type Piece = {
  type: PieceType
  // 0〜3。時計回りに90度ずつ。
  rotation: number
  // 形状マトリクスの左上が盤面のどこに来るか。
  x: number
  y: number
}

export type GameState = {
  board: Board
  // 落下中のミノ。固定してから次が出るまでの間だけ null になる。
  current: Piece | null
  // これから出てくるミノの列(7種1巡のバッグから補充する)。
  queue: PieceType[]
  score: number
  lines: number
  level: number
  // むずかしさ由来の落下スピード設定。
  difficulty: Level
  over: boolean
}

// ===== 形状 =====

// 回転前の基本形。1 が埋まっているマス。
const BASE_SHAPES: Record<PieceType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
}

// 正方行列を時計回りに90度回す。
function rotateMatrix(m: number[][]): number[][] {
  const n = m.length
  return m.map((row, i) => row.map((_, j) => m[n - 1 - j][i]))
}

// 各ミノの4方向ぶんの形状をあらかじめ作っておく。
export const SHAPES: Record<PieceType, number[][][]> = (() => {
  const out = {} as Record<PieceType, number[][][]>
  for (const type of PIECE_TYPES) {
    const states: number[][][] = [BASE_SHAPES[type]]
    for (let i = 1; i < 4; i++) states.push(rotateMatrix(states[i - 1]))
    out[type] = states
  }
  return out
})()

export function shapeOf(piece: Piece): number[][] {
  return SHAPES[piece.type][piece.rotation % 4]
}

// ミノが占める盤面座標の一覧。
export function cellsOf(piece: Piece): { x: number; y: number }[] {
  const shape = shapeOf(piece)
  const cells: { x: number; y: number }[] = []
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) cells.push({ x: piece.x + c, y: piece.y + r })
    }
  }
  return cells
}

// ===== 盤面 =====

export function createBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () => Array<Cell>(BOARD_WIDTH).fill(null))
}

// 置けるか判定する。盤面の上にはみ出す(y < 0)のは出現直後だけなので許容する。
export function canPlace(board: Board, piece: Piece): boolean {
  for (const { x, y } of cellsOf(piece)) {
    if (x < 0 || x >= BOARD_WIDTH) return false
    if (y >= BOARD_HEIGHT) return false
    if (y >= 0 && board[y][x] !== null) return false
  }
  return true
}

// 出現位置。だいたい中央の一番上に置く。
function spawnPiece(type: PieceType): Piece {
  const width = SHAPES[type][0].length
  return { type, rotation: 0, x: Math.floor((BOARD_WIDTH - width) / 2), y: 0 }
}

// ===== スピード =====

// むずかしさ別の落下スピード。かんたんはゆっくり始まり、上がり方もゆるやか。
const SPEED: Record<Level, { start: number; step: number; min: number }> = {
  'single-digit': { start: 1100, step: 70, min: 380 },
  'up-to-19': { start: 800, step: 60, min: 220 },
}

// 1マス落ちるまでのミリ秒。
export function gravityMs(state: GameState): number {
  const s = SPEED[state.difficulty]
  return Math.max(s.min, s.start - (state.level - 1) * s.step)
}

// 何ライン消すごとにレベルが上がるか。
export const LINES_PER_LEVEL = 10

// ===== キュー =====

// 7種1巡のバッグ方式。同じミノばかり続かないので子供がつまりにくい。
function refill(queue: PieceType[]): PieceType[] {
  const next = queue.slice()
  while (next.length <= 2) next.push(...shuffle(PIECE_TYPES))
  return next
}

// ===== ゲーム操作 =====
// 状態を変えられなかった場合は同じオブジェクトをそのまま返す(呼び出し側で変化を判定できる)。

export function createGame(difficulty: Level): GameState {
  const queue = refill([])
  const current = spawnPiece(queue[0])
  return {
    board: createBoard(),
    current,
    queue: queue.slice(1),
    score: 0,
    lines: 0,
    level: 1,
    difficulty,
    over: false,
  }
}

export function moveHorizontal(state: GameState, dx: number): GameState {
  if (!state.current || state.over) return state
  const moved = { ...state.current, x: state.current.x + dx }
  if (!canPlace(state.board, moved)) return state
  return { ...state, current: moved }
}

// 壁ぎわでも回せるように、少しずらして置き直す(ウォールキック)。
const KICKS: readonly (readonly [number, number])[] = [
  [0, 0],
  [-1, 0],
  [1, 0],
  [-2, 0],
  [2, 0],
  [0, -1],
]

export function rotate(state: GameState): GameState {
  if (!state.current || state.over) return state
  const rotated = { ...state.current, rotation: (state.current.rotation + 1) % 4 }
  for (const [dx, dy] of KICKS) {
    const candidate = { ...rotated, x: rotated.x + dx, y: rotated.y + dy }
    if (canPlace(state.board, candidate)) return { ...state, current: candidate }
  }
  return state
}

// 落下中のミノがこれ以上下がれない(=接地している)か。
export function isLanded(state: GameState): boolean {
  if (!state.current || state.over) return false
  return !canPlace(state.board, { ...state.current, y: state.current.y + 1 })
}

// 重力で1マス落とす。落ちられなければ何もしない(固定は呼び出し側の責務)。
export function applyGravity(state: GameState): GameState {
  if (!state.current || state.over) return state
  const moved = { ...state.current, y: state.current.y + 1 }
  if (!canPlace(state.board, moved)) return state
  return { ...state, current: moved }
}

// プレイヤー操作の下移動。1マスごとに1点。
export function softDrop(state: GameState): GameState {
  const next = applyGravity(state)
  if (next === state) return state
  return { ...next, score: next.score + 1 }
}

// 一番下まで一気に落とす。1マスごとに2点。
export function dropToBottom(state: GameState): GameState {
  if (!state.current || state.over) return state
  let piece = state.current
  let dropped = 0
  while (canPlace(state.board, { ...piece, y: piece.y + 1 })) {
    piece = { ...piece, y: piece.y + 1 }
    dropped++
  }
  if (dropped === 0) return state
  return { ...state, current: piece, score: state.score + dropped * 2 }
}

// 落ちる先の予測位置(ゴースト)。
export function ghostPiece(state: GameState): Piece | null {
  if (!state.current || state.over) return null
  let piece = state.current
  while (canPlace(state.board, { ...piece, y: piece.y + 1 })) {
    piece = { ...piece, y: piece.y + 1 }
  }
  return piece
}

// ミノを盤面に固定する。そろった行は fullRows で返すだけで、盤面からはまだ消さない
// (消える瞬間をピカッと光らせる演出のため)。
export function lockPiece(state: GameState): { state: GameState; fullRows: number[] } {
  if (!state.current || state.over) return { state, fullRows: [] }
  const board = state.board.map((row) => row.slice())
  for (const { x, y } of cellsOf(state.current)) {
    if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) board[y][x] = state.current.type
  }
  const fullRows: number[] = []
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    if (board[y].every((c) => c !== null)) fullRows.push(y)
  }
  return { state: { ...state, board, current: null }, fullRows }
}

// 同時に消したライン数ごとの基本点。
const LINE_SCORE = [0, 100, 300, 500, 800]

// そろった行を消してスコアを加算し、次のミノを出す。出せなければゲームオーバー。
export function clearRowsAndSpawn(state: GameState, fullRows: number[]): GameState {
  let board = state.board
  if (fullRows.length > 0) {
    const remove = new Set(fullRows)
    const kept = board.filter((_, y) => !remove.has(y))
    const empty = Array.from({ length: fullRows.length }, () => Array<Cell>(BOARD_WIDTH).fill(null))
    board = [...empty, ...kept]
  }

  const lines = state.lines + fullRows.length
  const level = Math.floor(lines / LINES_PER_LEVEL) + 1
  const score = state.score + LINE_SCORE[fullRows.length] * state.level

  const queue = refill(state.queue)
  const next = spawnPiece(queue[0])
  const spawned = { ...state, board, lines, level, score, queue: queue.slice(1) }

  if (!canPlace(board, next)) {
    return { ...spawned, current: null, over: true }
  }
  return { ...spawned, current: next }
}
