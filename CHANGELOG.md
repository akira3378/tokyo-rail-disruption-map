# Changelog

## 2026-07-07 - 公開用 main ブランチ整理

- README を日本語中心の公開ポートフォリオ向け内容に更新しました。
- 既存の OSM/Overpass による路線位置候補表示を説明に反映しました。
- 公開向けではない補足データ取得処理と内部メモを削除しました。
- ODPT、server API、型定義、mapper、React component、theme token を中心に構成を整理しました。

## 2026-07-06 - UI スタイルと整形設定の整理

- Prettier と Tailwind CSS 向けの整形設定を追加しました。
- グローバル CSS の色や状態表示を theme token 中心に整理しました。
- 路線状態ごとの表示スタイルを `src/components/rail-map/styles.ts` に分離しました。
- 既存コンポーネントの表示ロジックと文言を整え、公開版 README にも反映しました。

## 2026-07-04 - 公開ポートフォリオ版

- 公開ポートフォリオとして見せるために、データソースと説明を ODPT 中心に整理しました。
- 実装の焦点を ODPT、server API、型付きの変換処理、地図の概要表示に絞りました。
- 一時的なメモや公開向けではない実験的なデータ取得処理を公開ブランチから除外しました。
- README を日本語中心に整理し、demo URL と技術的な判断理由を追加しました。

## 2026-07-03 - ODPT ライブデータと表示方針の変更

- ODPT Railway と TrainInformation のライブデータ取得を実装しました。
- ブラウザに ODPT consumer key を渡さないため、`/api/railway-snapshot` を追加しました。
- ODPT の JSON-LD 形式をそのまま UI に渡さず、アプリ内の `RailwaySnapshot` に正規化する構成にしました。
- 独自 SVG 路線図から、無料地図タイルと路線位置候補を使う方向へ変更しました。

## 2026-07-01 - ドメインモデルとコンポーネント分割

- railway、incident、status、snapshot を TypeScript の型として整理しました。
- ODPT の source type、変換処理、データ取得処理、UI 用 model の責務を分離しました。
- panel、map overview、detail rendering を担当ごとに React component として分割しました。
- formatter や詳細表示用 model を追加し、表示ロジックが component に集中しすぎないようにしました。

## 2026-06-30 - MVP プロトタイプ

- 東京圏の鉄道運行異常 dashboard の最初の prototype を作成しました。
- mock の運行異常データ、異常路線の選択、詳細 panel を実装しました。
- 多言語 UI、theme 切り替え、zoom 操作、responsive layout を追加しました。
- ODPT などの open data を後から接続できるように、初期のデータ取得層を用意しました。
