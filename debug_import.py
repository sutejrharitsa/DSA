import sys
import os
sys.path.append(os.getcwd())

print("Attempting import...")
try:
    from backend_v2 import main
    print("Import Successful!")
except Exception as e:
    import traceback
    traceback.print_exc()
