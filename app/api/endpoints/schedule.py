from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os
import requests

load_dotenv()
router = APIRouter()

def parse_meeting_type(title):
    if "전체회의" in title:
        return "General"
    elif "소위원회" in title:
        return "Small"
    elif "공청회" in title:
        return "Public"
    elif "청문회" in title:
        return "Hearing"
    else:
        return "Etc"

@router.get("/schedules/")
async def get_schedules(
    committee: str = Query(...),    # 한글 위원회명
    year: int = Query(...),
    month: int = Query(...),
    use_name: bool = Query(False, description="위원회 이름을 사용할지 여부 (기본값: False)")
):
    api_key = os.getenv("OPEN_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="API 키가 설정되어 있지 않습니다.")
    
    url = "https://open.assembly.go.kr/portal/openapi/nrsldhjpaemrmolla"
    month_str = f"{month:02d}"
    schedules = []
    pIndex = 1

    while True:
        params = {
            "KEY": api_key,
            "Type": "json",
            "UNIT_CD": 100022,
            "pIndex": pIndex,
            "pSize": 100,
            "MEETING_DATE": f"{year}-{month_str}"
        }

        if use_name:
            params["COMMITTEE_NAME"] = committee

        resp = requests.get(url, params=params)
        data = resp.json()

        if "nrsldhjpaemrmolla" not in data or len(data["nrsldhjpaemrmolla"]) < 2:
            break  # 해당 월 데이터가 없다면 종료
        rows = data["nrsldhjpaemrmolla"][1].get("row", [])

        if not rows:
            break
        for item in rows:
            date = item["MEETING_DATE"]
            if date.startswith(f"{year}-{month_str}"):
                schedules.append({
                    "date": date,
                    "time": item.get("MEETING_TIME"),
                    "title": item.get("TITLE"),
                    "type": parse_meeting_type(item.get("TITLE", "")),
                    "agenda": item.get("ANGUN"),
                    "committee": item.get("COMMITTEE_NAME"),
                    "link": item.get("LINK_URL2")
                })
        if len(rows) < 100:
            break
        pIndex += 1
    return JSONResponse(schedules)