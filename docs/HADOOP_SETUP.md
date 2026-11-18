# Windows 11 Docker Hadoop setup

## Prerequisites
- Docker Desktop with WSL2 backend enabled.
- At least 8 GB RAM available to Docker; 12 GB is more comfortable.
- Python 3.11+ for the Flask app.

## Start single-node HDFS
From PowerShell in the project root:
```powershell
docker compose --profile hadoop up -d
docker compose ps
```
Open NameNode UI at http://localhost:9870. Check WebHDFS:
```powershell
Invoke-RestMethod "http://localhost:9870/webhdfs/v1/?op=GETHOMEDIRECTORY&user.name=root"
```
If the image does not expose WebHDFS in your environment, inspect container logs and the Hadoop `dfs.webhdfs.enabled` setting. Do not assume HDFS is healthy merely because containers are running.

## Enable backend upload
Copy `.env.example` to `.env`, then set:
```env
HDFS_ENABLED=true
HDFS_URL=http://localhost:9870
HDFS_USER=root
HDFS_BASE_PATH=/app-performance
```
Restart Flask. Generate/upload a CSV and run the pipeline. The API will attempt to upload raw and cleaned files. Confirm both files in the NameNode UI or with an HDFS client.

## Pig and Hive execution
The Compose profile intentionally provides HDFS only. It does not include Hive metastore, HiveServer2, Pig, YARN or a MapReduce execution cluster. Pig and Hive need a compatible Hadoop client/edge-node setup.

Recommended lab approach:
1. Use a separate Ubuntu VM or a dedicated Hadoop edge-node container with Java, Hadoop client, Pig and Hive installed.
2. Configure `core-site.xml` with `fs.defaultFS=hdfs://<namenode-host>:9000`.
3. Confirm `hdfs dfs -ls /app-performance` works from that edge node.
4. Copy `bigdata/pig/*.pig` and `bigdata/hive/*.hql` to the edge node.
5. Run Pig scripts with parameters. Example:
   ```bash
   pig -param INPUT=/app-performance/raw/your_file.csv        -param OUTPUT=/app-performance/pig/cleaned        bigdata/pig/clean_logs.pig
   ```
6. Create Hive table and run analysis:
   ```bash
   hive -f bigdata/hive/create_tables.hql
   hive -f bigdata/hive/performance_analysis.hql
   ```
7. Configure Hive table LOCATION to the exact cleaned HDFS directory and ensure CSV column order matches the DDL.

Compatibility warning: Hadoop 3.2.1 image is an older educational image. Hive/Pig versions must be selected to match the Java and Hadoop versions. Validate compatibility in the lab rather than mixing arbitrary latest versions.
