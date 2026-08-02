import { describe, expect, it } from 'vitest'
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  PIECE_TYPES,
  type Board,
  type GameState,
  type PieceType,
  canPlace,
  cellsOf,
  clearRowsAndSpawn,
  createBoard,
  createGame,
  dropToBottom,
  ghostPiece,
  gravityMs,
  isLanded,
  lockPiece,
  moveHorizontal,
  rotate,
  softDrop,
} from './tetris'

// テスト用に、盤面と落下中のミノを指定した状態を作る。
function stateWith(board: Board, piece: GameState['current']): GameState {
  return {
    board,
    current: piece,
    queue: ['O', 'O', 'O'],
    score: 0,
    lines: 0,
    level: 1,
    difficulty: 'single-digit',
    over: false,
  }
}

// 指定した行を、あけておく列(hole)以外すべて埋める。
function fillRow(board: Board, y: number, hole: number | null, type: PieceType = 'I'): void {
  for (let x = 0; x < BOARD_WIDTH; x++) {
    board[y][x] = x === hole ? null : type
  }
}

describe('createGame', () => {
  it('空の盤面と落下中のミノで始まる', () => {
    const g = createGame('single-digit')
    expect(g.board).toHaveLength(BOARD_HEIGHT)
    expect(g.board[0]).toHaveLength(BOARD_WIDTH)
    expect(g.board.flat().every((c) => c === null)).toBe(true)
    expect(g.current).not.toBeNull()
    expect(g.score).toBe(0)
    expect(g.lines).toBe(0)
    expect(g.level).toBe(1)
    expect(g.over).toBe(false)
  })

  it('つぎのミノが2つ以上たまっている', () => {
    const g = createGame('single-digit')
    expect(g.queue.length).toBeGreaterThanOrEqual(2)
  })

  it('7種1巡のバッグなので、最初の7個に全種類が1回ずつ出る', () => {
    for (let trial = 0; trial < 20; trial++) {
      const g = createGame('single-digit')
      const first7 = [g.current!.type, ...g.queue.slice(0, 6)]
      expect(new Set(first7).size).toBe(7)
      expect([...first7].sort()).toEqual([...PIECE_TYPES].sort())
    }
  })
})

describe('canPlace', () => {
  it('左右の壁の外には置けない', () => {
    const board = createBoard()
    expect(canPlace(board, { type: 'O', rotation: 0, x: -1, y: 0 })).toBe(false)
    expect(canPlace(board, { type: 'O', rotation: 0, x: BOARD_WIDTH - 1, y: 0 })).toBe(false)
    expect(canPlace(board, { type: 'O', rotation: 0, x: BOARD_WIDTH - 2, y: 0 })).toBe(true)
  })

  it('床より下には置けない', () => {
    const board = createBoard()
    expect(canPlace(board, { type: 'O', rotation: 0, x: 0, y: BOARD_HEIGHT - 2 })).toBe(true)
    expect(canPlace(board, { type: 'O', rotation: 0, x: 0, y: BOARD_HEIGHT - 1 })).toBe(false)
  })

  it('すでに埋まっているマスには重ねられない', () => {
    const board = createBoard()
    board[5][3] = 'T'
    expect(canPlace(board, { type: 'O', rotation: 0, x: 3, y: 4 })).toBe(false)
    expect(canPlace(board, { type: 'O', rotation: 0, x: 5, y: 4 })).toBe(true)
  })
})

describe('moveHorizontal', () => {
  it('動かせる時は新しい状態を返す', () => {
    const g = stateWith(createBoard(), { type: 'O', rotation: 0, x: 4, y: 0 })
    expect(moveHorizontal(g, -1).current!.x).toBe(3)
    expect(moveHorizontal(g, 1).current!.x).toBe(5)
  })

  it('壁に当たる時は同じ状態を返す(何も起きない)', () => {
    const g = stateWith(createBoard(), { type: 'O', rotation: 0, x: 0, y: 0 })
    expect(moveHorizontal(g, -1)).toBe(g)
  })
})

describe('rotate', () => {
  it('回転すると形が変わる', () => {
    const g = stateWith(createBoard(), { type: 'T', rotation: 0, x: 4, y: 4 })
    expect(rotate(g).current!.rotation).toBe(1)
  })

  it('4回まわすと元に戻る', () => {
    let g = stateWith(createBoard(), { type: 'T', rotation: 0, x: 4, y: 4 })
    for (let i = 0; i < 4; i++) g = rotate(g)
    expect(g.current!.rotation).toBe(0)
  })

  it('壁ぎわでも位置をずらして回せる(ウォールキック)', () => {
    // 左端に密着した I ミノ。横向き→縦向きはそのままだと壁にめり込む。
    const g = stateWith(createBoard(), { type: 'I', rotation: 0, x: -1, y: 4 })
    const rotated = rotate(g)
    expect(rotated).not.toBe(g)
    expect(rotated.current!.rotation).toBe(1)
    expect(canPlace(rotated.board, rotated.current!)).toBe(true)
  })

  it('まわりが埋まっていて回せない時は何も起きない', () => {
    const board = createBoard()
    // I ミノの縦回転先をすべてふさぐ。
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (!(y === 5 && x >= 3 && x <= 6)) board[y][x] = 'Z'
      }
    }
    const g = stateWith(board, { type: 'I', rotation: 0, x: 3, y: 4 })
    expect(rotate(g)).toBe(g)
  })
})

describe('落下', () => {
  it('softDrop は1マス下がって1点入る', () => {
    const g = stateWith(createBoard(), { type: 'O', rotation: 0, x: 4, y: 0 })
    const next = softDrop(g)
    expect(next.current!.y).toBe(1)
    expect(next.score).toBe(1)
  })

  it('dropToBottom は床まで落ちて、落ちたマス数×2点入る', () => {
    const g = stateWith(createBoard(), { type: 'O', rotation: 0, x: 4, y: 0 })
    const next = dropToBottom(g)
    expect(next.current!.y).toBe(BOARD_HEIGHT - 2)
    expect(next.score).toBe((BOARD_HEIGHT - 2) * 2)
  })

  it('積まれたブロックの上で止まる', () => {
    const board = createBoard()
    fillRow(board, BOARD_HEIGHT - 1, null)
    const g = stateWith(board, { type: 'O', rotation: 0, x: 4, y: 0 })
    expect(dropToBottom(g).current!.y).toBe(BOARD_HEIGHT - 3)
  })

  it('ghostPiece は落ちる先を示す', () => {
    const g = stateWith(createBoard(), { type: 'O', rotation: 0, x: 4, y: 0 })
    expect(ghostPiece(g)).toEqual({ type: 'O', rotation: 0, x: 4, y: BOARD_HEIGHT - 2 })
  })

  it('isLanded は床に着いた時だけ true', () => {
    const board = createBoard()
    expect(isLanded(stateWith(board, { type: 'O', rotation: 0, x: 4, y: 0 }))).toBe(false)
    expect(isLanded(stateWith(board, { type: 'O', rotation: 0, x: 4, y: BOARD_HEIGHT - 2 }))).toBe(true)
  })
})

describe('lockPiece', () => {
  it('ミノを盤面に固定する', () => {
    const g = stateWith(createBoard(), { type: 'O', rotation: 0, x: 4, y: BOARD_HEIGHT - 2 })
    const { state, fullRows } = lockPiece(g)
    expect(state.current).toBeNull()
    expect(state.board[BOARD_HEIGHT - 1][4]).toBe('O')
    expect(state.board[BOARD_HEIGHT - 1][5]).toBe('O')
    expect(fullRows).toEqual([])
  })

  it('そろった行を fullRows で返すが、盤面からはまだ消さない', () => {
    const board = createBoard()
    fillRow(board, BOARD_HEIGHT - 1, 4)
    fillRow(board, BOARD_HEIGHT - 2, 4)
    // 1×2 のすき間を O ミノでふさぐ → 2行そろう。
    const g = stateWith(board, { type: 'O', rotation: 0, x: 3, y: BOARD_HEIGHT - 2 })
    const { state, fullRows } = lockPiece(g)
    expect(fullRows).toEqual([BOARD_HEIGHT - 2, BOARD_HEIGHT - 1])
    expect(state.board[BOARD_HEIGHT - 1].every((c) => c !== null)).toBe(true)
  })
})

describe('clearRowsAndSpawn', () => {
  it('そろった行が消えて、上の行が下がる', () => {
    const board = createBoard()
    fillRow(board, BOARD_HEIGHT - 1, null, 'I')
    board[BOARD_HEIGHT - 2][0] = 'T'
    const g = { ...stateWith(board, null), score: 0 }
    const next = clearRowsAndSpawn(g, [BOARD_HEIGHT - 1])

    expect(next.lines).toBe(1)
    // 上に乗っていたブロックが1段下がる。
    expect(next.board[BOARD_HEIGHT - 1][0]).toBe('T')
    expect(next.board[BOARD_HEIGHT - 2][0]).toBeNull()
    // 盤面の高さは変わらない。
    expect(next.board).toHaveLength(BOARD_HEIGHT)
    expect(next.board.every((row) => row.length === BOARD_WIDTH)).toBe(true)
  })

  it('1〜4ラインでスコアが増える(4ライン=テトリスが一番高い)', () => {
    const base = stateWith(createBoard(), null)
    const scoreFor = (rows: number[]) => clearRowsAndSpawn(base, rows).score
    expect(scoreFor([])).toBe(0)
    expect(scoreFor([19])).toBe(100)
    expect(scoreFor([18, 19])).toBe(300)
    expect(scoreFor([17, 18, 19])).toBe(500)
    expect(scoreFor([16, 17, 18, 19])).toBe(800)
  })

  it('スコアは現在のレベル倍になる', () => {
    const g = { ...stateWith(createBoard(), null), level: 3 }
    expect(clearRowsAndSpawn(g, [19]).score).toBe(300)
  })

  it('10ラインごとにレベルが上がる', () => {
    const g = { ...stateWith(createBoard(), null), lines: 9 }
    expect(clearRowsAndSpawn(g, [19]).level).toBe(2)
    expect(clearRowsAndSpawn({ ...g, lines: 19 }, [19]).level).toBe(3)
  })

  it('次のミノが出て、キューが減る', () => {
    const g = stateWith(createBoard(), null)
    const next = clearRowsAndSpawn(g, [])
    expect(next.current).not.toBeNull()
    expect(next.current!.type).toBe('O')
    expect(next.queue.length).toBeGreaterThanOrEqual(2)
  })

  it('出現位置がふさがっているとゲームオーバー', () => {
    const board = createBoard()
    for (let y = 0; y < 4; y++) fillRow(board, y, null)
    const next = clearRowsAndSpawn(stateWith(board, null), [])
    expect(next.over).toBe(true)
    expect(next.current).toBeNull()
  })
})

describe('gravityMs', () => {
  it('かんたんの方がゆっくり落ちる', () => {
    const easy = createGame('single-digit')
    const hard = createGame('up-to-19')
    expect(gravityMs(easy)).toBeGreaterThan(gravityMs(hard))
  })

  it('レベルが上がるほど速くなるが、下限より速くはならない', () => {
    const g = createGame('single-digit')
    expect(gravityMs({ ...g, level: 5 })).toBeLessThan(gravityMs(g))
    expect(gravityMs({ ...g, level: 99 })).toBe(gravityMs({ ...g, level: 100 }))
    expect(gravityMs({ ...g, level: 99 })).toBeGreaterThan(0)
  })
})

describe('cellsOf', () => {
  it('どのミノもどの向きでも4マス', () => {
    for (const type of PIECE_TYPES) {
      for (let rotation = 0; rotation < 4; rotation++) {
        expect(cellsOf({ type, rotation, x: 0, y: 0 })).toHaveLength(4)
      }
    }
  })
})
