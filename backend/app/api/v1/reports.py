from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
import shutil
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.config import settings
from app.models.models import CitizenReport, User, AuditLog
from app.schemas.schemas import CitizenReportCreate, CitizenReportResponse, CitizenReportVerify
from app.api.v1.auth import get_current_user, get_current_admin
from app.services.image_service import analyze_incident_image

router = APIRouter(prefix="/reports", tags=["Citizen Incident Reports"])

@router.get("", response_model=List[CitizenReportResponse])
def get_reports(
    status_filter: Optional[str] = Query(None, alias="status"),
    incident_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(CitizenReport)
    if status_filter:
        query = query.filter(CitizenReport.status == status_filter.upper())
    if incident_type:
        query = query.filter(CitizenReport.incident_type == incident_type.upper())
        
    reports = query.order_by(CitizenReport.created_at.desc()).all()
    results = []
    for r in reports:
        res = CitizenReportResponse.model_validate(r)
        res.user_name = r.user.full_name if r.user else "Anonymous Citizen"
        results.append(res)
    return results

@router.post("", response_model=CitizenReportResponse)
def submit_report(
    report_in: CitizenReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Run AI hazard classification on text & image hint
    ai_hazard, ai_conf = analyze_incident_image(
        filename=report_in.image_url or "",
        description=report_in.description + " " + report_in.incident_type
    )

    new_report = CitizenReport(
        user_id=current_user.id,
        incident_type=report_in.incident_type.upper(),
        description=report_in.description,
        latitude=report_in.latitude,
        longitude=report_in.longitude,
        location_name=report_in.location_name or "Geotagged Location",
        image_url=report_in.image_url,
        ai_detected_hazard=ai_hazard,
        ai_confidence=ai_conf,
        severity=report_in.severity or "MODERATE",
        affected_people_count=report_in.affected_people_count or 1,
        status="PENDING"
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    res = CitizenReportResponse.model_validate(new_report)
    res.user_name = current_user.full_name
    return res

@router.post("/upload-photo")
def upload_incident_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    unique_filename = f"report_{uuid.uuid4().hex[:10]}{ext}"
    dest_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_url = f"/static/uploads/{unique_filename}"
    ai_hazard, ai_conf = analyze_incident_image(file.filename, "")
    
    return {
        "url": file_url,
        "filename": unique_filename,
        "ai_detected_hazard": ai_hazard,
        "ai_confidence": ai_conf
    }

@router.patch("/{report_id}/verify", response_model=CitizenReportResponse)
def verify_report(
    report_id: int,
    verify_in: CitizenReportVerify,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    report = db.query(CitizenReport).filter(CitizenReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Incident report not found")
        
    report.status = verify_in.status.upper()
    report.verified_by_user_id = current_admin.id
    report.verification_notes = verify_in.verification_notes
    
    # Audit log
    db.add(AuditLog(
        user_id=current_admin.id,
        action="VERIFY_REPORT",
        target_type="CITIZEN_REPORT",
        target_id=report.id,
        details=f"Report {report.id} marked as {report.status}. Notes: {report.verification_notes}"
    ))
    
    db.commit()
    db.refresh(report)
    res = CitizenReportResponse.model_validate(report)
    res.user_name = report.user.full_name if report.user else "Citizen"
    return res
