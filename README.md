# AlumSync

A mobile-first PWA for the Alumni Relations team at IIT Delhi. Replaces spreadsheets and WhatsApp threads with a single coordinated platform for ~80 team members across four verticals.

**Live:** https://alumsync-c9dc0.web.app

---

## Features

### Authentication
- Google OAuth sign-in (no passwords)
- One-time onboarding: name, phone, vertical, role, optional `.ics` schedule upload
- Self-service role editing from the profile page

### Home
- Monthly calendar with blue dots for event days and purple dots for the user's recurring class/busy schedule (parsed from their ICS file)
- Live activity feed (hours logged, badges awarded, events created)

### Directory
- Full team roster with search, vertical filter, and role filter
- Shows role label (Team Leader / Coordinator / Representative) per member

### Events
- Create and manage events (Team Leader & Coordinator)
- Per-event sub-sections:
  - **Tasks** — create, assign, and check off tasks
  - **Chat** — real-time team chat with in-app toast notifications for new messages
  - **Docs** — shared document links
  - **Meetings** — scheduled meeting entries
  - **Expenses** — submit reimbursement requests with mandatory receipt upload (image or PDF); Team Leader approves/rejects

### Log Hours & Recognition
- Team Leader and Coordinators log hours and award Appreciate/Slap badges for team members
- Atomic update via Firestore `runTransaction` — hours and badge counts never get out of sync
- Live leaderboard sorted by hours or appreciations

### Profile
- Upload avatar and banner photo
- View personal hours, appreciate, and slap counts
- Finance summary: pending vs. reimbursed amounts
- Team Leader sees all pending reimbursement requests with UPI details and receipt viewer; can settle or reject
- Delete account (permanently removes Firestore doc and Firebase Auth record, with automatic re-authentication if session is stale)

### PWA
- Installable to home screen on Android and iOS
- Offline support via Firestore persistent local cache
- No pinch-to-zoom; iPhone home indicator safe area handled

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Auth | Firebase Authentication (Google OAuth) |
| Database | Cloud Firestore (real-time `onSnapshot`) |
| Storage | Firebase Storage (avatars, banners, receipts) |
| Hosting | Firebase Hosting |
| PWA | vite-plugin-pwa + Workbox |
| ICS Parsing | ical.js (browser-side) |

All backend logic runs client-side (Firestore transactions, batch writes). No Cloud Functions — runs entirely on the Firebase Spark free tier.

---

## Project Structure

```
src/
  lib/
    firebase.js       # Firebase app, Firestore, Auth, Storage, Google provider
    context.jsx       # AppContextProvider — auth state machine, global listeners
  pages/
    LoginPage.jsx     # Google sign-in screen
    OnboardingPage.jsx# First-time profile setup + ICS upload
  components/
    ProfileTab.jsx    # Profile, finances, expense management
  App.jsx             # All tabs: Home, Directory, Events, Leaderboard
  main.jsx            # React entry point
firestore.rules       # Role-based Firestore security rules
storage.rules         # Firebase Storage security rules
firestore.indexes.json# Composite indexes
```

---

## Roles & Permissions

| Action | Representative | Coordinator | Team Leader |
|---|---|---|---|
| View directory, events, leaderboard | Yes | Yes | Yes |
| Create events | No | Yes | Yes |
| Log hours / award badges for others | No | Yes (Reps only) | Yes (anyone) |
| Approve/reject expenses | No | No | Yes |
| Delete events | No | No | Yes |

---

## Getting Started

### Prerequisites
- Node.js v18+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project with Authentication, Firestore, Storage, and Hosting enabled

### Setup

1. Clone and install:
   ```bash
   git clone https://github.com/mysticAC24/AR_APP.git
   cd AR_APP
   npm install
   ```

2. Copy the env template and fill in your Firebase config:
   ```bash
   cp .env.example .env.local
   ```

   Required variables:
   ```
   VITE_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN
   VITE_FIREBASE_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID
   VITE_FIREBASE_APP_ID
   ```

3. Link to your Firebase project:
   ```bash
   firebase use --add
   ```

4. Deploy Firestore rules, indexes, and storage rules:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```

5. Run locally:
   ```bash
   npm run dev
   ```

### Deploy

```bash
npm run build
firebase deploy --only hosting
```

---

## License

Proprietary and confidential. Built for the Alumni Relations team, IIT Delhi.
