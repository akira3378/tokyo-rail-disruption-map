# Tokyo Rail Disruption Map

[English](#english) / [Demo](https://tokyo-rail-disruption-map.vercel.app)

東京圏の鉄道運行情報を、ODPT の公開データと地図表示で確認するための Next.js ポートフォリオプロジェクトです。現在の実装では、ブラウザから直接 ODPT を呼び出さず、サーバー API でデータを取得してから UI 用の型に変換しています。

## 概要

このプロジェクトでは、東京圏の鉄道運行情報を題材に、外部 API 連携、型定義、データ変換、React コンポーネント分割、レスポンシブ UI、テーマ切り替え、多言語対応をまとめて実装しています。

## ポートフォリオ上の位置づけ

このプロジェクトは、第三者データを扱うアプリケーションの設計を示すものです。ODPT の公開データを server API で取得し、外部データをアプリ内の domain model に変換して地図 UI へ渡します。対して [Nothing Journal](https://github.com/akira3378/nothing-journal) は、Supabase Auth、Postgres、Storage、Realtime を使った認証付きコンテンツサービスとして、ユーザーとデータの関係を設計するプロジェクトです。

このプロジェクトではユーザーアカウントや投稿データベースを持たず、外部 API の取得境界、秘密情報の扱い、データ変換、表示の信頼性を主な設計対象にしています。

当初は独自の SVG 路線図で表示する案を検討しましたが、取得できる路線位置データが路線ごとに十分そろっていなかったため、無料の地図タイルと ODPT の運行情報を組み合わせる構成に変更しました。選択された異常路線については、サーバー側で OSM/Overpass から路線位置の候補を取得し、地図上に表示します。

## デモ

- 公開 URL: [https://tokyo-rail-disruption-map.vercel.app](https://tokyo-rail-disruption-map.vercel.app)
- GitHub: [https://github.com/akira3378/tokyo-rail-disruption-map](https://github.com/akira3378/tokyo-rail-disruption-map)

## 主な機能

- ODPT Railway / TrainInformation の取得と UI 用データへの変換
- `/api/railway-snapshot` による server-only API key 管理
- 異常路線の一覧、状態表示、詳細パネル
- OpenStreetMap / OpenRailwayMap タイルを使った地図表示
- OSM/Overpass を使った選択路線の位置候補表示
- 日本語、中国語、英語の UI 切り替え
- ライト / ダークテーマ切り替え
- TypeScript による railway、incident、snapshot などの型定義
- React コンポーネントの分割と表示用 helper の整理
- Prettier と Tailwind CSS 向けの整形設定

## 技術スタック

- Next.js
- React
- TypeScript
- Tailwind CSS
- ODPT API
- OpenStreetMap / OpenRailwayMap
- OSM Overpass API
- Vercel

## 構成

```text
src/
  app/
    api/railway-snapshot/route.ts
    globals.css
    layout.tsx
    page.tsx
  components/
    rail-disruption-map.tsx
    rail-map/
      panels.tsx
      railway-tile-overview.tsx
      styles.ts
  lib/
    data-access.ts
    i18n.ts
    providers/
      odpt-live-provider.ts
      snapshot-builder.ts
    sources/
      odpt/
      osm/
        line-geo-index.ts
    types.ts
```

## データの流れ

```text
Browser
  -> /api/railway-snapshot
  -> ODPT Railway / TrainInformation
  -> TypeScript mapper
  -> RailwaySnapshot
  -> React UI
```

ODPT の API key はサーバー環境変数 `ODPT_API_KEY` として扱い、ブラウザには渡しません。クライアント側はこのアプリの API route だけを呼び出します。

## 開発で意識した点

- 日本の公共交通オープンデータを扱うための source type と mapper の分離
- 外部 API の返却形式をそのまま UI に渡さず、アプリ内の domain model に変換
- API key を frontend bundle に含めない server route 設計
- UI 文言を typed dictionary として管理し、多言語切り替えに対応
- 地図タイル、路線候補、運行情報をそれぞれ別の責務として扱う構成
- 状態色や表示スタイルを共通 token / helper として整理

## セットアップ

```bash
npm install
npm run dev
```

ローカル実行時は `.env.local` に ODPT の consumer key を設定します。

```bash
ODPT_API_KEY=your_odpt_consumer_key
```

## チェックコマンド

```bash
npm run lint
npm run format:check
npm run build
```

## 今後の改善案

- より完全で更新性の高い運行情報データソースへの対応
- 地図上での路線・影響範囲表示の改善

## English

Tokyo Rail Disruption Map is a Next.js portfolio project for viewing railway operation information in the Tokyo metropolitan area. It integrates ODPT open transport data with a map-based frontend and keeps the ODPT API key on the server side.

The project started with an SVG-based route map idea, but the available route-position data was not complete enough across the target lines. The current version therefore uses free map tiles, ODPT operation data, and a small server-side OSM/Overpass lookup for selected disrupted lines.

### Features

- ODPT Railway / TrainInformation ingestion
- Server API route that keeps `ODPT_API_KEY` out of the browser
- Disrupted-line list, status display, and detail panel
- OpenStreetMap / OpenRailwayMap tile overview
- OSM/Overpass lookup for selected line geometry candidates
- Japanese, Chinese, and English UI copy
- Light and dark themes
- TypeScript domain types for railways, incidents, and snapshots
- Split React components and reusable display helpers
- Prettier and Tailwind CSS formatting setup

### Data Flow

```text
Browser
  -> /api/railway-snapshot
  -> ODPT Railway / TrainInformation
  -> TypeScript mapper
  -> RailwaySnapshot
  -> React UI
```

### Development Notes

This project focuses on common frontend engineering work seen in real API-backed applications: third-party API integration, server/client boundaries, environment-variable handling, typed source adapters, domain modeling, component decomposition, responsive layout, i18n, theme switching, and deployment to Vercel.

### Portfolio Positioning

Tokyo Rail Disruption Map is the external-data integration project in the portfolio. It demonstrates how to keep a third-party API key on the server, normalize provider-specific payloads, and expose a stable application-facing snapshot. The companion [Nothing Journal](https://github.com/akira3378/nothing-journal) demonstrates a different boundary: authenticated users, owned content, Supabase persistence, and access control.

### Future Improvements

- Support more complete and timely operation-information data sources
- Improve route and affected-area visualization on the map
