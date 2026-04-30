"""
Utility functions for recruitment drive status management.
"""
from datetime import datetime
from bson import ObjectId


def calculate_drive_status(drive, db):
    """
    Calculate the current status of a recruitment drive based on:
    1. Manual override (statusOverride field)
    2. Deadline (if passed, status = Closed)
    3. Application percentage (if >= 70%, status = Filling Fast)
    4. Otherwise = Open
    
    Returns: { "status": str, "reason": str, "applicationCount": int, "totalOpenings": int }
    """
    
    total_openings = drive.get("totalOpenings", 0)
    
    # Always count applications for this drive
    application_count = db.resumes.count_documents(
        {"recruitmentDriveId": str(drive["_id"])}
    )
    
    # Check for manual override first
    if drive.get("statusOverride"):
        return {
            "status": drive["statusOverride"],
            "reason": "manually_overridden",
            "applicationCount": application_count,
            "totalOpenings": total_openings,
        }
    
    # Check deadline
    deadline = drive.get("deadline")
    if deadline and isinstance(deadline, str):
        try:
            deadline = datetime.fromisoformat(deadline.replace("Z", "+00:00"))
        except:
            deadline = None
    
    if deadline and datetime.utcnow() > deadline:
        return {
            "status": "Closed",
            "reason": "deadline_passed",
            "applicationCount": application_count,
            "totalOpenings": total_openings,
        }
    
    # Calculate percentage if totalOpenings is set
    if total_openings > 0:
        percentage = (application_count / total_openings) * 100
        if percentage >= 70:
            return {
                "status": "Filling Fast",
                "reason": "high_applications",
                "applicationCount": application_count,
                "totalOpenings": total_openings,
            }
    
    return {
        "status": "Open",
        "reason": "accepting_applications",
        "applicationCount": application_count,
        "totalOpenings": total_openings,
    }


def get_status_color(status):
    """Get badge color for status"""
    colors = {
        "Open": "green",
        "Filling Fast": "yellow",
        "Closed": "red",
    }
    return colors.get(status, "gray")


def get_status_display(status_data):
    """Format status for display"""
    status = status_data.get("status", "Open")
    app_count = status_data.get("applicationCount", 0)
    total = status_data.get("totalOpenings", 0)
    
    return {
        "status": status,
        "color": get_status_color(status),
        "progress": {
            "applications": app_count,
            "total": total,
            "percentage": int((app_count / total * 100) if total > 0 else 0),
        },
    }
