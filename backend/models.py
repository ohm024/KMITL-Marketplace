import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Enum as SQLEnum, DateTime
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from database import Base

class SellingMode(str, enum.Enum):
    C2C_STUDENT = "C2C_STUDENT"
    B2C_OFFICIAL = "B2C_OFFICIAL"

class DBUser(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default="STUDENT")
    created_at = Column(DateTime, default=datetime.utcnow)

class DBOTP(Base):
    __tablename__ = "otps"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    code = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)

class DBProduct(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    price = Column(Float, nullable=False)
    selling_mode = Column(SQLEnum(SellingMode), nullable=False)
    item_condition = Column(String, nullable=True)
    pickup_location = Column(String, nullable=True)
    external_link = Column(String, nullable=True)
    outbound_clicks = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class OTPRequest(BaseModel):
    email: EmailStr

    @field_validator("email")
    def validate_kmitl(cls, v: str) -> str:
        if not v.lower().endswith("@kmitl.ac.th"):
            raise ValueError("ต้องใช้อีเมลสถาบัน (@kmitl.ac.th) เท่านั้น")
        return v.lower()

class OTPVerify(BaseModel):
    email: EmailStr
    code: str

class ProductCreate(BaseModel):
    title: str
    description: str
    price: float
    selling_mode: SellingMode
    item_condition: Optional[str] = None
    pickup_location: Optional[str] = None
    external_link: Optional[str] = None