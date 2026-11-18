-- Run with: pig -param INPUT=/app-performance/raw/logs.csv -param OUTPUT=/app-performance/pig/cleaned clean_logs.pig
-- Input CSV must have the documented 10-column schema and no embedded commas in fields.
raw = LOAD '$INPUT' USING PigStorage(',') AS
 (request_id:chararray, timestamp:chararray, user_id:chararray, endpoint:chararray,
  method:chararray, response_time_ms:double, status_code:int, service_name:chararray,
  payload_size:long, error_message:chararray);
-- Skip header row. In production, prefer a header-aware loader or preprocess header separately.
data = FILTER raw BY request_id IS NOT NULL AND request_id != 'request_id';
valid = FILTER data BY timestamp IS NOT NULL AND response_time_ms IS NOT NULL
 AND response_time_ms >= 0 AND status_code >= 100 AND status_code <= 599;
dedup = DISTINCT valid;
STORE dedup INTO '$OUTPUT' USING PigStorage(',');


-- Load the raw 10,000 records from HDFS
raw_logs = LOAD '/data/raw/app_logs.csv' USING PigStorage(',') 
    AS (timestamp:chararray, app_id:chararray, endpoint:chararray, response_time:int, status_code:int, cpu:float);

-- Clean missing values and remove the CSV header row
cleaned_logs = FILTER raw_logs BY timestamp != 'timestamp' AND timestamp IS NOT NULL AND response_time IS NOT NULL;

-- Remove duplicate records
unique_logs = DISTINCT cleaned_logs;

-- Split data to identify high-latency requests (> 1500ms) vs Valid requests
SPLIT unique_logs INTO 
    valid_logs IF response_time <= 1500,
    high_latency_logs IF response_time > 1500;

-- Save processed logs and rejected/high-latency logs into separate HDFS directories
STORE valid_logs INTO '/data/processed/cleaned_logs' USING PigStorage(',');
STORE high_latency_logs INTO '/data/processed/rejected_logs' USING PigStorage(',');

-- Load raw logs
raw_logs = LOAD '/data/raw/app_logs.csv' USING PigStorage(',') 
    AS (timestamp:chararray, app_id:chararray, endpoint:chararray, response_time:int, status_code:int, cpu:float);

-- Filter out header and invalid records
cleaned_logs = FILTER raw_logs BY timestamp != 'timestamp' AND response_time IS NOT NULL;

-- Remove duplicates
unique_logs = DISTINCT cleaned_logs;

-- Split data
SPLIT unique_logs INTO 
    valid_logs IF response_time <= 1500,
    high_latency_logs IF response_time > 1500;

-- Store processed data back to HDFS
STORE valid_logs INTO '/data/processed/cleaned_logs' USING PigStorage(',');
STORE high_latency_logs INTO '/data/processed/rejected_logs' USING PigStorage(',');