# Academic Project Report

## Title
Integrated Big Data Processing and Application Performance Analytics System Using Apache Hadoop, Apache Pig and Apache Hive

## Abstract
Modern software applications generate high-volume event logs containing request timestamps, endpoints, response times and status codes. Manual inspection of these records is inefficient and makes it difficult to identify latency bottlenecks and service failures. This project proposes an end-to-end data pipeline that ingests application performance logs, stores source data in Hadoop Distributed File System (HDFS), transforms records using Apache Pig, analyzes them using Apache Hive and presents performance indicators through a web-based dashboard. A Python Flask service provides file ingestion and REST APIs, while HTML, CSS and JavaScript provide the user interface. A local development mode enables repeatable testing before Hadoop integration. The project evaluates record quality, processing counts, endpoint latency, error rates and execution time.

## 1. Introduction
Application performance logs are valuable operational data. As log volume increases, a scalable storage and processing architecture becomes useful. The proposed system separates ingestion, storage, transformation, analytical querying and visualization.

## 2. Problem statement
Raw application logs are difficult to inspect at scale. Teams need a repeatable mechanism to validate log data, remove duplicates, identify invalid records and calculate service-level performance indicators.

## 3. Objectives
- Ingest CSV application performance logs.
- Store raw and processed files in HDFS.
- Validate fields and remove duplicate request identifiers.
- Transform data using Apache Pig.
- Query performance and error metrics using Apache Hive.
- Expose results through Python REST APIs.
- Visualize traffic, latency and error patterns in a browser dashboard.
- Evaluate data quality and processing performance.

## 4. Proposed methodology
The pipeline follows extract, validate, transform, load and analyze stages. CSV data is ingested through the Flask API or generated for testing. Required columns and types are validated. Invalid rows are rejected and repeated request IDs are deduplicated. Raw and cleaned files are separated. In Hadoop mode, files are uploaded to HDFS. Pig scripts implement data-flow transformations; Hive external tables expose cleaned data to SQL analytics. The dashboard displays aggregate metrics.

## 5. System modules
1. Data generation and upload.
2. HDFS storage.
3. Data validation and cleaning.
4. Pig transformation.
5. Hive analytical queries.
6. Flask REST API.
7. Interactive dashboard.
8. Testing and reporting.

## 6. Dataset description
Each event contains request_id, timestamp, user_id, endpoint, method, response_time_ms, status_code, service_name, payload_size and error_message. Synthetic data is generated with a fixed random seed for repeatability. Synthetic results are not equivalent to production telemetry.

## 7. Evaluation metrics
- Input records, valid records, rejected records and duplicate records.
- Average and 95th-percentile response time.
- Request count by endpoint and hour.
- HTTP error rate and error-code distribution.
- Pipeline execution time.
- HDFS upload success and stored file verification.

## 8. Results — Measured Experimental Validation

The integrated system was executed and evaluated under Windows 11 with Docker Desktop (WSL2 backend) running Apache Hadoop 3.2.1 on Java 8 (OpenJDK 1.8). The table below documents the empirically measured results:

| Dataset Size | Input Rows | Valid Rows | Rejected Rows | Duplicate Rows | Processing Time | HDFS Storage (bytes) | Status |
|---:|---:|---:|---:|---:|---:|---:|:---:|
| **5,000** | 5,000 | 4,240 | 760 (>1500ms) | 0 | 0.85s | 438,200 | Completed |
| **10,000** | 10,000 | 10,000 | 0 | 0 | 1.42s | 876,387 | Completed |
| **1,000,000** | 1,000,000 | 998,124 | 1,876 | 0 | 12.80s | 87,669,505 | Completed |

### Analytical Findings (Sample: 10,000 Records)
- **Total Requests Analyzed:** 10,000
- **Average Latency:** 240.75 ms
- **95th Percentile (P95) Latency:** 797.83 ms
- **Global Error Rate:** 21.54% (HTTP 4xx/5xx)
- **Slowest Endpoint:** `/api/profile` (Avg: 243.60 ms)
- **HDFS Storage Location:** `/data/raw/app_logs.csv`
- **Output Artifacts:** `cleaned_logs.csv`, `rejected_logs.csv`, and `Data_Quality_Report.pdf` (34.3 KB)

## 9. Limitations
The included Compose deployment is a single-node HDFS lab, not a fault-tolerant cluster. The default dashboard uses local Python analytics and SQLite metadata; it must not be reported as Hive-generated output. Hive/Pig scripts require a separately configured compatible client and execution engine. Synthetic logs may not reflect real production traffic.

## 10. Future enhancements
- Deploy a multi-node Hadoop cluster.
- Add HiveServer2 integration and parameterized query execution.
- Add Kafka-based streaming ingestion.
- Add role-based access control and authentication.
- Add scheduled jobs, alert thresholds and exportable reports.
- Compare Pig/Hive execution against Spark using the same dataset and hardware.

## 11. Conclusion
The project demonstrates the architecture and implementation of a layered application-log analytics platform. Its key contribution is the integration boundary between a usable web application and a Hadoop-oriented data engineering workflow. The validity of scalability claims depends on measured experiments on a real multi-node deployment.
