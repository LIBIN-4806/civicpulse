from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List, Optional
import io
import csv
from app.core.database import get_db
from app.models.models import Location, Alert, CitizenReport, Shelter, AuditLog, User
from app.schemas.schemas import AuditLogResponse
from app.api.v1.auth import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin & Command Center"])

@router.get("/dashboard")
def get_admin_dashboard_data(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    locations = db.query(Location).all()
    active_alerts = db.query(Alert).filter(Alert.status == "ACTIVE").order_by(Alert.created_at.desc()).all()
    pending_reports = db.query(CitizenReport).filter(CitizenReport.status == "PENDING").order_by(CitizenReport.created_at.desc()).all()
    recent_reports = db.query(CitizenReport).order_by(CitizenReport.created_at.desc()).limit(10).all()
    shelters = db.query(Shelter).all()
    audit_logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(15).all()

    return {
        "admin_name": current_admin.full_name,
        "admin_role": current_admin.role,
        "total_monitored_locations": len(locations),
        "active_alerts": [
            {
                "id": a.id,
                "title": a.title,
                "disaster_type": a.disaster_type,
                "severity": a.severity,
                "location_name": a.location.name if a.location else "Zone",
                "affected_radius_km": a.affected_radius_km,
                "created_at": a.created_at
            }
            for a in active_alerts
        ],
        "pending_reports_count": len(pending_reports),
        "recent_reports": [
            {
                "id": r.id,
                "incident_type": r.incident_type,
                "description": r.description,
                "location_name": r.location_name,
                "severity": r.severity,
                "status": r.status,
                "ai_detected_hazard": r.ai_detected_hazard,
                "ai_confidence": r.ai_confidence,
                "created_at": r.created_at
            }
            for r in recent_reports
        ],
        "shelters_summary": {
            "total_shelters": len(shelters),
            "total_capacity": sum(s.capacity for s in shelters),
            "total_occupancy": sum(s.current_occupancy for s in shelters)
        },
        "recent_audit_logs": [
            {
                "id": log.id,
                "action": log.action,
                "target_type": log.target_type,
                "details": log.details,
                "timestamp": log.timestamp
            }
            for log in audit_logs
        ]
    }

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(50).all()
    return logs

@router.get("/export-csv")
def export_reports_csv(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    reports = db.query(CitizenReport).order_by(CitizenReport.created_at.desc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Report ID", "Incident Type", "Description", "Location", "Latitude", "Longitude", "AI Classification", "AI Confidence", "Severity", "Status", "Date Reported"])
    
    for r in reports:
        writer.writerow([
            r.id,
            r.incident_type,
            r.description,
            r.location_name or "",
            r.latitude,
            r.longitude,
            r.ai_detected_hazard or "",
            r.ai_confidence,
            r.severity,
            r.status,
            r.created_at.strftime("%Y-%m-%d %H:%M:%S")
        ])
        
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=civicpulse_incident_reports.csv"}
    )
