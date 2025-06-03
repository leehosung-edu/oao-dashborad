from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from pathlib import Path
from typing import List
from app.api.endpoints import schedule
import os
import httpx

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
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")

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

# 위원회 정보 API 프록시 라우트 추가
@app.get("/api/committee-data", response_class=HTMLResponse)
async def committee_data(request: Request):
    committee = request.query_params.get("committee")
    if not committee:
        raise HTTPException(status_code=400, detail="Committee name is required")
    
    api_key = os.getenv("OPEN_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="API key not found in environment variables")
    
    encoded_committee = committee.strip()
    api_url = f"https://open.assembly.go.kr/portal/openapi/nktulghcadyhmiqxi?KEY={api_key}&Type=xml&DEPT_NM={encoded_committee}"

    async with httpx.AsyncClient() as client:
        response = await client.get(api_url)
        if response.status_code != 200:
            return HTMLResponse(content="외부 API 호출 실패", status_code=500)
        return HTMLResponse(content=response.text, media_type="application/xml")
    
@app.get("/api/committee-career", response_class=JSONResponse)
async def committee_career(request: Request):
    committee = request.query_params.get("committee")
    memberName = request.query_params.get("memberName")

    if not committee:
        raise HTTPException(status_code=400, detail="Committee name is required")
    
    if not memberName:
        raise HTTPException(status_code=400, detail="Member name is required")
    
    api_key = os.getenv("OPEN_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="API key not found in environment variables")
    
    encoded_committee = committee.strip()
    encoded_member_name = memberName.strip()
    
    api_url = f"https://open.assembly.go.kr/portal/openapi/ALLNAMEMBER?KEY={api_key}&Type=JSON&BLNG_CMIT_NM={encoded_committee}&NAAS_NM={encoded_member_name}"

    async with httpx.AsyncClient() as client:
        response = await client.get(api_url)
        if response.status_code != 200:
            return JSONResponse(content={"error": "외부 API 호출 실패"}, status_code=500)
        
        return JSONResponse(content=response.json())