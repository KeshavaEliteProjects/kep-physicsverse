"""KEP PhysicsVerse backend API test suite."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

STUDENT_EMAIL = "student@physicsverse.com"
TEACHER_EMAIL = "admin@physicsverse.com"
PASSWORD = "Physics@123"


# ---------------- fixtures
@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _login(email, password):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=15)
    return r


@pytest.fixture(scope="module")
def student_token():
    r = _login(STUDENT_EMAIL, PASSWORD)
    assert r.status_code == 200, f"student login failed: {r.status_code} {r.text}"
    data = r.json()
    assert data.get("token") and data.get("role") == "student"
    return data["token"]


@pytest.fixture(scope="module")
def teacher_token():
    r = _login(TEACHER_EMAIL, PASSWORD)
    assert r.status_code == 200, f"teacher login failed: {r.status_code} {r.text}"
    return r.json()["token"]


def sh(token):
    return {"Content-Type": "application/json", "Authorization": f"Bearer {token}"}


# ---------------- auth
class TestAuth:
    def test_root(self):
        r = requests.get(f"{API}/", timeout=10)
        assert r.status_code == 200
        assert r.json().get("status") == "online"

    def test_register_new_student(self):
        email = f"TEST_stu_{uuid.uuid4().hex[:8]}@physicsverse.com"
        r = requests.post(f"{API}/auth/register", json={
            "name": "TEST Student", "email": email, "password": "Physics@123", "role": "student"
        }, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["role"] == "student"
        assert data["token"]
        assert data["email"] == email.lower()

    def test_register_new_teacher(self):
        email = f"TEST_tea_{uuid.uuid4().hex[:8]}@physicsverse.com"
        r = requests.post(f"{API}/auth/register", json={
            "name": "TEST Teacher", "email": email, "password": "Physics@123", "role": "teacher"
        }, timeout=15)
        assert r.status_code == 200
        assert r.json()["role"] == "teacher"

    def test_register_duplicate_email(self):
        r = requests.post(f"{API}/auth/register", json={
            "name": "Dup", "email": STUDENT_EMAIL, "password": "Physics@123", "role": "student"
        }, timeout=15)
        assert r.status_code == 400

    def test_login_student(self, student_token):
        assert isinstance(student_token, str) and len(student_token) > 0

    def test_login_teacher(self, teacher_token):
        assert isinstance(teacher_token, str) and len(teacher_token) > 0

    def test_login_invalid(self):
        r = _login(STUDENT_EMAIL, "wrong-password")
        assert r.status_code == 401

    def test_me_with_bearer(self, student_token):
        r = requests.get(f"{API}/auth/me", headers=sh(student_token), timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == STUDENT_EMAIL and d["role"] == "student"

    def test_me_unauth(self):
        r = requests.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 401

    def test_login_sets_cookie(self):
        r = _login(STUDENT_EMAIL, PASSWORD)
        assert r.status_code == 200
        cookies = r.cookies
        assert "access_token" in cookies


# ---------------- content
class TestContent:
    def test_topics(self):
        r = requests.get(f"{API}/topics", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) >= 6
        assert any(t["id"] == "mechanics" for t in data)

    def test_simulations(self):
        r = requests.get(f"{API}/simulations", timeout=10)
        assert r.status_code == 200
        ids = [s["id"] for s in r.json()]
        for expected in ["projectile", "pendulum", "collision", "spring", "orbit", "incline"]:
            assert expected in ids

    def test_simulation_projectile(self):
        r = requests.get(f"{API}/simulations/projectile", timeout=10)
        assert r.status_code == 200
        assert r.json()["id"] == "projectile"

    def test_simulation_404(self):
        r = requests.get(f"{API}/simulations/nonexistent", timeout=10)
        assert r.status_code == 404

    def test_experiments(self):
        r = requests.get(f"{API}/experiments", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 2
        assert any(e["id"] == "exp-pendulum-g" for e in data)


# ---------------- practice
class TestPractice:
    def test_list_questions(self):
        r = requests.get(f"{API}/practice/questions", timeout=10)
        assert r.status_code == 200
        qs = r.json()
        assert len(qs) >= 10
        # answers must be stripped
        assert not any("answer" in q for q in qs)
        assert not any("solution" in q for q in qs)

    def test_filter_easy(self):
        r = requests.get(f"{API}/practice/questions?difficulty=easy", timeout=10)
        assert r.status_code == 200
        for q in r.json():
            assert q["difficulty"] == "easy"

    def test_submit_mcq_correct(self, student_token):
        # q2 answer=1 (45°)
        r = requests.post(f"{API}/practice/submit",
                          json={"question_id": "q2", "answer": 1},
                          headers=sh(student_token), timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["correct"] is True
        assert d["solution"]

    def test_submit_mcq_incorrect(self, student_token):
        r = requests.post(f"{API}/practice/submit",
                          json={"question_id": "q2", "answer": 3},
                          headers=sh(student_token), timeout=10)
        assert r.status_code == 200
        assert r.json()["correct"] is False

    def test_submit_numerical(self, student_token):
        # q3 answer=5.0
        r = requests.post(f"{API}/practice/submit",
                          json={"question_id": "q3", "answer": 5.0},
                          headers=sh(student_token), timeout=10)
        assert r.status_code == 200
        assert r.json()["correct"] is True

    def test_submit_unknown_question(self, student_token):
        r = requests.post(f"{API}/practice/submit",
                          json={"question_id": "nope", "answer": 1},
                          headers=sh(student_token), timeout=10)
        assert r.status_code == 404

    def test_submit_requires_auth(self):
        r = requests.post(f"{API}/practice/submit",
                          json={"question_id": "q1", "answer": 1}, timeout=10)
        assert r.status_code == 401


# ---------------- notes CRUD
class TestNotes:
    def test_create_list_delete(self, student_token):
        # create
        r = requests.post(f"{API}/notes",
                          json={"title": "TEST_note", "content": "hello world"},
                          headers=sh(student_token), timeout=10)
        assert r.status_code == 200
        note = r.json()
        assert note["id"] and note["title"] == "TEST_note"
        nid = note["id"]

        # list
        r = requests.get(f"{API}/notes", headers=sh(student_token), timeout=10)
        assert r.status_code == 200
        ids = [n["id"] for n in r.json()]
        assert nid in ids

        # delete
        r = requests.delete(f"{API}/notes/{nid}", headers=sh(student_token), timeout=10)
        assert r.status_code == 200

        # verify deleted
        r = requests.get(f"{API}/notes", headers=sh(student_token), timeout=10)
        assert nid not in [n["id"] for n in r.json()]


# ---------------- lab reports
class TestLab:
    def test_create_and_list_report(self, student_token):
        payload = {
            "experiment_id": "exp-pendulum-g",
            "readings": [{"length": 1.0, "period": 2.0}],
            "observation": "TEST observation",
            "result": "g ≈ 9.85 m/s²"
        }
        r = requests.post(f"{API}/lab/reports", json=payload,
                          headers=sh(student_token), timeout=15)
        assert r.status_code == 200, r.text
        report = r.json()
        assert report["title"]
        assert report["id"]

        r = requests.get(f"{API}/lab/reports", headers=sh(student_token), timeout=10)
        assert r.status_code == 200
        assert any(rep["id"] == report["id"] for rep in r.json())

    def test_lab_viva_ai(self, student_token):
        # Real Claude call - allow up to 60s
        r = requests.post(f"{API}/lab/viva/exp-pendulum-g",
                          headers=sh(student_token), timeout=90)
        assert r.status_code == 200, r.text
        data = r.json()
        text = data.get("viva", "")
        assert isinstance(text, str)
        assert len(text) > 40, f"viva too short: {text!r}"
        # Should include numbered questions or at least mention pendulum-related content
        low = text.lower()
        assert any(k in low for k in ["pendulum", "period", "length", "gravity", "g"]), \
            f"viva did not reference experiment: {text[:200]}"

    def test_lab_viva_404(self, student_token):
        r = requests.post(f"{API}/lab/viva/nonexistent",
                          headers=sh(student_token), timeout=15)
        assert r.status_code == 404


# ---------------- analytics
class TestAnalytics:
    def test_my_analytics(self, student_token):
        r = requests.get(f"{API}/analytics/me", headers=sh(student_token), timeout=10)
        assert r.status_code == 200
        d = r.json()
        for k in ["total_attempts", "correct", "accuracy", "mastery",
                  "lab_reports", "notes", "exam_readiness"]:
            assert k in d

    def test_class_analytics_teacher(self, teacher_token):
        r = requests.get(f"{API}/analytics/class", headers=sh(teacher_token), timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert "students" in d and "avg_accuracy" in d

    def test_class_analytics_forbids_student(self, student_token):
        r = requests.get(f"{API}/analytics/class", headers=sh(student_token), timeout=10)
        assert r.status_code == 403


# ---------------- tutor (SSE streaming)
class TestTutor:
    def test_sessions_empty_ok(self, student_token):
        r = requests.get(f"{API}/tutor/sessions", headers=sh(student_token), timeout=10)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_tutor_sse_stream(self, student_token):
        # POST with streaming; collect deltas
        payload = {"message": "What is 17 + 26? Reply with just the number.",
                   "difficulty": "simple"}
        r = requests.post(f"{API}/tutor/chat", json=payload,
                          headers=sh(student_token), stream=True, timeout=90)
        assert r.status_code == 200
        assert "text/event-stream" in r.headers.get("content-type", "")

        deltas = []
        session_id = None
        got_done = False
        import json as _json
        for line in r.iter_lines(decode_unicode=True):
            if not line:
                continue
            if line.startswith("data: "):
                payload_str = line[6:]
                if payload_str == "[DONE]":
                    got_done = True
                    break
                try:
                    obj = _json.loads(payload_str)
                except Exception:
                    continue
                if "session_id" in obj:
                    session_id = obj["session_id"]
                if "delta" in obj:
                    deltas.append(obj["delta"])
        full = "".join(deltas)
        assert session_id, "no session_id from SSE"
        assert got_done, "SSE never sent [DONE]"
        assert len(full) > 0, "no text streamed"
        assert "[Sorry, the tutor hit an error" not in full, f"tutor errored: {full[:200]}"
        # Content check
        assert "43" in full, f"tutor did not answer arithmetic. Reply: {full[:300]}"

        # Verify history endpoint
        r2 = requests.get(f"{API}/tutor/history/{session_id}",
                          headers=sh(student_token), timeout=10)
        assert r2.status_code == 200
        hist = r2.json()
        assert len(hist) >= 2
        assert hist[0]["role"] == "user"
        assert hist[-1]["role"] == "assistant"
