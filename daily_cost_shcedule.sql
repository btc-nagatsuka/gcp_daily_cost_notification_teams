SELECT
        DATE(TIMESTAMP_ADD(usage_start_time, INTERVAL 9 HOUR)) AS query_date,
        project.name,
        service.description,
        SUM(cost) AS cost,
        currency
FROM
        {プロジェクトID}.{データセット名}.{テーブル名}
GROUP BY 
        query_date,
        project.name,
        service.description,
        currency
HAVING
        query_date =  DATE_ADD(DATE(TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL 9 HOUR)), INTERVAL -1 DAY)
ORDER BY
        query_date;