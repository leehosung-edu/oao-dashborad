# 파이썬 이미지 빌드 Dockerfile 
ARG PYTHON_VERSION=3.11.7
FROM python:${PYTHON_VERSION}-slim AS builder

# 작업 디렉토리 및 환경 변수 설정
WORKDIR /app
ENV PYTHONPATH=/app

# 가상환경 생성
ENV VENV_PATH=/opt/venv
RUN python -m venv $VENV_PATH
ENV PATH="/opt/venv/bin:$PATH"

# 의존성 설치 (캐싱)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 프로덕션 스테이징 시작
FROM python:${PYTHON_VERSION}-slim AS production

WORKDIR /app
ENV PYTHONPATH=/app

# 가상환경 복사 및 경로 설정
COPY --from=builder /opt/venv $VENV_PATH
ENV PATH="$VENV_PATH/bin:$PATH"

# 소스코드 복사
COPY ./app /app/app

# 시작 스크립트 설정
COPY ./scripts/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# [DEBUG] uvicorn 설치 경로 확인
RUN which uvicorn

CMD [ "/app/start.sh" ]