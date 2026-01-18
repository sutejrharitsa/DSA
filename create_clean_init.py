import os

files = ["backend_v2/__init__.py", "backend_v2/dsa/__init__.py"]

for p in files:
    with open(p, "w", encoding="utf-8") as f:
        pass
    print(f"Created {p}")
