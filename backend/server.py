from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from auth import (  # noqa: E402
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    require_role,
    ensure_indexes,
    ALLOWED_ROLES,
)

# ---------------- Mongo ----------------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Healthca API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _new_id() -> str:
    return str(uuid.uuid4())


def _clean(doc: dict) -> dict:
    """Return a copy of `doc` without Mongo internals or sensitive fields."""
    if not doc:
        return doc
    d = {k: v for k, v in doc.items() if k not in {"_id", "password_hash"}}
    return d


# ---------------- Models ----------------
Role = Literal["patient", "receptionist", "doctor"]


class RegisterInput(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    role: Role
    phone: Optional[str] = Field(default=None, max_length=30)
    # Doctor-specific
    specialty: Optional[str] = Field(default=None, max_length=80)
    bio: Optional[str] = Field(default=None, max_length=500)


class LoginInput(BaseModel):
    email: EmailStr
    password: str
    role: Optional[Role] = None  # optional guard


class PublicUser(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: Role
    phone: Optional[str] = None
    specialty: Optional[str] = None
    bio: Optional[str] = None
    created_at: str


class AuthResponse(BaseModel):
    user: PublicUser
    token: str


class StatusCheckCreate(BaseModel):
    client_name: str


class AppointmentPublicCreate(BaseModel):
    """Public (unauthenticated) appointment request from the landing page form."""
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(..., min_length=5, max_length=30)
    department: str = Field(..., min_length=2, max_length=80)
    date: str = Field(..., min_length=1, max_length=40)
    message: Optional[str] = Field(default="", max_length=1000)


class AppointmentCreate(BaseModel):
    """Authenticated booking (patient or receptionist)."""
    doctor_id: str
    department: Optional[str] = Field(default=None, max_length=80)
    date: str = Field(..., min_length=1, max_length=40)
    time: Optional[str] = Field(default=None, max_length=20)
    message: Optional[str] = Field(default="", max_length=1000)
    # Receptionist can book on behalf of an existing patient (by patient_id)
    patient_id: Optional[str] = None
    # Or receptionist can book for a walk-in with contact info
    patient_name: Optional[str] = Field(default=None, max_length=120)
    patient_phone: Optional[str] = Field(default=None, max_length=30)


class AppointmentUpdate(BaseModel):
    date: Optional[str] = None
    time: Optional[str] = None
    status: Optional[Literal["scheduled", "rescheduled", "cancelled", "completed"]] = None
    message: Optional[str] = None


class AnnouncementCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=160)
    body: str = Field(..., min_length=2, max_length=1200)
    type: Literal["holiday", "emergency", "general"] = "general"
    starts_on: Optional[str] = None
    ends_on: Optional[str] = None


class EmergencyAlertCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=160)
    body: str = Field(..., min_length=2, max_length=1200)
    severity: Literal["low", "medium", "high", "critical"] = "high"


class NewsletterCreate(BaseModel):
    email: EmailStr


# ---------------- Public / marketing routes ----------------
@api_router.get("/")
async def root():
    return {"message": "Healthca API"}


@api_router.post("/status")
async def create_status_check(payload: StatusCheckCreate):
    doc = {"id": _new_id(), "client_name": payload.client_name, "timestamp": _now_iso()}
    await db.status_checks.insert_one(doc)
    return _clean(doc)


@api_router.get("/status")
async def list_status_checks():
    items = await db.status_checks.find({}, {"_id": 0}).to_list(500)
    return items


@api_router.post("/appointments/public")
async def public_book(payload: AppointmentPublicCreate):
    doc = {
        "id": _new_id(),
        "source": "public",
        "status": "scheduled",
        **payload.model_dump(),
        "created_at": _now_iso(),
    }
    await db.appointments.insert_one(doc)
    return _clean(doc)


# Backward-compat alias (used by landing form)
@api_router.post("/appointments")
async def public_book_legacy(payload: AppointmentPublicCreate):
    return await public_book(payload)


@api_router.post("/newsletter")
async def subscribe_newsletter(payload: NewsletterCreate):
    existing = await db.newsletter.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already subscribed")
    doc = {"id": _new_id(), "email": payload.email, "created_at": _now_iso()}
    await db.newsletter.insert_one(doc)
    return _clean(doc)


# ---------------- Auth ----------------
@api_router.post("/auth/register", response_model=AuthResponse)
async def register(payload: RegisterInput):
    if payload.role not in ALLOWED_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")

    email = payload.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="Email already registered")

    user_doc = {
        "id": _new_id(),
        "name": payload.name,
        "email": email,
        "role": payload.role,
        "phone": payload.phone,
        "specialty": payload.specialty if payload.role == "doctor" else None,
        "bio": payload.bio if payload.role == "doctor" else None,
        "password_hash": hash_password(payload.password),
        "created_at": _now_iso(),
    }
    await db.users.insert_one(user_doc)
    token = create_access_token(user_doc["id"], user_doc["role"], user_doc["email"])
    return {"user": _clean(user_doc), "token": token}


@api_router.post("/auth/login", response_model=AuthResponse)
async def login(payload: LoginInput):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if payload.role and user.get("role") != payload.role:
        raise HTTPException(
            status_code=403,
            detail=f"This account is registered as {user.get('role')}. Please use the correct login page.",
        )
    token = create_access_token(user["id"], user["role"], user["email"])
    return {"user": _clean(user), "token": token}


@api_router.get("/auth/me", response_model=PublicUser)
async def me(user: dict = Depends(get_current_user)):
    return user


# ---------------- Doctors ----------------
@api_router.get("/doctors")
async def list_doctors():
    """Public list of doctors — used by patient booking UI."""
    docs = await db.users.find(
        {"role": "doctor"},
        {"_id": 0, "password_hash": 0, "email": 0, "phone": 0},
    ).to_list(500)
    return docs


# ---------------- Appointments (authenticated) ----------------
def _appt_for_user(user: dict) -> dict:
    """Build MongoDB filter to fetch appointments the user is allowed to see."""
    role = user["role"]
    if role == "receptionist":
        return {}  # receptionist sees all
    if role == "doctor":
        return {"doctor_id": user["id"]}
    return {"patient_id": user["id"]}  # patient


@api_router.get("/appointments/mine")
async def my_appointments(user: dict = Depends(get_current_user)):
    filt = _appt_for_user(user)
    items = await db.appointments.find(filt, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


@api_router.post("/appointments/book")
async def book_appointment(payload: AppointmentCreate, user: dict = Depends(get_current_user)):
    if user["role"] not in {"patient", "receptionist"}:
        raise HTTPException(status_code=403, detail="Only patients or receptionists can book")

    doctor = await db.users.find_one({"id": payload.doctor_id, "role": "doctor"})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Determine patient identity
    patient_id: Optional[str]
    patient_name: str
    patient_phone: Optional[str] = None

    if user["role"] == "patient":
        patient_id = user["id"]
        patient_name = user["name"]
        patient_phone = user.get("phone")
    else:  # receptionist
        if payload.patient_id:
            p = await db.users.find_one({"id": payload.patient_id, "role": "patient"})
            if not p:
                raise HTTPException(status_code=404, detail="Patient not found")
            patient_id = p["id"]
            patient_name = p["name"]
            patient_phone = p.get("phone")
        else:
            if not payload.patient_name:
                raise HTTPException(status_code=400, detail="patient_name required for walk-in booking")
            patient_id = None
            patient_name = payload.patient_name
            patient_phone = payload.patient_phone

    doc = {
        "id": _new_id(),
        "doctor_id": doctor["id"],
        "doctor_name": doctor["name"],
        "doctor_specialty": doctor.get("specialty"),
        "patient_id": patient_id,
        "patient_name": patient_name,
        "patient_phone": patient_phone,
        "department": payload.department or doctor.get("specialty") or "General",
        "date": payload.date,
        "time": payload.time,
        "message": payload.message or "",
        "status": "scheduled",
        "booked_by": user["id"],
        "booked_by_role": user["role"],
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
    }
    await db.appointments.insert_one(doc)
    return _clean(doc)


async def _load_appointment_or_403(appt_id: str, user: dict) -> dict:
    appt = await db.appointments.find_one({"id": appt_id}, {"_id": 0})
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    role = user["role"]
    if role == "receptionist":
        return appt
    if role == "patient" and appt.get("patient_id") == user["id"]:
        return appt
    if role == "doctor" and appt.get("doctor_id") == user["id"]:
        return appt
    raise HTTPException(status_code=403, detail="Forbidden")


@api_router.patch("/appointments/{appt_id}")
async def update_appointment(appt_id: str, payload: AppointmentUpdate, user: dict = Depends(get_current_user)):
    appt = await _load_appointment_or_403(appt_id, user)
    updates = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    if not updates:
        return appt
    # Patients can only reschedule (change date/time) or cancel; not mark completed
    if user["role"] == "patient":
        allowed = {"date", "time", "message", "status"}
        updates = {k: v for k, v in updates.items() if k in allowed}
        if updates.get("status") and updates["status"] not in {"cancelled", "rescheduled"}:
            raise HTTPException(status_code=403, detail="Patients cannot set that status")
    updates["updated_at"] = _now_iso()
    await db.appointments.update_one({"id": appt_id}, {"$set": updates})
    return {**appt, **updates}


@api_router.delete("/appointments/{appt_id}")
async def cancel_appointment(appt_id: str, user: dict = Depends(get_current_user)):
    appt = await _load_appointment_or_403(appt_id, user)
    if user["role"] == "doctor":
        raise HTTPException(status_code=403, detail="Doctors cannot cancel; contact reception")
    await db.appointments.update_one(
        {"id": appt_id},
        {"$set": {"status": "cancelled", "updated_at": _now_iso()}},
    )
    return {**appt, "status": "cancelled"}


# ---------------- Doctor: announcements + stats ----------------
@api_router.post("/announcements")
async def post_announcement(
    payload: AnnouncementCreate,
    user: dict = Depends(require_role("doctor")),
):
    doc = {
        "id": _new_id(),
        "doctor_id": user["id"],
        "doctor_name": user["name"],
        **payload.model_dump(),
        "created_at": _now_iso(),
    }
    await db.announcements.insert_one(doc)
    return _clean(doc)


@api_router.get("/announcements")
async def list_announcements(user: dict = Depends(get_current_user)):
    """Doctors see their own; patients + receptionists see everyone's."""
    if user["role"] == "doctor":
        filt = {"doctor_id": user["id"]}
    else:
        filt = {}
    items = await db.announcements.find(filt, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items


@api_router.delete("/announcements/{ann_id}")
async def delete_announcement(ann_id: str, user: dict = Depends(require_role("doctor"))):
    res = await db.announcements.delete_one({"id": ann_id, "doctor_id": user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"ok": True}


@api_router.get("/doctor/stats")
async def doctor_stats(user: dict = Depends(require_role("doctor"))):
    total = await db.appointments.count_documents({"doctor_id": user["id"]})
    scheduled = await db.appointments.count_documents({"doctor_id": user["id"], "status": "scheduled"})
    completed = await db.appointments.count_documents({"doctor_id": user["id"], "status": "completed"})
    cancelled = await db.appointments.count_documents({"doctor_id": user["id"], "status": "cancelled"})
    unique_patient_ids = await db.appointments.distinct("patient_id", {"doctor_id": user["id"]})
    unique_patients = len([p for p in unique_patient_ids if p])
    return {
        "total_appointments": total,
        "scheduled": scheduled,
        "completed": completed,
        "cancelled": cancelled,
        "unique_patients": unique_patients,
    }


# ---------------- Receptionist: emergency alerts ----------------
@api_router.post("/emergency-alerts")
async def create_alert(
    payload: EmergencyAlertCreate,
    user: dict = Depends(require_role("receptionist")),
):
    doc = {
        "id": _new_id(),
        "sent_by": user["id"],
        "sent_by_name": user["name"],
        **payload.model_dump(),
        "created_at": _now_iso(),
    }
    await db.emergency_alerts.insert_one(doc)
    return _clean(doc)


@api_router.get("/emergency-alerts")
async def list_alerts(user: dict = Depends(get_current_user)):
    items = await db.emergency_alerts.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items


# ---------------- App wiring ----------------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def _startup():
    try:
        await ensure_indexes(db)
        logger.info("Mongo indexes ensured")
    except Exception as e:  # pragma: no cover
        logger.warning("Index creation issue: %s", e)


@app.on_event("shutdown")
async def _shutdown():
    client.close()
