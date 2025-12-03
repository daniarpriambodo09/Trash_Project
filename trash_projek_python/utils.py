import os
import time
from datetime import datetime

def print_time(message: str):
    now = datetime.now().strftime("%H:%M:%S")
    print(f"[{now}] {message}")

def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)