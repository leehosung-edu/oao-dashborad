from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv
from pathlib import Path
from typing import List
from app.api.endpoints import schedule


# FastAPI 인스턴스 생성
app = FastAPI(
    title="OaO-Calendar",
    description="OaO-Calendar 오픈소스기초프로젝트",
    version="1.0.0",
)

# 파일 경로 설정
BASE_DIR = Path(__file__).resolve().parent

# Jinja2 템플릿 설정
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# 개발 환경 정적 파일 설정
#app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")

# 운영 환경 정적 파일 설정
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "app/static")), name="static")

# API 라우터 등록
app.include_router(schedule.router, prefix="/api", tags=["schedules"])

# 환경변수 로드
load_dotenv()

# 루트 라우트
@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# 위원회 소개 라우트
@app.get("/committee", response_class=HTMLResponse)
async def committee(request: Request):
    return templates.TemplateResponse("committee.html", {"request": request})

# 위원회별 캘린더 라우트
@app.get("/calendar", response_class=HTMLResponse)
async def calendar(request: Request):
    return templates.TemplateResponse("calendar.html", {"request": request})

# AWS Health Check 엔드포인트
@app.get("/health")
async def health_check():
    return {"status": "healthy"}