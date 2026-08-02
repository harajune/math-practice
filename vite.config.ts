import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cloudflare Pages の Environment variables は Production/Preview を分けて設定できないため、
// ビルド時に Cloudflare が自動注入する CF_PAGES_BRANCH / CF_PAGES_URL から判定する。
// - 本番ブランチ(main)のビルド → 本番ドメインを固定で使う
// - それ以外(Preview)のビルド → デプロイ固有の CF_PAGES_URL を使う
// - ローカル開発など Cloudflare 外のビルド → .env の VITE_SITE_URL をそのまま使う
const PRODUCTION_BRANCH = 'main'
const PRODUCTION_SITE_URL = 'https://keisan-renshu.com'

if (!process.env.VITE_SITE_URL && process.env.CF_PAGES) {
  process.env.VITE_SITE_URL =
    process.env.CF_PAGES_BRANCH === PRODUCTION_BRANCH ? PRODUCTION_SITE_URL : process.env.CF_PAGES_URL
}

// 静的SPA。Cloudflare Pages へ dist をデプロイする。
export default defineConfig({
  plugins: [react()],
  base: './',
})
