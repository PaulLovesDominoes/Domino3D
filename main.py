from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()


@app.get("/")
def index():
    return FileResponse("static/index.html")


# Registered after the "/" route above so that explicit route still matches "/"
# first; every other path falls through to this mount (e.g. /js/scene.js,
# /data/dimensions.json map to static/js/scene.js, static/data/dimensions.json).
app.mount("/", StaticFiles(directory="static"), name="static")
