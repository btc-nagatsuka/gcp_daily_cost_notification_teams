const { BigQuery } = require('@google-cloud/bigquery');
const IncomingWebhook = require('ms-teams-webhook').IncomingWebhook;
require('date-utils');

/**
 * Generic background Cloud Function to be triggered by Pub/Sub.
 *
 * @param {object} event The event payload.
 * @param {object} context The event metadata.
 */
exports.getPJDailyCost = ( async (event, context) => {
  // Bigqueryクライアントを初期化
  const projectId = 'XXXX-XXXX'; // gcp project id
  const bigquery = new BigQuery({
      projectId: projectId,
  });
  const datasetName = 'transaction_dataset';
  const tableName = 'transaction'
  const projectName = 'XXXX'; // gcp project name
  
  const query = `SELECT
    name as project,
    description as service,
    round(sum(cost * 100)) / 100 as cost
    FROM ${projectId}.${datasetName}.${tableName}
    WHERE 1=1
    and name = '${projectName}'
    and query_date = DATE_SUB(CURRENT_DATE('Asia/Tokyo'), INTERVAL 1 DAY)
    and cost >= 0.01
    GROUP BY project, service
    ORDER BY project, service`;

  console.log(`query: ${query}`);

  const queryOptions = {
    query: query,
    useLegacySql: false,
  };

  // BigQuery transactionデータを取得しTeamsアラートメッセージを作成
  try{
    // Wait for the query to finish
    const [rows] = await bigquery.query(queryOptions);

    let bqResult = "";
    let total = 0;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      bqResult += row.service + '\t$' + row.cost + '\n\n';
      console.log(bqResult);
      total += row.cost; 
    }
    bqResult += '----------------------------------------------' + '\n'
    bqResult += '合計 $' + (Math.floor(total * Math.pow(10, 2)) / Math.pow(10, 2)) + '\n';

    const dt = new Date();
    dt.setDate(dt.getDate() - 1);
    const yesterday = dt.toFormat("YYYY/MM/DD");

    // Teamsメッセージ作成
    let alertMessage = 'GCPXXXプロジェクト請求情報 (' + yesterday + ' 0:00 - 23:59)' + '\n\n';
    alertMessage += '```' + '\n' + bqResult + '\n';
    alertMessage += '※ 金額は、ディスカウント適用前で、端数切捨てです。';
    console.log(`alertMessage: ${alertMessage}`);

    // Teamsにメッセージ送信
    const url = 'https://xxx.webhook.office.com/webhookb2/xxx/IncomingWebhook/xxx/xxx';
    const webhook = new IncomingWebhook(url);

    await webhook.send({
        text: alertMessage,
    });
    console.log('Temas Message transfer completed.')
  } catch (error) {
    console.log(error);
  }
});