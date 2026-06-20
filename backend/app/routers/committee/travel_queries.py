from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.travel_query import TravelQuery
from app.models.participant import Participant
from app.models.team import Team
from pydantic import BaseModel
import datetime

router = APIRouter()

class CommitteeReplyRequest(BaseModel):
    reply_text: str

class CommitteeStatusUpdate(BaseModel):
    status: str

@router.get("/queries")
def get_all_queries(db: Session = Depends(get_db)):
    """Get all travel queries for committee"""
    queries = db.query(TravelQuery).order_by(TravelQuery.created_at.desc()).all()
    
    result = []
    for q in queries:
        participant = db.query(Participant).filter(Participant.id == q.participant_id).first()
        team = db.query(Team).filter(Team.id == q.team_id).first()
        
        # Map status for frontend
        display_status = q.status
        if q.status == "Submitted": display_status = "Open"
        elif q.status == "Committee Replied": display_status = "Awaiting Response"
        
        # Priority logic
        priority = "Medium"
        if q.category in ["Reimbursement", "Food & Dietary"]: priority = "High"
        
        result.append({
            "id": str(q.id),
            "participant_name": participant.name if participant else "Unknown",
            "participant_initials": "".join([n[0].upper() for n in (participant.name or "UN").split()[:2]]),
            "team_name": team.name if team else "Unknown",
            "category": q.category,
            "subject": q.subject,
            "message": q.message,
            "status": display_status,
            "priority": priority,
            "conversation": q.conversation or [],
            "created_at": q.created_at.isoformat() if q.created_at else None
        })
    
    return {"queries": result}

@router.post("/queries/{query_id}/reply")
def reply_to_query(query_id: str, req: CommitteeReplyRequest, db: Session = Depends(get_db)):
    """Committee replies to query"""
    query = db.query(TravelQuery).filter(TravelQuery.id == query_id).first()
    if not query:
        raise HTTPException(status_code=404, detail="Query not found")
    
    print(f"📩 Received reply for query {query_id}: {req.reply_text}")
    
    # Create the new reply message
    new_reply = {
        "from": "HackFlow Committee",
        "text": req.reply_text,
        "time": datetime.datetime.utcnow().isoformat(),
        "isUser": False
    }
    
    # Force SQLAlchemy to update the JSON column by creating a brand new list
    current_conversation = query.conversation if query.conversation else []
    updated_conversation = current_conversation + [new_reply]
    
    query.conversation = updated_conversation
    query.status = "Committee Replied"
    query.updated_at = datetime.datetime.utcnow()
    
    db.commit()
    db.refresh(query)
    
    print(f"✅ Reply saved. Total messages in conversation: {len(query.conversation)}")
    
    return {"message": "Reply sent", "conversation": query.conversation}

@router.patch("/queries/{query_id}/status")
def update_query_status(query_id: str, req: CommitteeStatusUpdate, db: Session = Depends(get_db)):
    """Update query status"""
    query = db.query(TravelQuery).filter(TravelQuery.id == query_id).first()
    if not query:
        raise HTTPException(status_code=404, detail="Query not found")
    
    status_map = {
        "Open": "Submitted",
        "Awaiting Response": "Committee Replied",
        "Resolved": "Resolved"
    }
    
    query.status = status_map.get(req.status, req.status)
    query.updated_at = datetime.datetime.utcnow()
    db.commit()
    
    return {"message": "Status updated", "status": query.status}