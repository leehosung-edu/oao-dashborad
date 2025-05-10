from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pathlib import Path

# FastAPI 인스턴스 생성
app = FastAPI()

# 파일 경로 설정
BASE_DIR = Path(__file__).resolve().parent

# Jinja2 템플릿 설정
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# 정적 파일 설정
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")

# 기본 루트 엔드포인트
@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    ex = {
        "request": request,
        "message": "FastAPI Test",
        "items": [
            {"name": "item1", "price": 100},
            {"name": "item2", "price": 200},
            {"name": "item3", "price": 300},
        ]
    }
    return templates.TemplateResponse("index.html", ex)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# /committee 라우트 추가
@app.get("/committee", response_class=HTMLResponse)
async def committee(request: Request):
    return templates.TemplateResponse("committee.html", {"request": request})

# /calendar 라우트 추가
@app.get("/calendar", response_class=HTMLResponse)
async def calendar(request: Request):
    return templates.TemplateResponse("calendar.html", {"request": request})