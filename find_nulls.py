import os

def check_file(path):
    with open(path, 'rb') as f:
        content = f.read()
        if b'\x00' in content:
            print(f"CORRUPTED: {path}")
        else:
            print(f"OK: {path}")

for root, dirs, files in os.walk('backend_v2'):
    for file in files:
        if file.endswith('.py'):
            check_file(os.path.join(root, file))
