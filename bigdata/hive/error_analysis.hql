USE app_performance;
SELECT status_code, COUNT(*) AS failures
FROM application_logs
WHERE status_code >= 400
GROUP BY status_code
ORDER BY failures DESC;
