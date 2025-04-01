# 의존성 자동 생성 스크립트

import pkg_resources
import subprocess
from pathlib import Path

def generate_requirements():
    
    # 현재 설치된 패키지 목록 가져오기
    installed_packages = [
        f"{dist.key}=={dist.version}"
        for dist in pkg_resources.working_set
    ]

    # FastAPI 및 관련 패키지 목록
    required_packages = [
        "fastapi[all]",
        "uvicorn[standard]",
        "sqlalchemy",
        "python-dotenv",
        "jinja2",
        "aiofiles",
        "alembic",
        "python-multipart",
        "pydantic",
        "httpx",
    ]

    # requirements.txt 파일 생성
    output_path = Path("requirements.txt")
    with output_path.open("w") as f:
        for package in required_packages:
            if any(p.startswith(package) for p in installed_packages):
                matching_pkg = next(p for p in installed_packages if p.startswith(package))
                print(f"Using installed package: {matching_pkg}")
                f.write(f"{matching_pkg}\n")
            else:
                print(f"Adding new package: {package}")
                f.write(f"{package}\n")

if __name__ == "__main__":
    generate_requirements()
    print("requirements.txt has been generated.")