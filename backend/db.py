import sqlite3
from pathlib import Path
from backend.config import DB_PATH

def connect():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con

def init_db():
    with connect() as con:
        con.execute('''CREATE TABLE IF NOT EXISTS pipeline_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_file TEXT NOT NULL,
            status TEXT NOT NULL,
            input_rows INTEGER DEFAULT 0,
            valid_rows INTEGER DEFAULT 0,
            rejected_rows INTEGER DEFAULT 0,
            duplicate_rows INTEGER DEFAULT 0,
            started_at TEXT NOT NULL,
            finished_at TEXT,
            error TEXT
        )''')
        con.execute('''CREATE TABLE IF NOT EXISTS app_logs (
            request_id TEXT PRIMARY KEY, timestamp TEXT, user_id TEXT, endpoint TEXT,
            method TEXT, response_time_ms REAL, status_code INTEGER, service_name TEXT,
            payload_size INTEGER, error_message TEXT
        )''')
