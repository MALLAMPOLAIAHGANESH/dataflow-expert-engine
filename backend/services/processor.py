import pandas as pd
from pathlib import Path
from backend.services.generator import FIELDS

NUMERIC = ["response_time_ms", "status_code", "payload_size"]

def process_csv(source: Path, output_dir: Path):
    df = pd.read_csv(source)
    missing = set(FIELDS) - set(df.columns)
    if missing:
        raise ValueError("Missing required columns: " + ", ".join(sorted(missing)))
    input_rows = len(df)
    for col in NUMERIC:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    valid_mask = (
        df["request_id"].notna() & df["timestamp"].notna() &
        df["endpoint"].notna() & df["response_time_ms"].notna() &
        df["status_code"].between(100, 599) & (df["response_time_ms"] >= 0)
    )
    rejected = int((~valid_mask).sum())
    clean = df.loc[valid_mask].copy()
    before_dedup = len(clean)
    clean = clean.drop_duplicates(subset=["request_id"], keep="first")
    duplicates = before_dedup - len(clean)
    clean["timestamp"] = clean["timestamp"].dt.strftime("%Y-%m-%d %H:%M:%S")
    output_dir.mkdir(parents=True, exist_ok=True)
    output = output_dir / f"{source.stem}_clean.csv"
    clean.to_csv(output, index=False)
    return {"input_rows": input_rows, "valid_rows": len(clean),
            "rejected_rows": rejected, "duplicate_rows": duplicates,
            "output_file": str(output)}
