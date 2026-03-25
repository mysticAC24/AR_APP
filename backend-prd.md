# 📋 MASTER BACKEND SPECIFICATION & PRD: AlumSync

## 1. Executive Summary & Vision
AlumSync is a mobile-first internal management tool for a university Alumni Relations team (~100 Active Users / 80-person student team). It resolves communication silos by centralizing event visibility, syncing class schedules to find "Free Now" members, and gamifying volunteer tracking.

**Target Scale**: ~100 Active Users  
**Budget Constraint**: $0/month (Must strictly utilize Firebase Free Tier)  

The backend must be completely serverless, utilizing Firebase Auth, Firestore, Cloud Storage, and Cloud Functions to achieve real-time sync without recurring server costs.

---

## 2. Role-Based Access Control (RBAC) & UI Outlooks
The system operates on a strict hierarchy. 
**Crucial Architecture Note:** The frontend currently utilizes a `simulatedRole` React Context for testing UI outlooks. The UI must render based on this simulation, but the **Firestore Backend Rules MUST validate against the actual authenticated user's token** (`request.auth`). If a simulated action fails actual backend validation, the UI must catch the error gracefully.

### 2.1 Representatives (Base Level)
* **Backend Permissions:** Can read global events and the team directory. Expected to log their own hours and upload their `.ics` schedule. CANNOT read financial data, approve hours, or edit events.
* **UI Outlook Enforcement:**
    * **Directory Tab:** Read-only access to member profiles.
    * **Events Tab:** The "Expenses" button in Planning Tools MUST NOT render.
    * **Hours/Feedback Section:** The inputs (+/- hours, Appreciate 🎉, Slap ✋) MUST NOT render next to team members. Render text: *"View Only"*.

### 2.2 Coordinators (Mid Level)
* **Backend Permissions:** Can manage their specific vertical/team. Can create events, tasks, and chats. Can approve hours and award badges **ONLY** for Representatives assigned to their events. Can submit expenses. CANNOT approve expenses.
* **UI Outlook Enforcement:**
    * **Events Tab:** The "Expenses" button renders. They can submit new expenses via the form but "Approve/Reject" buttons for pending expenses MUST NOT render. Can manage "Representatives" roster for events.
    * **Hours/Feedback Section:** Render the input controls (+/- hours, badges) ONLY for members whose level is "Representative". For other Coordinators or Leaders, render text: *"Requires Team Leader Access"*.

### 2.3 Team Leaders (Admin Level)
* **Backend Permissions:** Full administrative rights. Can approve any hours, award badges to anyone, and has exclusive rights to `UPDATE` expense statuses to 'reimbursed'. Can read sensitive `upiId` fields for all users to settle reimbursements.
* **UI Outlook Enforcement:**
    * **Events Tab:** The "Expenses" button renders. The "Approve/Reject" buttons MUST render for all pending expenses. Can manage "Coordinators" roster for events.
    * **Hours/Feedback Section:** Input controls MUST render for EVERY member listed in the event.

---

## 3. Firestore Database Schema
*Note: Ensure all timestamps use Firebase `Timestamp` objects. The schema below reconciles the master specification with existing mock data structures in `App.jsx`.*

### 3.1 Collection: `users`
* `uid` (String, PK - matches Auth ID)
* `fullName` (String) *(Mapped from `name` in `App.jsx`)*
* `email` (String)
* `phoneNumber` (String) - *For UI direct-call/WhatsApp integration*
* `avatarUrl` (String) *(Mapped from `image` in `App.jsx`)*
* `role` (Enum: `Team Leader`, `Coordinator`, `Representative`) *(Referred to as `level` in `App.jsx`)*
* `vertical` (Enum: `Networking`, `Design`, `Operations`, `Media`) *(Referred to as `role` in `App.jsx`)*
* `upiId` (String) - *Highly sensitive, requires strict security rules*
* `totalHours` (Number, Default: 0)
* `badgesAppreciate` (Number, Default: 0)
* `badgesSlap` (Number, Default: 0)
* `isFreeNow` (Boolean) - *Calculated real-time status in UI/Edge func*
* `schedule` (Array of Objects) - *Parsed `.ics` blocks: `[{ day: 1, startTime: "09:00", endTime: "10:30" }]`*

### 3.2 Collection: `events`
* `eventId` (String, PK)
* `title` (String)
* `type` (String) - *e.g., Flagship, Seminar, Reunion, Workshop*
* `date` (Timestamp / String for UI formatting)
* `time` (String)
* `location` (String)
* `status` (Enum: `upcoming`, `ongoing`, `past`)
* `coordinatorIds` (Array of Strings) - *Roster of Event Managers*
* `representativeIds` (Array of Strings) - *Roster of student reps. Combined with coordinators as `team` in UI.*
* `createdBy` (String/UID)

#### Subcollections under `events/{eventId}`:
* **`tasks`**: `taskId`, `title`, `isCompleted` (Boolean)
* **`messages`**: `messageId`, `senderId`, `text`, `createdAt` (Timestamp)
* **`docs`**: `docId`, `title`, `type` (`PDF`|`Sheet`|`Link`), `url`
* **`meetings`**: `meetId`, `title`, `scheduledTime` (Timestamp), `meetingUrl`

### 3.3 Collection: `expenses`
* `expenseId` (String, PK)
* `eventId` (String, FK)
* `submittedBy` (String/UID)
* `itemDescription` (String)
* `amount` (Number)
* `receiptUrl` (String, Nullable, Pointer to Cloud Storage)
* `status` (Enum: `pending`, `reimbursed`, `rejected`)
* `reviewedBy` (String/UID, Nullable)
* `createdAt` (Timestamp)

### 3.4 Collection: `hours_log`
* `logId` (String, PK)
* `eventId` (String, FK)
* `userId` (String/UID - *The person who did the work*)
* `hours` (Number)
* `badgeAwarded` (Enum: `appreciate`, `slap`, `none`)
* `status` (Enum: `pending`, `approved`)
* `approvedBy` (String/UID - *The person who approved it*)
* `createdAt` (Timestamp)

---

## 4. Security Rules (`firestore.rules`)
A zero-trust model must be implemented via Firestore native security rules. Do not rely entirely on the React Context simulation.

**Required Contextual Helpers in Rules:**
* `isTeamLeader()`: `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Team Leader'`
* `isCoordinator()`: `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Coordinator'`

**Rule Mandates:**
1. **Users:** The `upiId` and `schedule` fields can ONLY be read if `request.auth.uid == resource.id` OR `isTeamLeader()`.
2. **Expenses:** 
    * `create`: Requires `isTeamLeader()` OR `isCoordinator()`.
    * `update` (settling the expense): ONLY `isTeamLeader()` can update `status` to `reimbursed`.
3. **Hours Log:**
    * `create`: Anyone can log their *own* hours.
    * `update` (approving): `isTeamLeader()` can approve any log. `isCoordinator()` can ONLY approve if the target log's `userId` belongs to a `Representative`.

---

## 5. Cloud Functions (Node.js)
Backend workers must handle complex logic securely and asynchronously without draining free-tier limits.

### 5.1 Gamification & Hours Aggregator (Firestore Trigger)
* **Trigger:** `onDocumentUpdated('hours_log/{logId}')`
* **Logic:** When a log's `status` changes from `pending` to `approved`:
    1. Extract `hours` and `badgeAwarded`.
    2. Use `admin.firestore().collection('users').doc(userId).update()` containing `FieldValue.increment()` to safely update `totalHours`, `badgesAppreciate`, and `badgesSlap` on the user's master record.
* **Constraint:** MUST be idempotent. Check if the previous state was already 'approved' to avoid double-counting.

### 5.2 Automated Event Status Transitions (Cron Job)
* **Trigger:** `pubsub.schedule('every 1 hours')`
* **Logic:** 
    1. Query `events` where `status == 'upcoming'` and timestamp indicates the event has begun.
    2. Query `events` where `status == 'ongoing'` and date is older than 24 hours to mark as `past`.
* **Constraint:** MUST utilize Firebase `WriteBatch` to perform these updates locally and commit in bulk to minimize database write operations.

### 5.3 Link Preview Generator (Callable Function)
* **Endpoint:** `generateLinkPreview(data, context)`
* **Logic:** Accepts a raw URL. Scrapes `<title>` and `<meta property="og:image">` (using `cheerio` or similar). Returns structured JSON for the frontend UI. Prevents client-side CORS issues.

### 5.4 `.ics` File Parser (Storage Trigger)
* **Trigger:** `onObjectFinalized` (Cloud Storage upload to `/schedules/{uid}.ics`).
* **Logic:** Read the file using `ical.js`. Extract recurring weekly blocks relative to class timings, format into a JSON array, and push an update to the `schedule` field on the corresponding user's document.

---

## 6. Execution Plan & Next Steps
1. **Setup:** Initialize the Firebase Functions environment and strictly enforce the `firestore.rules`.
2. **Data Structure Reconciliation:** Update the `App.jsx` React models to map `level` to `role` and `role` to `vertical` to match this PRD's schema notation perfectly.
3. **Cloud Functions:** Draft the four required backend jobs securely.
4. **Integration:** Replace the `seedDatabase()` mock functionality in `App.jsx` with true authenticated `uid` mappings, ensuring failed updates (due to simulatedRole vs actual token mismatch) trigger appropriate UI toast errors.
