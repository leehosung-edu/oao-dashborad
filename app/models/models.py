from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from enum import Enum

# 위원회 엔티티
class Committee(SQLModel, table=True):
    __tablename__ = "committee"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, nullable=False, unique=False)
    description: Optional[str] = Field(default=None)


# 국회의원 엔티티
class Member(SQLModel, table=True):
    __tablename__ = "member"

    id: Optional[int] = Field(default=None, primary_key=True)