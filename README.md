# cam-cheat-sheet

シーン別のカメラ推奨設定と露出の3要素（F値・シャッタースピード・ISO）を、撮影前にサッと確認できるチートシート。GitHub Pages で公開する静的サイトです。

## 機能

- **露出シミュレーター**: 3つのダイヤル操作で露出オフセット（EV）と、ボケ量・ブレリスク・ノイズへの影響を確認
- **シーン別チートシート**: ポートレート・スポーツ・夜景など8シーンの推奨設定と解説
- **検索・タグ絞り込み**: シーン名検索と、目的タグ（AND条件）でのフィルタリング

## 技術スタック

- TypeScript 7（strict mode）
- Vite 8 + Tailwind CSS v4
- Vitest
- lucide（アイコン）
- DOM API のみでレンダリング（innerHTML 不使用）

## Requirements

- Node.js >= 22.12.0
- npm

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run typecheck   # tsc による型チェック
npm run lint        # ESLint
npm test            # Vitest
npm run build       # 本番ビルド（dist/）
```

## Deployment

`main` ブランチへの push で GitHub Actions（`.github/workflows/deploy.yml`）がビルドし、GitHub Pages へデプロイします。

初回のみ、リポジトリ設定で **Settings → Pages → Source を「GitHub Actions」** に変更してください。

## License

MIT
