// LocalStorage への JSON 読み書きの共通処理。
// 壊れたデータ・LocalStorage 不可の環境では例外を握りつぶし、呼び出し側でフォールバックを扱う。

export function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return undefined
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 保存できなくてもアプリ動作は継続する。
  }
}
