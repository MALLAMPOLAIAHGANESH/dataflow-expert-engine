import csv, random
from datetime import datetime, timedelta
from pathlib import Path

FIELDS = ["request_id","timestamp","user_id","endpoint","method","response_time_ms",
          "status_code","service_name","payload_size","error_message"]
ENDPOINTS = ["/api/login","/api/products","/api/orders","/api/search","/api/profile","/api/payment"]
SERVICES = ["auth","catalog","orders","search","users","payments"]

def generate_csv(path: Path, records=10000, seed=42):
    random.seed(seed)
    path.parent.mkdir(parents=True, exist_ok=True)
    start = datetime.now().replace(microsecond=0) - timedelta(days=7)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        writer.writeheader()
        for i in range(records):
            idx = random.randrange(len(ENDPOINTS))
            status = random.choices([200,201,400,401,404,500,503], [70,8,5,4,4,6,3])[0]
            response = max(5, random.gauss(180 if status < 500 else 850, 100 if status < 500 else 300))
            writer.writerow({
                "request_id": f"REQ{i+1:09d}",
                "timestamp": (start + timedelta(seconds=random.randint(0, 7*86400))).isoformat(sep=" "),
                "user_id": f"U{random.randint(1, max(100, records//10)):06d}",
                "endpoint": ENDPOINTS[idx],
                "method": random.choice(["GET","POST","PUT","DELETE"]),
                "response_time_ms": round(response, 2),
                "status_code": status,
                "service_name": SERVICES[idx],
                "payload_size": random.randint(128, 12000),
                "error_message": "" if status < 400 else ("Internal server error" if status >= 500 else "Client request error")
            })
    return path
