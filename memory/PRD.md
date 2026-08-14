# KEP PhysicsVerse™ — Product Requirements Document

## Original Problem Statement
Build "KEP PhysicsVerse — The Interactive Physics Operating System" (tagline: *Don't Learn Physics. Experience It.*). An immersive physics platform where students explore concepts through real-time interactive simulations, virtual labs, an AI tutor, graph plotting and practice. MVP focus: **Mechanics module** (browser-based fullstack).

## User Choices (confirmed)
- Features: interactive simulations + Graph Studio, AI Physics Tutor, Virtual Lab workflow, JEE/NEET practice (all built).
- AI model: **Claude Sonnet 4.6** (via Emergent universal key / emergentintegrations).
- Auth: **JWT email/password** with Student & Teacher roles.
- Visual style: bright, clean educational look.
- Simulations: real-time interactive canvas with instant slider updates (core).

## Architecture
- **Backend**: FastAPI (`/app/backend/server.py`, content in `content.py`), MongoDB (motor). JWT auth (bcrypt + PyJWT, httpOnly cookie + Bearer). AI via `emergentintegrations.LlmChat` (`claude-sonnet-4-6`), streaming SSE for tutor, non-stream for lab viva.
- **Frontend**: React + React Router + Tailwind + shadcn/ui. Zustand not needed; local state + axios. KaTeX for equations (react-katex), Recharts for live graphs. Custom canvas physics engine (`components/sims/SimEngine.jsx` + `configs.js`).
- Fonts: Outfit (display), IBM Plex Sans (body), Source Code Pro (mono/data). Primary color blue #2563EB.

## User Personas
1. **Student (Class 8–12 / JEE / NEET)** — runs simulations, performs lab experiments, asks AI tutor, practices problems, tracks readiness.
2. **Teacher** — monitors class analytics, browses content library to assign.

## Core Requirements (static)
- Real-time interactive Mechanics simulations with live graphs.
- AI tutor that explains + derives with LaTeX, multi-difficulty.
- Guided virtual lab (objective → run → record → analyse → AI viva → report).
- Adaptive JEE/NEET practice (MCQ + numerical) with solutions.
- Role-based auth; teacher-only class analytics.

## Implemented (2026-06-13)
- **Auth**: register/login/logout/me, Student+Teacher roles, seeded admin + demo student. (`/api/auth/*`)
- **Physics Universe**: topic tiles + 6 live simulations (Projectile, Pendulum, Mass-Spring, 1D Collision, Gravity/Orbits, Inclined Plane) — real ODE integration on canvas with sliders + live measurements.
- **Graph Studio**: pick any sim, live plotted series (position/velocity/etc.), CSV export.
- **AI Tutor**: streaming Claude Sonnet 4.6 chat, difficulty toggle, session history, LaTeX/markdown rendering.
- **Virtual Lab**: 2 experiments (measure g via pendulum, Hooke's law k), 6-step workflow, editable readings table, scatter graph, AI viva, saved lab reports.
- **Practice**: 10 questions (easy/medium/hard, MCQ + numerical), instant feedback + worked solutions, live score.
- **Notes**: create/list/delete with LaTeX support.
- **Analytics**: accuracy, concept mastery bars, exam-readiness radial. **Teacher Studio**: class stats + content library (teacher-gated).
- Landing page, responsive layout with sidebar, mobile drawer.

## Verification
- Backend: 31/31 pytest passed. Frontend: 12/12 critical flows passed (Playwright on preview). AI tutor + lab viva verified with real Claude output.

## Backlog (P1/P2)
- P1: Physics Sandbox (design bridge/rocket), more simulations (25–30 target), handwriting/photo input to tutor, offline support (PWA).
- P1: Teacher assignment creation + student submissions; assessment engine (assertion-reason, match, diagram).
- P2: Multiplayer physics lab, marketplace, additional topics (Electricity, Optics, etc.), virtual instruments (oscilloscope/multimeter), voice tutor.

## Next Tasks
- Add more Mechanics simulations toward the 25–30 target.
- Expand practice bank + true adaptive difficulty engine.
- Add Physics Sandbox module.
