# AlumSync (AR_APP)

AlumSync is a full-stack, mobile-first web application designed for managing a university Alumni Relations student team. It provides a centralized platform for team directory, event calendar, contribution tracking, and role-based access control.

## ✨ Features

- **Authentication & Role-Based Access:** Secure login with distinct roles for Team Leaders, Coordinators, and Representatives.
- **Home Dashboard:** Personalized dashboard featuring an event calendar and quick actions.
- **People Directory:** A comprehensive directory of team members and their availability.
- **Events Management:** Create, manage, and track upcoming alumni relations events.
- **Contribution Tracking & Gamification:** A system to track contributions, award badges, and foster engagement among team members.

## 🛠️ Tech Stack

- **Frontend:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (with PostCSS & Autoprefixer)
- **Icons:** Lucide React
- **Backend/Database:** Firebase (Firestore & Authentication)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Firebase Project setup

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/mysticAC24/AR_APP.git
   cd AR_APP
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file in the root directory.
   - You can copy the structure from `.env.example`:
     ```bash
     cp .env.example .env
     ```
   - Fill in your Firebase configuration variables in the `.env` file.

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

### Build for Production

To create a production-ready build, run:
```bash
npm run build
```
You can then preview the build using:
```bash
npm run preview
```

## 📜 License

This project is proprietary and confidential.
