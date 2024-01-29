from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from langserve import add_routes
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles

from app.rag_chain import final_chain

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/rag/static", StaticFiles(directory="./source_docs"), name="static")
@app.get("/")
async def redirect_root_to_docs():
    return RedirectResponse("/docs")


# Edit this to add the chain you want to add
add_routes(app, final_chain, path="/rag")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
