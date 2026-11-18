CREATE DATABASE IF NOT EXISTS app_performance;
USE app_performance;

-- Point LOCATION at the HDFS directory containing the cleaned CSV files.
CREATE EXTERNAL TABLE IF NOT EXISTS application_logs (
 request_id STRING, event_time STRING, user_id STRING, endpoint STRING,
 method STRING, response_time_ms DOUBLE, status_code INT, service_name STRING,
 payload_size BIGINT, error_message STRING
)
ROW FORMAT DELIMITED FIELDS TERMINATED BY ','
STORED AS TEXTFILE
LOCATION '/app-performance/processed/hive_input'
TBLPROPERTIES ('skip.header.line.count'='1');

CREATE EXTERNAL TABLE IF NOT EXISTS app_performance (
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
