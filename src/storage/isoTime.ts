// ローカルタイムゾーン付きの ISO8601 文字列(例: 2026-07-23T10:30:00+09:00)。
// プレイ履歴・テトリスの記録で共通に使う。
export function localIsoNow(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const tzMin = -d.getTimezoneOffset()
  const sign = tzMin >= 0 ? '+' : '-'
  const abs = Math.abs(tzMin)
  const tz = `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${tz}`
  )
}
