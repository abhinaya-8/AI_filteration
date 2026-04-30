# Recruitment Drive Status System - Changes Summary

## What Was Added

### 🔧 Backend Changes

#### 1. New Utility Module: `app/utils/status.py`
- **`calculate_drive_status(drive, db)`**: Intelligently calculates drive status
  - Checks manual override first (highest priority)
  - Checks if deadline has passed → Closed
  - Checks if applications ≥ 70% of total → Filling Fast
  - Otherwise → Open
  - Returns: status, reason, applicationCount, totalOpenings

- **`get_status_color(status)`**: Maps status to badge color
  - Open → green
  - Filling Fast → yellow
  - Closed → red

- **`get_status_display(status_data)`**: Formats status for API response
  - Returns: status, color, progress (applications, total, percentage)

#### 2. Updated: `app/routes/recruitment_drives.py`
- **New Fields in Drive Documents:**
  - `totalOpenings`: Number of positions (integer)
  - `deadline`: ISO date string (optional)
  - `statusOverride`: Manual status override (Open|Filling Fast|Closed|null)

- **Create Drive Endpoint (POST /api/drives)**
  - Now accepts: totalOpenings, deadline
  - Returns: status, statusColor, progress information
  - Auto-calculates status instead of manual hiring status

- **List Drives (GET /api/drives)**
  - Returns all drives with calculated status and progress
  - Regular users: only see Open/Filling Fast drives
  - Admins: see all their company drives

- **Get Drive (GET /api/drives/:id)**
  - Returns drive with full status information
  - Progress bar data included

- **Update Drive (PATCH /api/drives/:id)**
  - Can now update: totalOpenings, deadline, statusOverride
  - Manual override allows admins to force a status

#### 3. Updated: `app/routes/resumes.py`
- **Validation Improvement:**
  - Changed from checking `hiringStatus` field
  - Now uses `calculate_drive_status()` for real-time status check
  - Prevents applications to Closed drives
  - Provides better error messages

### 🎨 Frontend Changes

#### 1. New Component: `DriveStatusBadge.jsx`
- Displays status with emoji and color coding
- **Props:**
  - `status`: "Open" | "Filling Fast" | "Closed"
  - `size`: "sm" | "md" | "lg"
- **Output:**
  - 🟢 Open (green)
  - 🟡 Filling Fast (yellow)
  - 🔴 Closed (red)

#### 2. New Component: `ProgressIndicator.jsx`
- Shows applications vs total openings
- **Props:**
  - `applications`: number
  - `total`: number
  - `showLabel`: boolean
  - `size`: "sm" | "md" | "lg"
- **Features:**
  - Animated progress bar
  - Percentage display
  - Warning message at 70%+ filled

#### 3. New Component: `DriveCard.jsx`
- Complete reusable card for displaying drives
- **Props:**
  - `drive`: drive object with status and progress
  - `isAdmin`: show admin controls
  - `onStatusChange`: callback for manual override
  - `onEdit`: edit drive callback
  - `onViewDetails`: view drive details callback
  - `showDeadline`: toggle deadline display
- **Features:**
  - Shows all drive information
  - Admin status override buttons
  - Progress indicator built-in
  - Responsive design
  - Action buttons (View/Edit)

### 📊 Data Structure Example

```json
{
  "id": "507f1f77bcf86cd799439011",
  "roleTitle": "Senior Developer",
  "jobDescription": "...",
  "totalOpenings": 5,
  "deadline": "2026-12-31",
  "status": "Filling Fast",
  "statusColor": "yellow",
  "progress": {
    "applications": 4,
    "total": 5,
    "percentage": 80
  },
  "createdAt": "2026-04-22T10:00:00Z"
}
```

### 🎯 Key Features

1. **Automatic Status Calculation**
   - Based on deadline and application percentage
   - No manual intervention needed
   - Real-time updates

2. **Manual Overrides**
   - Admins can force any status
   - Useful for special cases
   - Priority over automatic calculation

3. **Progress Tracking**
   - See how many applications vs positions
   - Percentage indicator
   - Warning when 70%+ filled

4. **Smart Filtering**
   - Users only see Open/Filling Fast drives
   - Closed drives hidden from applicants
   - Apply button disabled for closed drives

5. **Admin Controls**
   - Change status with buttons
   - See all company drives
   - Deadline management
   - Total openings tracking

6. **Color-Coded Status**
   - Green = Open (accepting)
   - Yellow = Filling Fast (limited spots)
   - Red = Closed (no more applications)

## API Changes

### Old Endpoints (Deprecated)
```
- hiringStatus field
- Simple Open/Closed status
```

### New Endpoints (Enhanced)
```
POST /api/drives
- New fields: totalOpenings, deadline
- Returns: status, statusColor, progress

GET /api/drives
- Returns: status, statusColor, progress
- Automatic filtering for users

PATCH /api/drives/:id
- New fields: totalOpenings, deadline, statusOverride
- Manual status override support
```

## Migration Notes

### For Existing Drives
- Old `hiringStatus` field is ignored
- Status calculated automatically based on:
  - Default to "Open" if no deadline
  - "Closed" if deadline passed
  - "Filling Fast" if 70%+ applications
- Can manually set with `statusOverride`

### For Applications
- Old validation checked `hiringStatus: "Open"`
- New validation checks calculated status
- Same result but more sophisticated logic

## Usage Examples

### Admin Creating a Drive
```bash
POST /api/drives
{
  "roleTitle": "Senior Developer",
  "jobDescription": "Build scalable systems...",
  "totalOpenings": 5,
  "deadline": "2026-12-31"
}

Response includes:
- status: "Open"
- progress: { applications: 0, total: 5, percentage: 0 }
```

### Getting All Drives (Admin)
```bash
GET /api/drives

Returns:
[{
  "id": "...",
  "roleTitle": "...",
  "status": "Filling Fast",
  "progress": { applications: 4, total: 5, percentage: 80 },
  ...
}]
```

### Manual Status Override
```bash
PATCH /api/drives/:id
{
  "statusOverride": "Closed"
}

→ Status immediately becomes "Closed"
```

### Remove Override
```bash
PATCH /api/drives/:id
{
  "statusOverride": null
}

→ Status reverts to automatic calculation
```

## Component Usage

### In Admin Dashboard
```jsx
<DriveCard
  drive={drive}
  isAdmin={true}
  onStatusChange={handleStatusUpdate}
  onEdit={handleEdit}
/>
```

### In User Dashboard
```jsx
<DriveCard
  drive={drive}
  isAdmin={false}
  onViewDetails={handleApply}
/>
```

### Individual Components
```jsx
<DriveStatusBadge status="Filling Fast" size="md" />
<ProgressIndicator applications={4} total={5} size="md" />
```

## Testing Scenarios

✅ Create drive with past deadline → Status = Closed
✅ Create drive, upload 70%+ applications → Status = Filling Fast
✅ Manually override status → Uses override
✅ Try apply to closed drive → Button disabled
✅ Remove override → Status recalculates
✅ Admin sees all drives
✅ User sees only Open/Filling Fast
✅ Progress bar shows correct percentage
✅ Status badge shows correct emoji and color

## Performance Impact

- ✅ Minimal: Status calculation is O(1) lookup + O(1) count
- ✅ No database indexes needed (uses existing fields)
- ✅ API response includes pre-calculated status
- ✅ No additional database queries

## Files Modified

### Backend
- ✅ `app/routes/recruitment_drives.py` (enhanced)
- ✅ `app/routes/resumes.py` (enhanced)
- ✅ `app/utils/status.py` (new)

### Frontend
- ✅ `src/components/DriveStatusBadge.jsx` (new)
- ✅ `src/components/ProgressIndicator.jsx` (new)
- ✅ `src/components/DriveCard.jsx` (new)

## Next Steps

1. ✅ Backend deployed and running
2. Update Admin Dashboard to use DriveCard component
3. Update User Company Drives page to use DriveCard component
4. Add status override functionality to Admin Drive settings
5. Test all status transitions and edge cases
6. Monitor application flow during testing
