import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Level, TetrisRecord } from '../types'
import {
  BOARD_WIDTH,
  type GameState,
  type PieceType,
  SHAPES,
  cellsOf,
  clearRowsAndSpawn,
  createGame,
  dropToBottom,
  ghostPiece,
  gravityMs,
  isLanded,
  applyGravity,
  lockPiece,
  moveHorizontal,
  rotate,
  softDrop,
} from '../game/tetris'
import { loadTetrisBest, saveTetrisBestIfBetter } from '../storage/tetrisBest'
import Confetti from './Confetti'
import TetrisOver from './TetrisOver'

type Props = {
  level: Level
  onHome: () => void
}

type Phase = 'playing' | 'paused' | 'clearing' | 'over'

// 接地してから固定されるまでの猶予。あわてず置きなおせるようにする。
const LOCK_DELAY_MS = 600
// 猶予のリセット回数の上限(いつまでも固定されない状態を防ぐ)。
const MAX_LOCK_RESETS = 10
// ラインが消える瞬間のピカッと光る演出の長さ。
const CLEAR_MS = 450

// ミノごとのスイーツ。色は CSS の .tetris-cell-X 側で指定する。
const PIECE_EMOJI: Record<PieceType, string> = {
  I: '🍭',
  O: '🧁',
  T: '🌸',
  S: '🍀',
  Z: '🍓',
  J: '⭐',
  L: '🍩',
}

// 同時に消したライン数ごとのごほうび文言。
const CLEAR_LABEL = ['', 'いいね!', 'ナイス!', 'すごい!', 'テトリス!!']

type ViewCell = { type: PieceType | null; ghost: boolean }

// 盤面・ゴースト・落下中のミノを重ねて、描画用の1枚のマス目にする。
function buildView(game: GameState): ViewCell[][] {
  const cells: ViewCell[][] = game.board.map((row) => row.map((type) => ({ type, ghost: false })))

  const ghost = ghostPiece(game)
  if (ghost) {
    for (const { x, y } of cellsOf(ghost)) {
      if (y >= 0 && !cells[y][x].type) cells[y][x] = { type: ghost.type, ghost: true }
    }
  }
  if (game.current) {
    for (const { x, y } of cellsOf(game.current)) {
      if (y >= 0) cells[y][x] = { type: game.current.type, ghost: false }
    }
  }
  return cells
}

// つぎのミノのミニ表示(4×4)。
function NextPiece({ type }: { type: PieceType | undefined }) {
  if (!type) return <div className="tetris-next-grid" aria-hidden="true" />
  const shape = SHAPES[type][0]
  return (
    <div className="tetris-next-grid" aria-hidden="true">
      {Array.from({ length: 4 }, (_, r) =>
        Array.from({ length: 4 }, (_, c) => {
          const filled = shape[r]?.[c] === 1
          return (
            <span
              key={`${r}-${c}`}
              className={filled ? `tetris-next-cell tetris-cell-${type}` : 'tetris-next-cell'}
            >
              {filled ? PIECE_EMOJI[type] : ''}
            </span>
          )
        }),
      )}
    </div>
  )
}

export default function Tetris({ level, onHome }: Props) {
  // ゲーム状態はここが正本。描画用に game state へ写す。
  const gameRef = useRef<GameState>(createGame(level))
  const [game, setGame] = useState<GameState>(gameRef.current)
  const [phase, setPhase] = useState<Phase>('playing')
  const phaseRef = useRef<Phase>('playing')
  // 消える瞬間に光らせる行。
  const [flashRows, setFlashRows] = useState<number[]>([])
  // ライン消しのお祝い演出。
  const [cheer, setCheer] = useState<{ id: number; count: number } | null>(null)
  const cheerIdRef = useRef(0)
  const [best, setBest] = useState<TetrisRecord | null>(() => loadTetrisBest(level))
  const [newBest, setNewBest] = useState(false)
  // 接地してからの経過時間と、置きなおしで猶予をリセットした回数。
  const lockRef = useRef({ elapsed: 0, resets: 0 })
  const timersRef = useRef<number[]>([])

  const setPhaseBoth = useCallback((next: Phase) => {
    phaseRef.current = next
    setPhase(next)
  }, [])

  const commit = useCallback((next: GameState) => {
    gameRef.current = next
    setGame(next)
  }, [])

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      for (const id of timers) window.clearTimeout(id)
    }
  }, [])

  // ミノを固定して、そろった行があれば光らせてから消す。
  const lockNow = useCallback(() => {
    const { state, fullRows } = lockPiece(gameRef.current)
    lockRef.current = { elapsed: 0, resets: 0 }

    if (fullRows.length === 0) {
      const next = clearRowsAndSpawn(state, [])
      commit(next)
      if (next.over) setPhaseBoth('over')
      return
    }

    commit(state)
    setFlashRows(fullRows)
    cheerIdRef.current += 1
    setCheer({ id: cheerIdRef.current, count: fullRows.length })
    setPhaseBoth('clearing')

    const id = window.setTimeout(() => {
      const next = clearRowsAndSpawn(state, fullRows)
      commit(next)
      setFlashRows([])
      setPhaseBoth(next.over ? 'over' : 'playing')
      // 紙吹雪が降りきるまで演出を残す。
      const hide = window.setTimeout(() => setCheer(null), 1400)
      timersRef.current.push(hide)
    }, CLEAR_MS)
    timersRef.current.push(id)
  }, [commit, setPhaseBoth])

  // プレイヤー操作。状態が変わった時だけ固定の猶予をリセットする。
  const applyAction = useCallback(
    (fn: (s: GameState) => GameState) => {
      if (phaseRef.current !== 'playing') return
      const next = fn(gameRef.current)
      if (next === gameRef.current) return
      commit(next)
      if (lockRef.current.resets < MAX_LOCK_RESETS) {
        lockRef.current.elapsed = 0
        lockRef.current.resets += 1
      }
    },
    [commit],
  )

  const moveLeft = useCallback(() => applyAction((s) => moveHorizontal(s, -1)), [applyAction])
  const moveRight = useCallback(() => applyAction((s) => moveHorizontal(s, 1)), [applyAction])
  const turn = useCallback(() => applyAction(rotate), [applyAction])
  const drop1 = useCallback(() => applyAction(softDrop), [applyAction])

  const hardDrop = useCallback(() => {
    if (phaseRef.current !== 'playing') return
    commit(dropToBottom(gameRef.current))
    lockNow()
  }, [commit, lockNow])

  // ゲームループ。経過時間を足し込む方式なので、端末の描画速度に左右されない。
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    let fallElapsed = 0

    const step = (now: number) => {
      raf = requestAnimationFrame(step)
      // タブが裏に回った直後などの大きな飛びは無視する。
      const dt = Math.min(now - last, 100)
      last = now

      if (phaseRef.current !== 'playing') {
        fallElapsed = 0
        return
      }
      const state = gameRef.current
      if (!state.current) return

      if (isLanded(state)) {
        lockRef.current.elapsed += dt
        if (lockRef.current.elapsed >= LOCK_DELAY_MS) {
          fallElapsed = 0
          lockNow()
        }
        return
      }

      lockRef.current.elapsed = 0
      fallElapsed += dt
      if (fallElapsed >= gravityMs(state)) {
        fallElapsed = 0
        const next = applyGravity(state)
        if (next !== state) commit(next)
      }
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [commit, lockNow])

  // キーボード操作(PC用)。タッチ操作と同じことができる。
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.repeat && (e.key === ' ' || e.key === 'ArrowUp')) return
      switch (e.key) {
        case 'ArrowLeft':
          moveLeft()
          break
        case 'ArrowRight':
          moveRight()
          break
        case 'ArrowDown':
          drop1()
          break
        case 'ArrowUp':
        case 'x':
        case 'X':
          turn()
          break
        case ' ':
          hardDrop()
          break
        default:
          return
      }
      e.preventDefault()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [moveLeft, moveRight, drop1, turn, hardDrop])

  // 画面を離れたら自動でひとやすみ(戻ってきた時にいきなり負けない)。
  useEffect(() => {
    function onHidden() {
      if (document.hidden && phaseRef.current === 'playing') setPhaseBoth('paused')
    }
    document.addEventListener('visibilitychange', onHidden)
    return () => document.removeEventListener('visibilitychange', onHidden)
  }, [setPhaseBoth])

  // ゲームオーバー時に自己ベストを保存する。
  useEffect(() => {
    if (phase !== 'over') return
    const state = gameRef.current
    if (state.score <= 0) return
    const previous = loadTetrisBest(level)
    const updated = saveTetrisBestIfBetter(level, {
      score: state.score,
      lines: state.lines,
      level: state.level,
    })
    if (!updated) return
    setBest(loadTetrisBest(level))
    // はじめての記録は「こうしん」ではないので、2回目以降だけお祝いする。
    if (previous) setNewBest(true)
  }, [phase, level])

  function restart() {
    for (const id of timersRef.current) window.clearTimeout(id)
    timersRef.current = []
    lockRef.current = { elapsed: 0, resets: 0 }
    setFlashRows([])
    setCheer(null)
    setNewBest(false)
    commit(createGame(level))
    setPhaseBoth('playing')
  }

  // ===== 盤面のゆび操作 =====
  // よこにすべらせて移動、下にすべらせて落下、下へスッとはらうとストン、
  // トンとタップでまわす。操作はこの盤面だけで完結する。
  const boardRef = useRef<HTMLDivElement>(null)
  const swipeRef = useRef<{
    id: number
    x: number
    y: number
    startX: number
    startY: number
    startTime: number
    moved: boolean
  } | null>(null)

  // 指がどれだけ動いたら1マスぶんとみなすか(マスの大きさに合わせる)。
  function stepPx(): number {
    return Math.max(18, (boardRef.current?.clientWidth ?? 240) / BOARD_WIDTH)
  }

  function onBoardPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (phaseRef.current !== 'playing') return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    swipeRef.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      startTime: performance.now(),
      moved: false,
    }
  }

  function onBoardPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const s = swipeRef.current
    if (!s || s.id !== e.pointerId) return
    // 1マスぶん指が動くごとに1マス動かす。
    const step = stepPx()

    let dx = e.clientX - s.x
    while (Math.abs(dx) >= step) {
      const dir = dx > 0 ? 1 : -1
      if (dir > 0) moveRight()
      else moveLeft()
      s.x += dir * step
      dx = e.clientX - s.x
      s.moved = true
    }

    while (e.clientY - s.y >= step) {
      drop1()
      s.y += step
      s.moved = true
    }
  }

  function onBoardPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const s = swipeRef.current
    swipeRef.current = null
    if (!s || s.id !== e.pointerId) return

    const dx = e.clientX - s.startX
    const dy = e.clientY - s.startY

    // ほとんど動かさずに離した=タップ → まわす。
    if (!s.moved && Math.hypot(dx, dy) < 12) {
      turn()
      return
    }
    // 下へ speedy にはらった → ストン(いっきに落として固定)。
    const elapsed = performance.now() - s.startTime
    if (dy > stepPx() * 2 && elapsed < 260 && dy > Math.abs(dx) * 1.5) hardDrop()
  }

  const view = useMemo(() => buildView(game), [game])
  const flashSet = useMemo(() => new Set(flashRows), [flashRows])

  return (
    <div className="screen tetris">
      <div className="tetris-topbar">
        <button type="button" className="quit-button" onClick={onHome}>
          やめる
        </button>

        <div className="tetris-stats">
          <div className="tetris-stat">
            <span className="tetris-stat-label">スコア</span>
            <span className="tetris-stat-value">{game.score}</span>
          </div>
          <div className="tetris-stat">
            <span className="tetris-stat-label">ライン</span>
            <span className="tetris-stat-value">{game.lines}</span>
          </div>
          <div className="tetris-stat">
            <span className="tetris-stat-label">レベル</span>
            <span className="tetris-stat-value">{game.level}</span>
          </div>
        </div>

        <div className="tetris-next">
          <span className="tetris-stat-label">つぎ</span>
          <NextPiece type={game.queue[0]} />
        </div>
      </div>

      {/* ライン消しの演出中も、ボタンが消えてガタつかないように出しておく。 */}
      {(phase === 'playing' || phase === 'clearing') && (
        <button
          type="button"
          className="tetris-pause-button"
          disabled={phase !== 'playing'}
          onClick={() => setPhaseBoth('paused')}
        >
          ⏸ ひとやすみ
        </button>
      )}
      {phase !== 'playing' && phase !== 'clearing' && <div className="tetris-pause-spacer" />}

      <div className="tetris-stage">
        <div
          ref={boardRef}
          className="tetris-board"
          role="group"
          aria-label="テトリスの ばんめん"
          onPointerDown={onBoardPointerDown}
          onPointerMove={onBoardPointerMove}
          onPointerUp={onBoardPointerUp}
          onPointerCancel={onBoardPointerUp}
          onContextMenu={(e) => e.preventDefault()}
        >
          {view.map((row, y) =>
            row.map((cell, x) => {
              const classes = ['tetris-cell']
              if (cell.type) classes.push(`tetris-cell-${cell.type}`)
              if (cell.ghost) classes.push('tetris-cell-ghost')
              if (flashSet.has(y)) classes.push('tetris-cell-flash')
              return (
                <span key={`${y}-${x}`} className={classes.join(' ')} aria-hidden="true">
                  {cell.type && !cell.ghost ? PIECE_EMOJI[cell.type] : ''}
                </span>
              )
            }),
          )}
        </div>
      </div>

      <div className="tetris-hint">
        <span className="tetris-hint-item">👆 トンで まわる</span>
        <span className="tetris-hint-item">↔️ ゆびで よこに うごかす</span>
        <span className="tetris-hint-item">👇 したへ スッ で ストン!</span>
      </div>

      {cheer && (
        <div className="tetris-cheer" key={cheer.id} aria-hidden="true">
          <Confetti count={cheer.count >= 4 ? 120 : cheer.count * 20} />
          <div className={`tetris-cheer-text ${cheer.count >= 4 ? 'tetris-cheer-tetris' : ''}`}>
            {cheer.count >= 4 && <span className="tetris-cheer-rainbow">🌈</span>}
            {CLEAR_LABEL[cheer.count]}
          </div>
        </div>
      )}

      {phase === 'paused' && (
        <div className="tetris-overlay">
          <div className="tetris-panel">
            <div className="tetris-panel-emoji">🍵</div>
            <div className="tetris-panel-title">ひとやすみ</div>
            <div className="result-buttons">
              <button
                type="button"
                className="big-button primary-button"
                onClick={() => setPhaseBoth('playing')}
              >
                つづける
              </button>
              <button type="button" className="big-button secondary-button" onClick={onHome}>
                ホームへ
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'over' && (
        <TetrisOver
          score={game.score}
          lines={game.lines}
          level={game.level}
          best={best}
          newBest={newBest}
          onRetry={restart}
          onHome={onHome}
        />
      )}
    </div>
  )
}
