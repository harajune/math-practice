import { useState } from 'react'
import type { Level, Mode } from './types'
import Home from './components/Home'
import Quiz from './components/Quiz'
import Result from './components/Result'

// URL遷移せず、アプリ内の状態で3画面を切り替える(仕様2)。
type Screen =
  | { name: 'home' }
  | { name: 'quiz'; mode: Mode; level: Level }
  | { name: 'result'; mode: Mode; level: Level; correctCount: number }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })

  return (
    <div className="app">
      {screen.name === 'home' && (
        <Home onSelectMode={(mode, level) => setScreen({ name: 'quiz', mode, level })} />
      )}

      {screen.name === 'quiz' && (
        <Quiz
          // mode+level を key にして、選択が変わったら Quiz を作り直す。
          key={`${screen.mode}:${screen.level}`}
          mode={screen.mode}
          level={screen.level}
          onFinish={(correctCount) =>
            setScreen({ name: 'result', mode: screen.mode, level: screen.level, correctCount })
          }
          onQuit={() => setScreen({ name: 'home' })}
        />
      )}

      {screen.name === 'result' && (
        <Result
          mode={screen.mode}
          correctCount={screen.correctCount}
          onReplay={() => setScreen({ name: 'quiz', mode: screen.mode, level: screen.level })}
          onHome={() => setScreen({ name: 'home' })}
        />
      )}
    </div>
  )
}
