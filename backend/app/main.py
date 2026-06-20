from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Auth
from app.routers import auth

# Committee Routers
from app.routers.committee import (
    events,
    participants,
    dashboard,
    rules,
    teams,
    results,
    travel_logistics,
    travel_queries  # ← NEW: Import travel queries router
)

# Portal Routers
from app.routers.portal import judge, judge_evaluations

app = FastAPI(title="Event Orchestration API", version="1.0.0")

# --- Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your Vite frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---

# Auth
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

# Committee API
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])
app.include_router(participants.router, prefix="/api/events", tags=["Participants"])
app.include_router(teams.router, prefix="/api/events/{event_id}/teams", tags=["teams"])
app.include_router(rules.router, prefix="/api/events", tags=["rules"])
app.include_router(results.router, prefix="/api/results", tags=["Results"])
app.include_router(travel_logistics.router, prefix="/api/travel-logistics", tags=["Travel Logistics"])
app.include_router(travel_queries.router, prefix="/api/committee/travel", tags=["Committee Travel Queries"])  # ← NEW

# Public/Portal API
from app.routers.portal import participant as portal_participant
from app.routers.portal import travel as portal_travel
from app.routers.portal import notifications as portal_notifications
app.include_router(portal_participant.router, prefix="/api/participant", tags=["Portal - Participant"])
app.include_router(portal_notifications.router, prefix="/api/participant/notifications", tags=["Portal - Participant Notifications"])
app.include_router(portal_travel.router, prefix="/api/participant/travel", tags=["Portal - Participant Travel"])

from app.routers.portal import judge as portal_judge
app.include_router(portal_judge.router, prefix="/api/judge", tags=["Judge Portal"])
app.include_router(judge_evaluations.router, prefix="/api/judge/evaluations", tags=["Judge Portal"])