import pandas as pd
from pathlib import Path

def load_clean(path: Path):
    if not path.exists():
        return pd.DataFrame()
    df = pd.read_csv(path)
    if not df.empty:
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    return df

def summary(path):
    df = load_clean(Path(path))
    if df.empty:
        return {"total_requests":0,"successful_requests":0,"failed_requests":0,
                "avg_response_time":0,"error_rate":0,"p95_response_time":0}
    failed = int((df.status_code >= 400).sum())
    return {
        "total_requests": int(len(df)),
        "successful_requests": int((df.status_code < 400).sum()),
        "failed_requests": failed,
        "avg_response_time": round(float(df.response_time_ms.mean()), 2),
        "error_rate": round(failed / len(df) * 100, 2),
        "p95_response_time": round(float(df.response_time_ms.quantile(.95)), 2)
    }

def traffic(path):
    df = load_clean(Path(path))
    if df.empty: return []
    out = df.assign(hour=df.timestamp.dt.strftime("%m-%d %H:00")).groupby("hour").size().tail(24)
    return [{"label":str(k),"requests":int(v)} for k,v in out.items()]

def endpoints(path):
    df = load_clean(Path(path))
    if df.empty: return []
    out = df.groupby("endpoint").agg(requests=("request_id","count"),
        avg_response_ms=("response_time_ms","mean"),
        error_rate=("status_code",lambda x: (x>=400).mean()*100)).reset_index()
    out = out.sort_values("avg_response_ms", ascending=False)
    records = out.to_dict("records")
    return [{"endpoint": r["endpoint"], "requests": int(r["requests"]),
             "avg_response_ms": round(float(r["avg_response_ms"]), 2),
             "error_rate": round(float(r["error_rate"]), 2)} for r in records]

def errors(path):
    df = load_clean(Path(path))
    if df.empty: return []
    out = df[df.status_code >= 400].groupby("status_code").size().sort_values(ascending=False)
    return [{"status_code":str(k),"count":int(v)} for k,v in out.items()]
