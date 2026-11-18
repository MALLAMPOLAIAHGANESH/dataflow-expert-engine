import os
from pathlib import Path
from dotenv import load_dotenv
BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")
DATA_DIR = Path(os.getenv("DATA_DIR", BASE_DIR / "data"))
INSTANCE_DIR = BASE_DIR / "instance"
DB_PATH = Path(os.getenv("DATABASE_PATH", INSTANCE_DIR / "app.db"))
HDFS_ENABLED = os.getenv("HDFS_ENABLED", "false").lower() == "true"
HDFS_URL = os.getenv("HDFS_URL", "http://localhost:9870").rstrip("/")
HDFS_USER = os.getenv("HDFS_USER", "root")
HDFS_BASE_PATH = os.getenv("HDFS_BASE_PATH", "/app-performance")
