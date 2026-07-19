# StadiumOS AI — Stitch Design Implementation Checklist

- [x] **Phase 1: Design System & Font Engine**
  - [x] Add Google Material Symbols Outlined font to `index.html`.
  - [x] Update `src/index.css` with Stitch colors (`#f7f9fb`, `#003fad`, `#1455d9`, `#4e5f7b`, `#005431`, `#C7A44A`), glassmorphic classes (`.glass-panel`, `.glass-panel-heavy`, `.fresnel-edge`, `.fresnel-glow`, `.ai-pulse`), and typography utility tokens.

- [x] **Phase 2: Database & Backend Expansion**
  - [x] Update `server/db.js` with expanded tables: `users`, `tickets`, `notifications`, `audit_logs`, `config`, `user_preferences`.
  - [x] Update `server/index.js` with API endpoints for notification feeds, marking read, QR validation, and password hash handling.

- [x] **Phase 3: Landing Page & 3D Intro**
  - [x] Update `src/components/3d/HeroCinematic.tsx` with exact Three.js football -> gold trophy splitting -> intelligence core reveal animation from `landing_page_intro/code.html`.
  - [x] Update `src/pages/LandingView.tsx` to match `landing_page_intro/code.html` layout, working CTAs, and interactive sections.

- [x] **Phase 4: Navigation Shell & Layout**
  - [x] Update `src/components/layout/Layout.tsx` with Stitch **SideNavBar** (with icons: `view_in_ar`, `settings_suggest`, `groups`, `local_shipping`, `verified`, `shield`, `bar_chart`) and **TopAppBar** with live Notification Center modal & user profile.

- [x] **Phase 5: Operations Command Center**
  - [x] Update `src/pages/OperationsView.tsx` to match `operations_command_center/code.html` (Live Telemetry, Gate Queue Analysis, Transport & Sustainability, AI Copilot, Active Incidents, and Twin-Controller circular dial).
  - [x] Update `src/components/3d/StadiumModel.tsx` & `StadiumScene.tsx` for light-theme spatial digital twin rendering.

- [x] **Phase 6: Fan Experience & Digital Ticket Wallet**
  - [x] Update `src/pages/FanView.tsx` to match `fan_experience_app/code.html` with quick actions, multi-lingual Gemini AI assistant, and crowd routing.
  - [x] Update `src/pages/FanTicketView.tsx` with Stitch ticket design, scannable QR token SVG, `SHOW QR`, `DOWNLOAD TICKET`, and gate navigation.

- [x] **Phase 7: Volunteer Ticket Scanner**
  - [x] Update `src/pages/ScannerView.tsx` to match `volunteer_scanner/code.html` with simulated camera scanner, manual code input, real backend SQLite validation, and APPROVED/REJECTED states.

- [x] **Phase 8: System Admin Console**
  - [x] Update `src/pages/AdminView.tsx` to match `admin_dashboard/code.html` with User/Ticket management, Stadium Config, and Audit log stream.

- [x] **Phase 9: Authentication & Role Protection**
  - [x] Update `src/pages/LoginView.tsx` with clean Stitch login UI (no visible admin links), hashing passwords, and directing based on user roles.

- [x] **Phase 10: Verification & Build Size**
  - [x] Run `npm run build` to verify clean TypeScript build and bundle size under 10MB.
