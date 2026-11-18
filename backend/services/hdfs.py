import requests
from backend.config import HDFS_ENABLED, HDFS_URL, HDFS_USER, HDFS_BASE_PATH

def status():
    if not HDFS_ENABLED:
        return {"enabled":False,"connected":False,"message":"HDFS integration disabled"}
    try:
        r = requests.get(f"{HDFS_URL}/webhdfs/v1/?op=GETHOMEDIRECTORY&user.name={HDFS_USER}", timeout=4)
        return {"enabled":True,"connected":r.ok,"message":"WebHDFS reachable" if r.ok else f"WebHDFS returned {r.status_code}"}
    except requests.RequestException as e:
        return {"enabled":True,"connected":False,"message":str(e)}

def upload(local_path, relative_path):
    if not HDFS_ENABLED:
        return {"uploaded":False,"message":"Set HDFS_ENABLED=true to enable HDFS upload"}
    target = f"{HDFS_BASE_PATH}/{relative_path}".replace("//","/")
    params = {"op":"CREATE","overwrite":"true","user.name":HDFS_USER}
    first = requests.put(f"{HDFS_URL}/webhdfs/v1{target}", params=params, allow_redirects=False, timeout=10)
    if first.status_code not in (307, 201):
        first.raise_for_status()
    if first.status_code == 307:
        with open(local_path,"rb") as f:
            second = requests.put(first.headers["Location"], data=f, timeout=60)
        second.raise_for_status()
    return {"uploaded":True,"hdfs_path":target}
