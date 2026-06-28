from fastapi import FastAPI
from contextlib import asynccontextmanager
import time

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Lifespan started, sleeping...")
    time.sleep(15)
    print("Lifespan done")
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/")
def read_root():
    return {"Hello": "World"}
