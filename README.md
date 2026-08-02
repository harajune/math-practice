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

### SNSシェア時の画像表示(OGP)

`VITE_SITE_URL` をビルド時に `index.html` の og:url / og:image / twitter:image へ
埋め込む(X・Facebookでシェアした際に `public/ogp.png` がプレビュー画像として
表示される)。環境依存の値のため `.env` はコミットせず、`.env.example` をコピーして使う。

- **ローカル開発**: `.env.example` を `.env` にコピーし、必要なら値を書き換える(`.env` は gitignore 済み)
- **Cloudflare Pages**: Environment variables に何も設定しなくてよい。`vite.config.ts`
  がビルド時に Cloudflare 標準の `CF_PAGES_BRANCH` / `CF_PAGES_URL` を見て自動判定する
  (Cloudflare Pages の Environment variables は Production/Preview を分けて設定できない
  ため、この判定はコード側に持たせている)
  - 本番ブランチ(`main`)のビルド → `https://keisan-renshu.com` を固定で使用
  - それ以外のブランチ(プレビュー)のビルド → デプロイごとに異なる `CF_PAGES_URL`
    (プレビューURL)をそのまま使用
  - 本番ブランチ名やドメインを変える場合は `vite.config.ts` の
    `PRODUCTION_BRANCH` / `PRODUCTION_SITE_URL` を書き換える

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
