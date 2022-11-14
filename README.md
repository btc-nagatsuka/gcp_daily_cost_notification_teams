# 前提
- Node.js: v.16
- 以下作業が完了していること
  - Cloud BillingデータをBigQueryにエクスポートする
  - BigQueryのスケジュールクエリを作成し、Pub/Subトピックにパブリッシュする
    - スケジュールクエリ：daily_cost_shcedule.sql
  - Pub/Subトピックを作成する
    - Pub/Subトピック名：daily_cost_notification_teams
  - Pub/Subトピックをトリガーに起動するCloud Functionsを作成する
    - Functions名：daily_cost_func_teams
  - Cloud FunctionsからTeamsのチャネルにメッセージを投稿するためのIncoming Webhookを作成する

# 手順
1. 本資源（Cloud Functions関連のソースコード）を自分の環境の任意のディレクトリに配置する
2. gcloud CLI をインストールする
   - https://cloud.google.com/sdk/docs/install?hl=ja
3. gcloud CLIから以下コマンドを実行し、GCP上にCloud Functionsをデプロイする

# 補足
- GCPのCloud Functions編集画面のブラウザ上でソースコードを編集・デプロイすることも可能

# コマンド
```
# ライブラリをインストール（依存関係を解決）
npm i

# Cloud Functionsをデプロイ
gcloud functions deploy daily_cost_func_teams --region=asia-northeast1 --runtime=nodejs16 --source={任意のパス}\gcp_daily_cost_notification_teams --entry-point=getPJDailyCost --trigger-topic=daily_cost_notification_teams
```