from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Any
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import uuid
import logging
import bcrypt
import jwt

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone
from content import TOPICS, SIMULATIONS, EXPERIMENTS, PRACTICE_QUESTIONS
from curriculum import topic_summaries, build_topic, TOPIC_META

# ---------------------------------------------------------------- setup
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="KEP PhysicsVerse API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("physicsverse")

JWT_ALGO = "HS256"
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")


def now_iso():
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------- auth utils
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "type": "access",
               "exp": datetime.now(timezone.utc) + timedelta(days=7)}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGO)


def set_auth_cookie(response: Response, token: str):
    response.set_cookie(key="access_token", value=token, httponly=True, secure=True,
                        samesite="none", max_age=604800, path="/")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGO])
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["id"] = str(user["_id"])
        user.pop("_id", None)
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------------------------------------------------------- models
class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "student"


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ChatIn(BaseModel):
    session_id: Optional[str] = None
    message: str
    difficulty: str = "standard"


class NoteIn(BaseModel):
    title: str
    content: str


class PracticeSubmitIn(BaseModel):
    question_id: str
    answer: Any


class LabReportIn(BaseModel):
    experiment_id: str
    readings: List[dict]
    observation: str = ""
    result: str = ""


class ProgressIn(BaseModel):
    concept: str
    score: int = 100


def public_user(u: dict) -> dict:
    return {"id": u["id"], "name": u["name"], "email": u["email"], "role": u["role"]}


# ---------------------------------------------------------------- auth routes
@api.post("/auth/register")
async def register(body: RegisterIn, response: Response):
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    role = body.role if body.role in ("student", "teacher") else "student"
    doc = {"name": body.name, "email": email, "password_hash": hash_password(body.password),
           "role": role, "created_at": now_iso()}
    res = await db.users.insert_one(doc)
    uid = str(res.inserted_id)
    token = create_access_token(uid, email)
    set_auth_cookie(response, token)
    return {"id": uid, "name": body.name, "email": email, "role": role, "token": token}


@api.post("/auth/login")
async def login(body: LoginIn, response: Response):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    uid = str(user["_id"])
    token = create_access_token(uid, email)
    set_auth_cookie(response, token)
    return {"id": uid, "name": user["name"], "email": email, "role": user["role"], "token": token}


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return public_user(user)


# ---------------------------------------------------------------- content routes
@api.get("/topics")
async def get_topics():
    return topic_summaries()


@api.get("/curriculum/{topic_id}")
async def get_curriculum_topic(topic_id: str):
    topic = build_topic(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    return topic


@api.get("/simulations")
async def get_simulations():
    return SIMULATIONS


@api.get("/simulations/{sim_id}")
async def get_simulation(sim_id: str):
    for s in SIMULATIONS:
        if s["id"] == sim_id:
            return s
    raise HTTPException(status_code=404, detail="Simulation not found")


@api.get("/experiments")
async def get_experiments():
    return EXPERIMENTS


@api.get("/experiments/{exp_id}")
async def get_experiment(exp_id: str):
    for e in EXPERIMENTS:
        if e["id"] == exp_id:
            return e
    raise HTTPException(status_code=404, detail="Experiment not found")


# ---------------------------------------------------------------- AI Tutor (streaming)
DIFFICULTY_HINT = {
    "simple": "Explain very simply, as if to a class 8 student. Use short sentences and everyday analogies.",
    "standard": "Explain at the level of a class 11-12 / JEE aspirant. Be clear and rigorous.",
    "advanced": "Explain at JEE Advanced / Olympiad depth with full derivations and edge cases.",
}

TUTOR_SYSTEM = (
    "You are the KEP PhysicsVerse AI Physics Tutor for Indian students preparing for JEE, NEET and Olympiads. "
    "You specialise in Mechanics. Always: explain the concept, give the governing equations, and derive step by step. "
    "Render ALL mathematics in LaTeX — inline math wrapped in single dollar signs like $v=u+at$ and block equations "
    "wrapped in double dollar signs like $$R=\\frac{v_0^2\\sin 2\\theta}{g}$$. Keep answers focused and well structured "
    "with short paragraphs and bullet points. When helpful, suggest a related PhysicsVerse simulation to try."
)


@api.post("/tutor/chat")
async def tutor_chat(body: ChatIn, user: dict = Depends(get_current_user)):
    session_id = body.session_id or str(uuid.uuid4())
    uid = user["id"]

    # load prior history for this session
    prior = await db.chat_messages.find(
        {"user_id": uid, "session_id": session_id}
    ).sort("created_at", 1).to_list(200)

    system = TUTOR_SYSTEM + " " + DIFFICULTY_HINT.get(body.difficulty, DIFFICULTY_HINT["standard"])
    if prior:
        convo = "\n".join(f"{m['role'].upper()}: {m['content']}" for m in prior[-8:])
        system += f"\n\nConversation so far:\n{convo}"
    chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"{uid}:{session_id}", system_message=system).with_model(
        "anthropic", "claude-sonnet-4-6")

    await db.chat_messages.insert_one({
        "id": str(uuid.uuid4()), "user_id": uid, "session_id": session_id,
        "role": "user", "content": body.message, "created_at": now_iso()})

    async def gen():
        yield f"data: {{\"session_id\": \"{session_id}\"}}\n\n"
        full = ""
        try:
            async for ev in chat.stream_message(UserMessage(text=body.message)):
                if isinstance(ev, TextDelta):
                    full += ev.content
                    import json as _json
                    yield f"data: {_json.dumps({'delta': ev.content})}\n\n"
                elif isinstance(ev, StreamDone):
                    break
        except Exception as e:
            logger.exception("tutor stream error")
            import json as _json
            err = "\n\n[Sorry, the tutor hit an error: " + str(e) + "]"
            yield f"data: {_json.dumps({'delta': err})}\n\n"
        await db.chat_messages.insert_one({
            "id": str(uuid.uuid4()), "user_id": uid, "session_id": session_id,
            "role": "assistant", "content": full, "created_at": now_iso()})
        yield "data: [DONE]\n\n"

    return StreamingResponse(gen(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@api.get("/tutor/sessions")
async def tutor_sessions(user: dict = Depends(get_current_user)):
    msgs = await db.chat_messages.find({"user_id": user["id"]}).sort("created_at", 1).to_list(1000)
    sessions = {}
    for m in msgs:
        sid = m["session_id"]
        if sid not in sessions:
            sessions[sid] = {"session_id": sid, "title": m["content"][:50], "count": 0, "updated": m["created_at"]}
        sessions[sid]["count"] += 1
        sessions[sid]["updated"] = m["created_at"]
    return sorted(sessions.values(), key=lambda x: x["updated"], reverse=True)


@api.get("/tutor/history/{session_id}")
async def tutor_history(session_id: str, user: dict = Depends(get_current_user)):
    msgs = await db.chat_messages.find(
        {"user_id": user["id"], "session_id": session_id}).sort("created_at", 1).to_list(500)
    return [{"role": m["role"], "content": m["content"]} for m in msgs]


# ---------------------------------------------------------------- practice
@api.get("/practice/questions")
async def practice_questions(difficulty: Optional[str] = None):
    qs = PRACTICE_QUESTIONS
    if difficulty:
        qs = [q for q in qs if q["difficulty"] == difficulty]
    # strip answers before sending
    out = []
    for q in qs:
        item = {k: v for k, v in q.items() if k not in ("answer", "solution", "tolerance")}
        out.append(item)
    return out


@api.post("/practice/submit")
async def practice_submit(body: PracticeSubmitIn, user: dict = Depends(get_current_user)):
    q = next((x for x in PRACTICE_QUESTIONS if x["id"] == body.question_id), None)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    correct = False
    if q["type"] == "mcq":
        correct = int(body.answer) == q["answer"]
    else:
        try:
            correct = abs(float(body.answer) - float(q["answer"])) <= q.get("tolerance", 0.01)
        except (ValueError, TypeError):
            correct = False
    await db.practice_attempts.insert_one({
        "id": str(uuid.uuid4()), "user_id": user["id"], "question_id": q["id"],
        "topic": q["topic"], "difficulty": q["difficulty"], "correct": correct, "created_at": now_iso()})
    return {"correct": correct, "solution": q["solution"], "answer": q["answer"]}


# ---------------------------------------------------------------- notes
@api.get("/notes")
async def list_notes(user: dict = Depends(get_current_user)):
    notes = await db.notes.find({"user_id": user["id"]}, {"_id": 0}).sort("updated_at", -1).to_list(500)
    return notes


@api.post("/notes")
async def create_note(body: NoteIn, user: dict = Depends(get_current_user)):
    note = {"id": str(uuid.uuid4()), "user_id": user["id"], "title": body.title,
            "content": body.content, "updated_at": now_iso()}
    await db.notes.insert_one(note)
    note.pop("_id", None)
    return {"id": note["id"], "title": note["title"], "content": note["content"], "updated_at": note["updated_at"]}


@api.delete("/notes/{note_id}")
async def delete_note(note_id: str, user: dict = Depends(get_current_user)):
    await db.notes.delete_one({"id": note_id, "user_id": user["id"]})
    return {"ok": True}


# ---------------------------------------------------------------- lab reports
@api.get("/lab/reports")
async def list_reports(user: dict = Depends(get_current_user)):
    reports = await db.lab_reports.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return reports


@api.post("/lab/reports")
async def create_report(body: LabReportIn, user: dict = Depends(get_current_user)):
    exp = next((e for e in EXPERIMENTS if e["id"] == body.experiment_id), None)
    title = exp["title"] if exp else body.experiment_id
    report = {"id": str(uuid.uuid4()), "user_id": user["id"], "experiment_id": body.experiment_id,
              "title": title, "readings": body.readings, "observation": body.observation,
              "result": body.result, "created_at": now_iso()}
    await db.lab_reports.insert_one(report)
    return {k: v for k, v in report.items() if k != "_id"}


@api.post("/lab/viva/{experiment_id}")
async def lab_viva(experiment_id: str, user: dict = Depends(get_current_user)):
    exp = next((e for e in EXPERIMENTS if e["id"] == experiment_id), None)
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    system = ("You are a strict but encouraging physics lab examiner conducting a viva. "
              "Ask exactly 3 short viva questions (numbered) about the experiment, then on a new line "
              "add one practical tip. Keep it under 120 words. Use $...$ for any math.")
    chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"viva:{user['id']}:{experiment_id}",
                   system_message=system).with_model("anthropic", "claude-sonnet-4-6")
    prompt = f"Experiment: {exp['title']}. Objective: {exp['objective']}"
    text = await chat.send_message(UserMessage(text=prompt))
    return {"viva": text}


# ---------------------------------------------------------------- analytics
@api.get("/analytics/me")
async def analytics_me(user: dict = Depends(get_current_user)):
    attempts = await db.practice_attempts.find({"user_id": user["id"]}).to_list(2000)
    total = len(attempts)
    correct = sum(1 for a in attempts if a["correct"])
    by_topic = {}
    for a in attempts:
        t = a["topic"]
        by_topic.setdefault(t, {"topic": t, "total": 0, "correct": 0})
        by_topic[t]["total"] += 1
        by_topic[t]["correct"] += 1 if a["correct"] else 0
    mastery = []
    for t in by_topic.values():
        pct = round(100 * t["correct"] / t["total"]) if t["total"] else 0
        mastery.append({"topic": t["topic"], "mastery": pct, "attempts": t["total"]})
    reports = await db.lab_reports.count_documents({"user_id": user["id"]})
    notes = await db.notes.count_documents({"user_id": user["id"]})
    accuracy = round(100 * correct / total) if total else 0
    readiness = min(100, round(accuracy * 0.6 + min(reports, 5) * 4 + min(len(mastery), 5) * 4))
    return {"total_attempts": total, "correct": correct, "accuracy": accuracy,
            "mastery": mastery, "lab_reports": reports, "notes": notes,
            "exam_readiness": readiness}


@api.get("/analytics/class")
async def analytics_class(user: dict = Depends(get_current_user)):
    if user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Teacher access only")
    students = await db.users.count_documents({"role": "student"})
    attempts = await db.practice_attempts.find({}).to_list(5000)
    total = len(attempts)
    correct = sum(1 for a in attempts if a["correct"])
    by_diff = {}
    for a in attempts:
        d = a["difficulty"]
        by_diff.setdefault(d, {"difficulty": d, "total": 0, "correct": 0})
        by_diff[d]["total"] += 1
        by_diff[d]["correct"] += 1 if a["correct"] else 0
    reports = await db.lab_reports.count_documents({})
    return {"students": students, "total_attempts": total,
            "avg_accuracy": round(100 * correct / total) if total else 0,
            "by_difficulty": list(by_diff.values()), "lab_reports": reports}


@api.get("/")
async def root():
    return {"message": "KEP PhysicsVerse API", "status": "online"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@physicsverse.com")
    admin_pw = os.environ.get("ADMIN_PASSWORD", "Physics@123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({"name": "Admin Teacher", "email": admin_email,
                                   "password_hash": hash_password(admin_pw), "role": "teacher",
                                   "created_at": now_iso()})
    elif not verify_password(admin_pw, existing["password_hash"]):
        await db.users.update_one({"email": admin_email},
                                  {"$set": {"password_hash": hash_password(admin_pw)}})
    # demo student
    demo_email = "student@physicsverse.com"
    if not await db.users.find_one({"email": demo_email}):
        await db.users.insert_one({"name": "Demo Student", "email": demo_email,
                                   "password_hash": hash_password("Physics@123"), "role": "student",
                                   "created_at": now_iso()})
    logger.info("PhysicsVerse startup complete")


@app.on_event("shutdown")
async def shutdown():
    client.close()
