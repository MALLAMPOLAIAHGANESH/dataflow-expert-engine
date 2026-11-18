# Architecture and design

## Logical components
1. Browser frontend: static HTML, CSS and JavaScript; calls REST endpoints.
2. Flask API: accepts files, starts processing, exposes metrics and job history.
3. Local processing engine: pandas-based validation and cleaning for development.
4. SQLite metadata store: stores pipeline run metadata; not the Big Data data lake.
5. Hadoop HDFS: stores raw and processed files in the Hadoop profile.
6. Apache Pig: supplied transformation and aggregation scripts.
7. Apache Hive: external table definitions and analytical HiveQL.

## Data zones
- Raw: immutable uploaded/generator CSV source.
- Processed: normalized and deduplicated CSV output.
- Analytics: endpoint, traffic and error aggregates.

## Trust boundaries
Uploaded CSV files are untrusted. The API restricts extensions, uses safe filenames and caps upload size at 100 MB. Production deployment additionally needs authentication, authorization, malware scanning, rate limiting, CSRF protection, TLS, secrets management and audit logging.

## Current execution truth
The default dashboard metrics come from the local processed CSV using Python. The optional HDFS adapter uploads files using WebHDFS. Hive/Pig are separate execution steps and are not silently represented as completed by the local pipeline.
