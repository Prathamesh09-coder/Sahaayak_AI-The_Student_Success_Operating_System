import sys
print("sys.path:", sys.path)
try:
    import redis
    print("redis imported:", redis.__file__)
except Exception as e:
    print("redis import failed:", repr(e))
