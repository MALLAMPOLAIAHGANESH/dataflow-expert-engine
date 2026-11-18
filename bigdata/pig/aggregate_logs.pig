-- Input should be the cleaned CSV output without a header.
clean = LOAD '$INPUT' USING PigStorage(',') AS
 (request_id:chararray, timestamp:chararray, user_id:chararray, endpoint:chararray,
  method:chararray, response_time_ms:double, status_code:int, service_name:chararray,
  payload_size:long, error_message:chararray);
by_endpoint = GROUP clean BY endpoint;
endpoint_stats = FOREACH by_endpoint GENERATE group AS endpoint,
 COUNT(clean) AS requests, AVG(clean.response_time_ms) AS avg_response_ms;
STORE endpoint_stats INTO '$OUTPUT' USING PigStorage(',');
