from pathlib import Path
import pandas as pd
from backend.services.processor import process_csv

def test_process_csv_removes_duplicate_and_rejects_invalid(tmp_path):
    source = tmp_path / "input.csv"
    rows = [
        ["r1","2026-01-01 10:00:00","u1","/api/a","GET",100,200,"svc",100,""],
        ["r1","2026-01-01 10:00:00","u1","/api/a","GET",100,200,"svc",100,""],
        ["r2","not-a-date","u2","/api/b","GET",50,200,"svc",100,""]
    ]
    pd.DataFrame(rows, columns=["request_id","timestamp","user_id","endpoint","method","response_time_ms","status_code","service_name","payload_size","error_message"]).to_csv(source,index=False)
    result = process_csv(source, tmp_path/"out")
    assert result["input_rows"] == 3
    assert result["valid_rows"] == 1
    assert result["rejected_rows"] == 1
    assert result["duplicate_rows"] == 1
