import sys
import threading
import time
import traceback
import importlib

def dump_trace():
    time.sleep(10)
    print("\n--- THREAD DUMP ---")
    for thread_id, frame in sys._current_frames().items():
        print(f"\nThread {thread_id}:")
        traceback.print_stack(frame)
    print("-------------------\n", flush=True)
    sys.exit(1)

threading.Thread(target=dump_trace, daemon=True).start()

print("Importing app.api.v1.mentor...", flush=True)
import app.api.v1.mentor
print("Success!", flush=True)
