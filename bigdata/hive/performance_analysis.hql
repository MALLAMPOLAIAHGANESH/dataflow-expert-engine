USE app_performance;
SELECT endpoint, COUNT(*) AS requests,
 ROUND(AVG(response_time_ms),2) AS avg_response_ms,
 ROUND(percentile_approx(response_time_ms,0.95),2) AS p95_response_ms,
 ROUND(100.0*SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END)/COUNT(*),2) AS error_rate_pct
FROM application_logs
GROUP BY endpoint
ORDER BY avg_response_ms DESC;

SELECT SUBSTR(event_time,1,13) AS event_hour, COUNT(*) AS requests
FROM application_logs
GROUP BY SUBSTR(event_time,1,13)
ORDER BY event_hour;


-- Map the Hive external table to the Pig output directory
CREATE EXTERNAL TABLE IF NOT EXISTS cleaned_app_performance (
    log_timestamp STRING,
    app_id STRING,
    endpoint STRING,
    response_time INT,
    status_code INT,
    cpu_utilization FLOAT
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
LOCATION '/data/processed/cleaned_logs';

-- Drop the old metrics table if you are re-running the pipeline
DROP TABLE IF EXISTS endpoint_metrics;

-- Calculate advanced metrics: P95, CPU, Error Rates
CREATE TABLE endpoint_metrics AS
SELECT 
    endpoint,
    COUNT(*) as total_requests,
    AVG(response_time) as avg_response_time,
    percentile_approx(response_time, 0.95) as p95_latency,
    AVG(cpu_utilization) as avg_cpu,
    SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) as server_errors,
    (SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as error_rate_pct
FROM cleaned_app_performance
GROUP BY endpoint;


DROP TABLE IF EXISTS endpoint_metrics;

CREATE TABLE endpoint_metrics AS
SELECT 
    endpoint,
    COUNT(*) as total_requests,
    AVG(response_time) as avg_response_time,
    percentile_approx(response_time, 0.95) as p95_latency,
    SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) as server_errors,
    (SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as error_rate_pct
FROM app_performance
GROUP BY endpoint;