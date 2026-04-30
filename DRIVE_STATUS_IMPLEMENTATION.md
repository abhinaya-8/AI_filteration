# Recruitment Drive Status System - Implementation Guide

## Overview
A comprehensive status management system for recruitment drives with automatic status updates, manual overrides, and beautiful UI components.

## Status Values
- **Open** (🟢 Green): Accepting applications, less than 70% filled
- **Filling Fast** (🟡 Yellow): High demand, 70-99% filled
- **Closed** (🔴 Red): Deadline passed or manually closed

## Backend Implementation

### 1. Status Calculation Logic (`app/utils/status.py`)
Automatic status calculation based on:
- Manual override (takes highest priority)
- Deadline passed → Closed
- Applications ≥ 70% of total openings → Filling Fast
- Otherwise → Open

```python
from app.utils.status import calculate_drive_status, get_status_display

# Calculate status for a drive
status_data = calculate_drive_status(drive, db)
status_display = get_status_display(status_data)

# Returns:
# {
#   "status": "Open|Filling Fast|Closed",
#   "color": "green|yellow|red",
#   "progress": {
#     "applications": int,
#     "total": int,
#     "percentage": int (0-100)
#   }
# }
```

### 2. New Drive Fields
When creating/updating a drive:

```json
{
  "roleTitle": "Senior Developer",
  "jobDescription": "...",
  "totalOpenings": 5,
  "deadline": "2026-12-31",
  "filteringCriteria": "optional",
  "statusOverride": null
}
```

### 3. API Endpoints

#### Create Drive
```
POST /api/drives
Body: {
  "roleTitle": string (required),
  "jobDescription": string,
  "totalOpenings": number,
  "deadline": ISO date string (optional),
  "filteringCriteria": string (optional)
}

Response includes:
- id, status, statusColor, progress
- progress: { applications, total, percentage }
```

#### List Drives
```
GET /api/drives
Query: ?companyId=... (optional for users)

Response: Array of drives with status info
- Regular users: only see Open/Filling Fast drives
- Admins: see all their company drives
```

#### Get Single Drive
```
GET /api/drives/:id

Response: Drive with full status information
```

#### Update Drive (with manual override)
```
PATCH /api/drives/:id
Body: {
  "roleTitle": string,
  "jobDescription": string,
  "totalOpenings": number,
  "deadline": ISO date string,
  "statusOverride": "Open|Filling Fast|Closed|null"
}

statusOverride = null removes the override
```

### 4. Upload Resume Validation
Automatically checks drive status before allowing applications:
```python
status_data = calculate_drive_status(drive, db)
if status_data["status"] == "Closed":
    return error "Drive is closed for applications"
```

## Frontend Implementation

### 1. Components

#### DriveStatusBadge
Display drive status with emoji and color coding.
```jsx
import DriveStatusBadge from './components/DriveStatusBadge'

<DriveStatusBadge status="Open" size="md" />
// Output: 🟢 Open
```

Props:
- `status`: "Open" | "Filling Fast" | "Closed"
- `size`: "sm" | "md" | "lg" (default: "md")

#### ProgressIndicator
Show applications vs total openings with progress bar.
```jsx
import ProgressIndicator from './components/ProgressIndicator'

<ProgressIndicator
  applications={3}
  total={5}
  showLabel={true}
  size="md"
/>
```

Props:
- `applications`: number of current applications
- `total`: total positions available
- `showLabel`: show "Applications" label (default: true)
- `size`: "sm" | "md" | "lg"

#### DriveCard
Complete drive display card with all information and actions.
```jsx
import DriveCard from './components/DriveCard'

<DriveCard
  drive={driveData}
  isAdmin={true}
  onStatusChange={handleStatusUpdate}
  onEdit={handleEdit}
  onViewDetails={handleViewDetails}
  showDeadline={true}
/>
```

Props:
- `drive`: drive object with status and progress
- `isAdmin`: show admin controls (default: false)
- `onStatusChange`: callback for manual status update
- `onEdit`: callback for edit button
- `onViewDetails`: callback for view details button
- `showDeadline`: show deadline field (default: true)

### 2. Admin Dashboard Usage

```jsx
import { useState, useEffect } from 'react'
import { listDrives, updateDrive } from '../services/api'
import DriveCard from '../components/DriveCard'

function AdminDashboard() {
  const [drives, setDrives] = useState([])

  useEffect(() => {
    loadDrives()
  }, [])

  const loadDrives = async () => {
    const response = await listDrives()
    setDrives(response.data)
  }

  const handleStatusUpdate = async (driveId, newStatus) => {
    await updateDrive(driveId, { statusOverride: newStatus })
    loadDrives() // Refresh
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {drives.map(drive => (
        <DriveCard
          key={drive.id}
          drive={drive}
          isAdmin={true}
          onStatusChange={handleStatusUpdate}
        />
      ))}
    </div>
  )
}
```

### 3. User Dashboard Usage

```jsx
import DriveCard from '../components/DriveCard'

function UserCompanyDrives() {
  const [drives, setDrives] = useState([])

  useEffect(() => {
    loadDrives()
  }, [companyId])

  const handleApply = (drive) => {
    if (drive.status === 'Closed') {
      alert('This drive is closed for applications')
      return
    }
    // Show apply modal
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {drives.map(drive => (
        <DriveCard
          key={drive.id}
          drive={drive}
          isAdmin={false}
          onViewDetails={handleApply}
          showDeadline={true}
        />
      ))}
    </div>
  )
}
```

### 4. Disable Apply Button for Closed Drives

```jsx
function ApplyButton({ drive, onClick }) {
  const isDisabled = drive.status === 'Closed'
  
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`px-4 py-2 rounded font-medium ${
        isDisabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {isDisabled ? '❌ Closed' : '✅ Apply Now'}
    </button>
  )
}
```

## API Service Integration

Add to `frontend/src/services/api.js`:

```javascript
export const updateDrive = (driveId, data) => 
  api.patch(`/drives/${driveId}`, data)
```

## Workflow Example

### For Admins:
1. Create drive with deadline and total openings
2. System automatically calculates status based on:
   - Current date vs deadline
   - Number of applications vs total openings
3. Can manually override status anytime (useful for edge cases)
4. Dashboard shows all drives with status badges and progress bars
5. Can click drive to see applications and filter results

### For Users:
1. Browse available drives (only see Open/Filling Fast)
2. See progress bar showing how many spots are filled
3. Can only apply to Open or Filling Fast drives
4. Try to apply to Closed drive → button disabled with message
5. Deadline information helps with decision-making

## Color Scheme
- **Open (🟢)**: `bg-green-100 text-green-800`
- **Filling Fast (🟡)**: `bg-yellow-100 text-yellow-800`
- **Closed (🔴)**: `bg-red-100 text-red-800`

## Testing Checklist

- [ ] Create drive with deadline in past → Status should be "Closed"
- [ ] Create drive, upload 70%+ applications → Status should be "Filling Fast"
- [ ] Manually override status → Status should show override
- [ ] Try to apply to closed drive → Apply button disabled
- [ ] Regular user sees only Open/Filling Fast drives
- [ ] Admin sees all drives
- [ ] Progress bar shows correct percentage
- [ ] Status badge displays correct color and emoji
- [ ] Deadline field displays correctly formatted date

## Performance Notes

- Status calculation is done on-demand (when fetching drives)
- Consider caching status if querying frequently
- Application count is efficient with MongoDB count_documents()
- Use pagination for large drive lists

## Future Enhancements

- [ ] Bulk status updates
- [ ] Status change history/audit log
- [ ] Automatic status alerts for admins
- [ ] Email notifications when drive reaches 70%
- [ ] Drive analytics dashboard
- [ ] Scheduled status updates based on cron jobs
