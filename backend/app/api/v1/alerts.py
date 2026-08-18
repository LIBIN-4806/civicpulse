from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from app.core.database import get_db
from app.models.models import Alert, Location, User, Notification, AuditLog
from app.schemas.schemas import AlertCreate, AlertResponse
from app.api.v1.auth import get_current_user, get_current_admin

router = APIRouter(prefix="/alerts", tags=["Early Warnings & Alerts"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    status_filter: Optional[str] = Query(None, alias="status"),
    severity: Optional[str] = Query(None),
    location_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if status_filter:
        query = query.filter(Alert.status == status_filter.upper())
    if severity:
        query = query.filter(Alert.severity == severity.upper())
    if location_id:
        query = query.filter(Alert.location_id == location_id)
    
    alerts = query.order_by(Alert.created_at.desc()).all()
    results = []
    for a in alerts:
        res = AlertResponse.model_validate(a)
        res.location_name = a.location.name if a.location else "Regional Zone"
        results.append(res)
    return results

@router.get("/active", response_model=List[AlertResponse])
def get_active_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).filter(Alert.status == "ACTIVE").order_by(Alert.created_at.desc()).all()
    results = []
    for a in alerts:
        res = AlertResponse.model_validate(a)
        res.location_name = a.location.name if a.location else "Regional Zone"
        results.append(res)
    return results

@router.post("", response_model=AlertResponse)
def create_alert(
    alert_in: AlertCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    location = db.query(Location).filter(Location.id == alert_in.location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Target location not found")

    new_alert = Alert(
        title=alert_in.title,
        disaster_type=alert_in.disaster_type.upper(),
        severity=alert_in.severity.upper(),
        location_id=alert_in.location_id,
        affected_radius_km=alert_in.affected_radius_km,
        message=alert_in.message,
        reason=alert_in.reason,
        recommended_actions=alert_in.recommended_actions,
        issued_by_user_id=current_admin.id,
        is_official=alert_in.is_official,
        status="ACTIVE",
        expires_at=alert_in.expires_at or (datetime.now(timezone.utc) + timedelta(hours=24))
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)

    # Broadcast notification to all residents in this location
    affected_users = db.query(User).filter(User.home_location_id == location.id).all()
    for u in affected_users:
        notif = Notification(
            user_id=u.id,
            title=f"EMERGENCY WARNING: {new_alert.title}",
            message=new_alert.message,
            alert_id=new_alert.id,
            notification_type="ALERT"
        )
        db.add(notif)

    # Record Audit Log
    db.add(AuditLog(
        user_id=current_admin.id,
        action="ISSUE_ALERT",
        target_type="ALERT",
        target_id=new_alert.id,
        details=f"Issued {new_alert.severity} alert for {location.name}: {new_alert.title}"
    ))

    db.commit()
    res = AlertResponse.model_validate(new_alert)
    res.location_name = location.name
    return res

@router.patch("/{alert_id}/resolve")
def resolve_alert(
    alert_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = "RESOLVED"
    db.add(AuditLog(
        user_id=current_admin.id,
        action="RESOLVE_ALERT",
        target_type="ALERT",
        target_id=alert.id,
        details=f"Resolved alert {alert.id}: {alert.title}"
    ))
    db.commit()
    return {"message": "Alert marked as RESOLVED"}
