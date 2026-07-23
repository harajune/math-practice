import { useState } from 'react'
import type { Mode } from './types'
import Home from './components/Home'
import Quiz from './components/Quiz'
import Result from './components/Result'

// URL遷移せず、アプリ内の状態で3画面を切り替える(仕様2)。
type Screen =
  | { name: 'home' }
  | { name: 'quiz'; mode: Mode }
  | { name: 'result'; mode: Mode; correctCount: number }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })

  return (
    <div className="app">
      {screen.name === 'home' && (
        <Home onSelectMode={(mode) => setScreen({ name: 'quiz', mode })} />
      )}

      {screen.name === 'quiz' && (
        <Quiz
          // mode を key にして、モードが変わったら Quiz を作り直す。
          key={screen.mode}
          mode={screen.mode}
          onFinish={(correctCount) =>
            setScreen({ name: 'result', mode: screen.mode, correctCount })
          }
          onQuit={() => setScreen({ name: 'home' })}
        />
      )}

      {screen.name === 'result' && (
        <Result
          mode={screen.mode}
          correctCount={screen.correctCount}
          onReplay={() => setScreen({ name: 'quiz', mode: screen.mode })}
          onHome={() => setScreen({ name: 'home' })}
        />
      )}
    </div>
  )
}
