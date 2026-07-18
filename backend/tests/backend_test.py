"""
Backend regression tests for Healthca role-based auth + role-scoped features.

Covers:
- /api/auth/register + login + me  (RBAC + role guard + cleanliness of response)
- /api/doctors sensitive-field exclusion
- /api/appointments/{book,mine,PATCH,DELETE} — role-scoped rules
- /api/announcements (doctor-only create + own-scope read/delete)
- /api/doctor/stats
- /api/emergency-alerts (receptionist-only create)
- Existing public endpoints — /api/appointments, /api/newsletter, /api/status
"""

import os
import time
import uuid

import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get(
    "REACT_APP_BACKEND_URL"
) else None
if not BASE_URL:
    # fall back to reading frontend/.env
    with open("/app/frontend/.env") as fh:
        for line in fh:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

API = f"{BASE_URL}/api"
RUN_ID = uuid.uuid4().hex[:8]


# ---------------- helpers / fixtures ----------------
@pytest.fixture(scope="session")
def s():
    return requests.Session()


def _reg(session, role, prefix="u", **extra):
    email = f"test_{prefix}_{RUN_ID}_{uuid.uuid4().hex[:4]}@example.com"
    payload = {
        "name": f"Test {role.title()} {prefix}",
        "email": email,
        "password": "Password123",
        "role": role,
        **extra,
    }
    r = session.post(f"{API}/auth/register", json=payload, timeout=30)
    assert r.status_code == 200, f"register failed {r.status_code} {r.text}"
    body = r.json()
    return body["user"], body["token"], payload


def _hdr(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="session")
def patient(s):
    u, t, p = _reg(s, "patient", prefix="pat", phone="+911234567890")
    return {"user": u, "token": t, "email": p["email"], "password": p["password"]}


@pytest.fixture(scope="session")
def receptionist(s):
    u, t, p = _reg(s, "receptionist", prefix="rec")
    return {"user": u, "token": t, "email": p["email"], "password": p["password"]}


@pytest.fixture(scope="session")
def doctor(s):
    u, t, p = _reg(s, "doctor", prefix="doc", specialty="Cardiology", bio="Heart doc")
    return {"user": u, "token": t, "email": p["email"], "password": p["password"]}


# ---------------- AUTH ----------------
class TestAuth:
    def test_register_returns_user_and_token_no_password(self, s):
        u, t, _ = _reg(s, "patient", prefix="reg1")
        assert "password" not in u
        assert "password_hash" not in u
        assert "_id" not in u
        assert u["role"] == "patient"
        assert isinstance(t, str) and len(t) > 20

    def test_register_duplicate_email_409(self, s, patient):
        r = s.post(
            f"{API}/auth/register",
            json={
                "name": "dup",
                "email": patient["email"],
                "password": "Password123",
                "role": "patient",
            },
        )
        assert r.status_code == 409

    def test_register_invalid_role_rejected(self, s):
        r = s.post(
            f"{API}/auth/register",
            json={
                "name": "x",
                "email": f"TEST_bad_{uuid.uuid4().hex[:6]}@example.com",
                "password": "Password123",
                "role": "admin",
            },
        )
        assert r.status_code in (400, 422)

    def test_login_success(self, s, patient):
        r = s.post(
            f"{API}/auth/login",
            json={"email": patient["email"], "password": patient["password"]},
        )
        assert r.status_code == 200
        assert "token" in r.json()

    def test_login_wrong_password_401(self, s, patient):
        r = s.post(
            f"{API}/auth/login",
            json={"email": patient["email"], "password": "wrongpass"},
        )
        assert r.status_code == 401

    def test_login_role_mismatch_403(self, s, patient):
        r = s.post(
            f"{API}/auth/login",
            json={
                "email": patient["email"],
                "password": patient["password"],
                "role": "doctor",
            },
        )
        assert r.status_code == 403

    def test_me_requires_bearer(self, s):
        r = s.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_with_bearer(self, s, patient):
        r = s.get(f"{API}/auth/me", headers=_hdr(patient["token"]))
        assert r.status_code == 200
        body = r.json()
        assert body["email"] == patient["email"]
        assert "password_hash" not in body
        assert "_id" not in body


# ---------------- DOCTORS ----------------
class TestDoctors:
    def test_list_omits_sensitive(self, s, doctor):
        r = s.get(f"{API}/doctors")
        assert r.status_code == 200
        docs = r.json()
        assert isinstance(docs, list)
        target = [d for d in docs if d.get("id") == doctor["user"]["id"]]
        assert len(target) == 1
        d = target[0]
        for banned in ("email", "phone", "password_hash", "_id"):
            assert banned not in d, f"{banned} leaked in /api/doctors"


# ---------------- APPOINTMENTS ----------------
class TestAppointments:
    def test_patient_books_self(self, s, patient, doctor):
        r = s.post(
            f"{API}/appointments/book",
            headers=_hdr(patient["token"]),
            json={
                "doctor_id": doctor["user"]["id"],
                "date": "2026-02-10",
                "time": "10:00",
                "message": "TEST patient booking",
            },
        )
        assert r.status_code == 200, r.text
        appt = r.json()
        assert appt["patient_id"] == patient["user"]["id"]
        assert appt["doctor_id"] == doctor["user"]["id"]
        assert appt["status"] == "scheduled"
        pytest.appt_patient_id = appt["id"]

    def test_receptionist_books_walkin(self, s, receptionist, doctor):
        r = s.post(
            f"{API}/appointments/book",
            headers=_hdr(receptionist["token"]),
            json={
                "doctor_id": doctor["user"]["id"],
                "date": "2026-02-11",
                "time": "11:00",
                "patient_name": "TEST Walk-In",
                "patient_phone": "+919999999999",
            },
        )
        assert r.status_code == 200, r.text
        appt = r.json()
        assert appt["patient_id"] is None
        assert appt["patient_name"] == "TEST Walk-In"
        pytest.appt_walkin_id = appt["id"]

    def test_receptionist_walkin_missing_name_400(self, s, receptionist, doctor):
        r = s.post(
            f"{API}/appointments/book",
            headers=_hdr(receptionist["token"]),
            json={"doctor_id": doctor["user"]["id"], "date": "2026-02-12"},
        )
        assert r.status_code == 400

    def test_doctor_cannot_book_403(self, s, doctor):
        r = s.post(
            f"{API}/appointments/book",
            headers=_hdr(doctor["token"]),
            json={"doctor_id": doctor["user"]["id"], "date": "2026-02-13"},
        )
        assert r.status_code == 403

    def test_mine_scopes_by_role(self, s, patient, doctor, receptionist):
        # patient sees only own
        r = s.get(f"{API}/appointments/mine", headers=_hdr(patient["token"]))
        assert r.status_code == 200
        for a in r.json():
            assert a["patient_id"] == patient["user"]["id"]

        # doctor sees only own
        r = s.get(f"{API}/appointments/mine", headers=_hdr(doctor["token"]))
        assert r.status_code == 200
        for a in r.json():
            assert a["doctor_id"] == doctor["user"]["id"]

        # receptionist sees ALL - at least both appts we just booked
        r = s.get(f"{API}/appointments/mine", headers=_hdr(receptionist["token"]))
        assert r.status_code == 200
        ids = {a["id"] for a in r.json()}
        assert pytest.appt_patient_id in ids
        assert pytest.appt_walkin_id in ids

    def test_patient_can_reschedule_own(self, s, patient):
        r = s.patch(
            f"{API}/appointments/{pytest.appt_patient_id}",
            headers=_hdr(patient["token"]),
            json={"date": "2026-02-20", "time": "12:00", "status": "rescheduled"},
        )
        assert r.status_code == 200, r.text
        assert r.json()["date"] == "2026-02-20"

    def test_patient_cannot_modify_others(self, s, patient):
        r = s.patch(
            f"{API}/appointments/{pytest.appt_walkin_id}",
            headers=_hdr(patient["token"]),
            json={"date": "2026-03-01"},
        )
        assert r.status_code == 403

    def test_receptionist_can_update_any(self, s, receptionist):
        r = s.patch(
            f"{API}/appointments/{pytest.appt_patient_id}",
            headers=_hdr(receptionist["token"]),
            json={"status": "completed"},
        )
        assert r.status_code == 200
        assert r.json()["status"] == "completed"

    def test_doctor_cannot_delete_403(self, s, doctor):
        r = s.delete(
            f"{API}/appointments/{pytest.appt_walkin_id}",
            headers=_hdr(doctor["token"]),
        )
        assert r.status_code == 403

    def test_receptionist_can_cancel(self, s, receptionist):
        r = s.delete(
            f"{API}/appointments/{pytest.appt_walkin_id}",
            headers=_hdr(receptionist["token"]),
        )
        assert r.status_code == 200
        assert r.json()["status"] == "cancelled"


# ---------------- ANNOUNCEMENTS ----------------
class TestAnnouncements:
    def test_only_doctor_can_post(self, s, patient, receptionist, doctor):
        payload = {"title": "TEST anno", "body": "hello world", "type": "general"}
        for who in (patient, receptionist):
            r = s.post(f"{API}/announcements", headers=_hdr(who["token"]), json=payload)
            assert r.status_code == 403
        r = s.post(f"{API}/announcements", headers=_hdr(doctor["token"]), json=payload)
        assert r.status_code == 200
        pytest.ann_id = r.json()["id"]

    def test_get_scopes(self, s, doctor, patient, receptionist):
        # doctor -> only own
        r = s.get(f"{API}/announcements", headers=_hdr(doctor["token"]))
        assert r.status_code == 200
        for a in r.json():
            assert a["doctor_id"] == doctor["user"]["id"]
        # patient / receptionist -> can see all
        for who in (patient, receptionist):
            r = s.get(f"{API}/announcements", headers=_hdr(who["token"]))
            assert r.status_code == 200
            ids = {a["id"] for a in r.json()}
            assert pytest.ann_id in ids

    def test_delete_own_only(self, s, doctor):
        # foreign doctor cannot delete
        u2, t2, _ = _reg(s, "doctor", prefix="doc2", specialty="Ortho")
        r = s.delete(f"{API}/announcements/{pytest.ann_id}", headers=_hdr(t2))
        assert r.status_code == 404
        r = s.delete(f"{API}/announcements/{pytest.ann_id}", headers=_hdr(doctor["token"]))
        assert r.status_code == 200


# ---------------- DOCTOR STATS ----------------
class TestDoctorStats:
    def test_stats_shape(self, s, doctor):
        r = s.get(f"{API}/doctor/stats", headers=_hdr(doctor["token"]))
        assert r.status_code == 200
        d = r.json()
        for k in (
            "total_appointments",
            "scheduled",
            "completed",
            "cancelled",
            "unique_patients",
        ):
            assert k in d

    def test_stats_forbidden_for_others(self, s, patient, receptionist):
        for who in (patient, receptionist):
            r = s.get(f"{API}/doctor/stats", headers=_hdr(who["token"]))
            assert r.status_code == 403


# ---------------- EMERGENCY ALERTS ----------------
class TestEmergencyAlerts:
    def test_only_receptionist_can_post(self, s, patient, doctor, receptionist):
        payload = {"title": "TEST fire", "body": "drill", "severity": "high"}
        for who in (patient, doctor):
            r = s.post(f"{API}/emergency-alerts", headers=_hdr(who["token"]), json=payload)
            assert r.status_code == 403
        r = s.post(f"{API}/emergency-alerts", headers=_hdr(receptionist["token"]), json=payload)
        assert r.status_code == 200

    def test_list_visible_to_all_roles(self, s, patient, doctor, receptionist):
        for who in (patient, doctor, receptionist):
            r = s.get(f"{API}/emergency-alerts", headers=_hdr(who["token"]))
            assert r.status_code == 200
            assert isinstance(r.json(), list)


# ---------------- PUBLIC LEGACY ENDPOINTS ----------------
class TestPublicLegacy:
    def test_public_appointment(self, s):
        r = s.post(
            f"{API}/appointments",
            json={
                "name": "TEST Public",
                "email": f"pub_{uuid.uuid4().hex[:6]}@example.com",
                "phone": "+911234567890",
                "department": "General",
                "date": "2026-02-10",
                "message": "test",
            },
        )
        assert r.status_code == 200, r.text

    def test_newsletter(self, s):
        email = f"news_{uuid.uuid4().hex[:6]}@example.com"
        r = s.post(f"{API}/newsletter", json={"email": email})
        assert r.status_code == 200
        r = s.post(f"{API}/newsletter", json={"email": email})
        assert r.status_code == 409

    def test_status(self, s):
        r = s.post(f"{API}/status", json={"client_name": "TEST"})
        assert r.status_code == 200
        r = s.get(f"{API}/status")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
