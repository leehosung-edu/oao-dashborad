# 파이썬 이미지 빌드 Dockerfile 
ARG PYTHON_VERSION
FROM python:${PYTHON_VERSION}-slim AS builder

WORKDIR /app
ENV PYTHONPATH=/app

# 가상환경 생성
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 프로덕션 스테이징
FROM python:${PYTHON_VERSION}-slim AS production

WORKDIR /app
ENV PYTHONPATH=/app

# 가상환경 복사
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 소스코드 복사
COPY ./app /app/app

# 시작 스크립트
COPY ./scripts/start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD [ "/app/start.sh" ]