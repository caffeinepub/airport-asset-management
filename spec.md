# Airport Asset Management

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full asset management system for airport-procured goods (printers, office equipment, etc.)
- Asset records with: name, category, serial number, purchase date, cost, supplier, current status, assigned location/department
- Asset assignment workflow: assign asset to a department or individual, track assignment history
- Asset maintenance workflow: log maintenance events, schedule next maintenance, track maintenance history
- Inspection logs: record inspections with date, inspector, notes, and pass/fail outcome
- Asset status tracking: Active, Under Maintenance, Retired, In Storage
- Role-based access control with four roles:
  - System Admin: full CRUD access + manage users and roles
  - Finance Manager: full CRUD access on assets (add, edit, retire, delete)
  - Airport Manager: read-only view of all data
  - Procurement Officer: read-only view of all data
- Dashboard with summary stats (total assets, assets under maintenance, assets assigned, recently added)
- Assets list view with search and filter by category and status
- Asset detail page showing full history (assignments, maintenance, inspections)

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

**Backend (Motoko):**
1. Asset data model: id, name, category, serialNumber, purchaseDate, cost, supplier, status, location, assignedTo, notes
2. Assignment model: id, assetId, assignedTo (name/department), assignedBy, assignedAt, returnedAt (optional)
3. Maintenance model: id, assetId, type, description, performedBy, performedAt, nextDueAt, cost
4. Inspection model: id, assetId, inspectorName, inspectedAt, outcome (Pass/Fail), notes
5. CRUD APIs for assets (create, read, update, delete, list)
6. APIs for assignment: assign, return, history by asset
7. APIs for maintenance: add log, list by asset
8. APIs for inspection: add log, list by asset
9. Authorization: integrate role-based access; roles map to System Admin, Finance Manager, Airport Manager, Procurement Officer

**Frontend:**
1. Login / auth screen
2. Dashboard: summary cards (total assets, under maintenance, assigned, recently added), recent activity feed
3. Assets list page: table with search, filter by category/status, add asset button (admin/finance only)
4. Asset detail page: info panel + tabbed sections for Assignment History, Maintenance Log, Inspection Log; action buttons for Assign, Log Maintenance, Log Inspection (admin/finance only)
5. Add/Edit Asset modal form (admin/finance only)
6. Assign Asset modal (admin/finance only)
7. Log Maintenance modal (admin/finance only)
8. Log Inspection modal (admin/finance only)
9. User/Role management page (system admin only)
10. Responsive sidebar navigation: Dashboard, Assets, Reports (future), Settings (admin only)
