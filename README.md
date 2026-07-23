# けいさん れんしゅう(子供向け 足し算・引き算 練習Web)

小学一年生向けの足し算・引き算・文章題を1問ずつ練習できる静的SPA。
仕様は [`docs/02_specifications.md`](./docs/02_specifications.md) を参照。

## モード

- **たしざん**: 一桁の足し算 20問(答え 2〜18)
- **ひきざん**: 一桁の引き算 20問(答えは常に0以上、0〜9)
- **ぶんしょうだい**: 足し算・引き算の文章題 20問(足し算系10・引き算系10を混合)

文章題は同梱テンプレート(足し算50・引き算50、合計100種)に、実行時に乱数で
数値と題材を差し込んで生成する(生成AIの実行時呼び出しはしない)。

## 技術

- Vite + React + TypeScript の静的SPA
- 状態保存は LocalStorage のみ(キー: `math-practice/history`、最新100件)
- サーバー・DB不要。初回ロード後はオフラインでも動作

## 開発

```bash
npm install
npm run dev        # 開発サーバー
npm run typecheck  # 型チェック
npm test           # 出題ロジックのユニットテスト(vitest)
npm run build      # 本番ビルド(dist/ を出力)
npm run preview    # ビルド結果をローカル確認
```

## デプロイ(Cloudflare Pages)

静的アセットのみのため、Cloudflare Pages にそのまま配置できる。

- ビルドコマンド: `npm run build`
- 出力ディレクトリ: `dist`
- Workers・DB・サーバーサイド処理は不要(インフラコスト最小)

## ソース構成

```
src/
  App.tsx                 3画面(ホーム/問題/結果)の状態遷移
  components/             Home / Quiz / Result / NumberPad / Feedback / Confetti
  game/
    problems.ts           出題生成(重複なし20問)
    wordTemplates.ts       文章題テンプレート100種 + 題材
    messages.ts / rng.ts  正解メッセージ / 乱数ユーティリティ
  storage/history.ts      LocalStorage のプレイ履歴
  styles/index.css        スマホ縦持ち基準のレスポンシブUI
```
