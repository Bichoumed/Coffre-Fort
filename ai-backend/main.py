from fastapi import FastAPI
from pydantic import BaseModel
from ai_client import analyze_text
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow your Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],  # <-- OPTIONS ALLOWED HERE
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    text: str

class AnalyzeResponse(BaseModel):
    summary: str


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    result = analyze_text(req.text.strip())
    return AnalyzeResponse(**result)
