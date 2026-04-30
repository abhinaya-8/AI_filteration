# Drive Status System - Quick API Reference

## Status Values
| Status | Color | Emoji | Meaning |
|--------|-------|-------|---------|
| Open | Green | 🟢 | Accepting applications |
| Filling Fast | Yellow | 🟡 | 70-99% filled |
| Closed | Red | 🔴 | No more applications |

---

## Endpoints

### 📝 Create Drive
```
POST /api/drives

Request Body:
{
  "roleTitle": "Senior Developer",          // Required
  "jobDescription": "Build systems...",     // Optional
  "totalOpenings": 5,                      // Optional (default: 0)
  "deadline": "2026-12-31",                // Optional (ISO format)
  "filteringCriteria": "5+ years exp"      // Optional
}

Response (201):
{
  "id": "507f1f77bcf86cd799439011",
  "roleTitle": "Senior Developer",
  "jobDescription": "Build systems...",
  "totalOpenings": 5,
  "deadline": "2026-12-31",
  "status": "Open",
  "statusColor": "green",
  "progress": {
    "applications": 0,
    "total": 5,
    "percentage": 0
  },
  "createdAt": "2026-04-22T10:00:00Z"
}
```

---

### 📋 List All Drives
```
GET /api/drives

Query Parameters (Optional):
- companyId=... (for users to see specific company drives)

Response (200):
[
  {
    "id": "507f...",
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
  },
  // ... more drives
]

Filtering Behavior:
- Admin: See all company drives
- User: See only Open/Filling Fast drives (Closed hidden)
```

---

### 🔍 Get Single Drive
```
GET /api/drives/:id

Response (200):
{
  "id": "507f1f77bcf86cd799439011",
  "roleTitle": "Senior Developer",
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

Access Rules:
- Admin: Can view any drive of their company
- User: Can view only Open/Filling Fast drives
```

---

### ✏️ Update Drive
```
PATCH /api/drives/:id

Request Body (All optional):
{
  "roleTitle": "Lead Developer",
  "jobDescription": "Updated description...",
  "totalOpenings": 8,
  "deadline": "2026-12-31",
  "statusOverride": "Closed"            // Key field!
}

Response (200):
{
  "id": "507f...",
  "roleTitle": "Lead Developer",
  "totalOpenings": 8,
  "deadline": "2026-12-31",
  "status": "Closed",
  "statusColor": "red",
  "progress": {
    "applications": 4,
    "total": 8,
    "percentage": 50
  }
}

Status Override:
- null/omitted: Auto-calculate status
- "Open": Force Open
- "Filling Fast": Force Filling Fast
- "Closed": Force Closed

Access:
- Admin only
- Must be their company's drive
```

---

## Status Calculation Logic

### Automatic (When statusOverride is null)
```
IF deadline < now
  → Status = "Closed"
ELSE IF applications >= (totalOpenings * 0.7)
  → Status = "Filling Fast"
ELSE
  → Status = "Open"
```

### Manual Override (When statusOverride is set)
```
Status = statusOverride
(Ignores deadline and application percentage)
```

---

## Common Scenarios

### Scenario 1: New Drive Posted
```bash
POST /api/drives
{
  "roleTitle": "Backend Engineer",
  "totalOpenings": 3,
  "deadline": "2026-12-31"
}

Result: status = "Open" (0 applications)
```

### Scenario 2: Getting Popular - 70% Filled
```bash
# After users apply...
GET /api/drives/507f...

Result: status = "Filling Fast" (2/3 applications)
       because 2/3 = 66.6%, wait for 3rd...
       
GET /api/drives/507f...

Result: status = "Filling Fast" (3/3 applications)
       because 3/3 = 100%, exceeds 70% threshold
```

### Scenario 3: Deadline Passed
```bash
# After deadline "2026-12-31" passes...
GET /api/drives/507f...

Result: status = "Closed" (automatic)
       regardless of application count
```

### Scenario 4: Admin Needs to Close Early
```bash
PATCH /api/drives/507f...
{
  "statusOverride": "Closed"
}

Result: status = "Closed" (forced)
       stays closed even if deadline is future
```

### Scenario 5: Reopen Drive
```bash
PATCH /api/drives/507f...
{
  "statusOverride": null
}

Result: status recalculates
       becomes "Open" if deadline not passed
       becomes "Closed" if deadline passed
```

---

## Frontend Integration

### Add to `src/services/api.js`
```javascript
// Create drive
export const createDrive = (data) => 
  api.post('/drives', data)

// List drives
export const listDrives = (companyId) => 
  api.get('/drives', { params: { companyId } })

// Get single drive
export const getDrive = (driveId) => 
  api.get(`/drives/${driveId}`)

// Update drive
export const updateDrive = (driveId, data) => 
  api.patch(`/drives/${driveId}`, data)

// Update status (shorthand)
export const updateDriveStatus = (driveId, newStatus) => 
  api.patch(`/drives/${driveId}`, { statusOverride: newStatus })
```

### Use in Components
```javascript
// Get all drives
const drives = await listDrives()

// Get admin's drives
const drivesForCompany = await listDrives(companyId)

// Update drive
await updateDrive(driveId, { 
  totalOpenings: 10,
  statusOverride: "Closed" 
})

// Quick status change
await updateDriveStatus(driveId, "Filling Fast")
```

---

## Status Badge Colors

In CSS/Tailwind:

| Status | Background | Text |
|--------|-----------|------|
| Open | `bg-green-100` | `text-green-800` |
| Filling Fast | `bg-yellow-100` | `text-yellow-800` |
| Closed | `bg-red-100` | `text-red-800` |

---

## Error Responses

### Drive Not Found
```json
{
  "error": "Drive not found"
}
// Status: 404
```

### Drive Closed for Applications
```json
{
  "error": "Drive is closed for applications"
}
// Status: 400 (when trying to apply)
```

### Invalid Status Override
```json
{
  "error": "Invalid status override value"
}
// Status: 400
```

### Unauthorized
```json
{
  "error": "Forbidden"
}
// Status: 403 (trying to access another admin's drive)
```

---

## Field Mappings

### Request Field → Database Field
```
roleTitle → roleTitle
jobDescription → jobDescription
totalOpenings → totalOpenings
deadline → deadline
filteringCriteria → filteringCriteria
statusOverride → statusOverride
```

### Calculated Fields (Not in Request)
```
status → calculated from deadline, totalOpenings, applications
statusColor → derived from status
progress → calculated from application count and totalOpenings
```

---

## Performance Notes

- Status calculation: O(1) + O(1) count → ~1ms
- No database indexes required
- Applications counted on-demand (can cache if needed)
- Suitable for 10K+ drives

---

## Example cURL Commands

### Create Drive
```bash
curl -X POST http://localhost:5000/api/drives \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleTitle": "Senior Developer",
    "totalOpenings": 5,
    "deadline": "2026-12-31"
  }'
```

### List Drives
```bash
curl http://localhost:5000/api/drives \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Status
```bash
curl -X PATCH http://localhost:5000/api/drives/507f... \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "statusOverride": "Closed"
  }'
```

---

## Testing Checklist

- [ ] Create drive → Returns status: "Open"
- [ ] Get drive → Shows correct status
- [ ] Update totalOpenings → Status recalculates
- [ ] Set deadline to past date → Status becomes "Closed"
- [ ] Upload 70%+ apps → Status becomes "Filling Fast"
- [ ] Override status → Uses override value
- [ ] Remove override → Reverts to auto calculation
- [ ] User views drives → Only sees Open/Filling Fast
- [ ] Try apply to closed → Gets error
- [ ] Progress bar calculates correctly
