import os

files = ["src/__init__.py", "src/dsa/__init__.py"]

for p in files:
    with open(p, "w", encoding="utf-8") as f:
        pass
    print(f"Created {p}")
