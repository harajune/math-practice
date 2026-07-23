import { useMemo } from 'react'
import { randInt, pick } from '../game/rng'

type Props = {
  count?: number
}

const COLORS = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#c084fc', '#f472b6']

// 依存ライブラリなしの軽量な紙吹雪。CSSアニメーションで落下する。
export default function Confetti({ count = 40 }: Props) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: randInt(0, 100),
        delay: randInt(0, 600),
        duration: randInt(1200, 2400),
        color: pick(COLORS),
        size: randInt(8, 14),
        rotate: randInt(0, 360),
      })),
    [count],
  )

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 1.4}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}ms`,
            animationDuration: `${p.duration}ms`,
            ['--rot' as string]: `${p.rotate}deg`,
          }}
        />
      ))}
    </div>
  )
}
