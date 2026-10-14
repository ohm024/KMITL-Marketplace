import random
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import DBUser, DBOTP, DBProduct, SellingMode, OTPRequest, OTPVerify, ProductCreate

Base.metadata.create_all(bind=engine)

app = FastAPI(title="KMITL Marketplace API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed ข้อมูลเริ่มต้นหากตารางว่างเปล่า
@app.on_event("startup")
def startup_event():
    db = next(get_db())
    if db.query(DBProduct).count() == 0:
        mock_p1 = DBProduct(
            title="หนังสือฟิสิกส์ 1 สภาพ 95%",
            description="ไม่มีรอยขีดเขียน ส่งต่อรุ่นน้องวิศวะ",
            price=180.0,
            selling_mode=SellingMode.C2C_STUDENT,
            item_condition="มือสอง (สภาพดีมาก)",
            pickup_location="ตึกพระเทพฯ (HM)"
        )
        mock_p2 = DBProduct(
            title="เสื้อช็อป สจล. Official",
            description="สินค้าสวัสดิการ สจล. ของแท้ 100%",
            price=350.0,
            selling_mode=SellingMode.B2C_OFFICIAL,
            item_condition="มือหนึ่ง",
            external_link="https://shopee.co.th",
            outbound_clicks=142
        )
        db.add(mock_p1)
        db.add(mock_p2)
        db.commit()

@app.post("/api/auth/send-otp")
def send_otp(payload: OTPRequest, db: Session = Depends(get_db)):
    otp_code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.utcnow() + timedelta(minutes=5)

    db.query(DBOTP).filter(DBOTP.email == payload.email).delete()

    new_otp = DBOTP(email=payload.email, code=otp_code, expires_at=expires_at)
    db.add(new_otp)
    db.commit()

    print(f"\n==========================================")
    print(f"📩 [MOCK EMAIL] OTP for {payload.email}: {otp_code}")
    print(f"==========================================\n")

    return {"message": "ส่งรหัส OTP เรียบร้อยแล้ว (ตรวจสอบรหัสใน Terminal)"}

@app.post("/api/auth/verify-otp")
def verify_otp(payload: OTPVerify, db: Session = Depends(get_db)):
    otp_record = db.query(DBOTP).filter(
        DBOTP.email == payload.email.lower(),
        DBOTP.code == payload.code
    ).first()

    if not otp_record:
        raise HTTPException(status_code=400, detail="รหัส OTP ไม่ถูกต้อง")

    if datetime.utcnow() > otp_record.expires_at:
        db.delete(otp_record)
        db.commit()
        raise HTTPException(status_code=400, detail="รหัส OTP หมดอายุแล้ว")

    user = db.query(DBUser).filter(DBUser.email == payload.email.lower()).first()
    if not user:
        user = DBUser(email=payload.email.lower())
        db.add(user)
    
    db.delete(otp_record)
    db.commit()

    return {"status": "success", "user": {"email": user.email, "role": user.role}}

@app.get("/api/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(DBProduct).all()

@app.post("/api/products", status_code=status.HTTP_201_CREATED)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    db_product = DBProduct(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.post("/api/products/{product_id}/click")
def track_outbound_click(product_id: int, db: Session = Depends(get_db)):
    product = db.query(DBProduct).filter(DBProduct.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="ไม่พบสินค้า")
    
    product.outbound_clicks += 1
    db.commit()
    return {"outbound_clicks": product.outbound_clicks, "redirect_url": product.external_link}