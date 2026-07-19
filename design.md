# StadiumOS AI — System Design & Architecture Document

## 1. Product Vision & Concept
**Name:** STADIUMOS AI  
**Tagline:** "Every Fan. Every Movement. Every Moment. Intelligently Connected."  
**Purpose:** A Generative AI-powered Stadium Operations and Fan Experience platform designed for the scale and complexity of the FIFA World Cup 2026. The platform serves as an intelligence layer connecting fans, venue staff, volunteers, and tournament organizers.

---

## 2. System Architecture

StadiumOS AI is designed with a modern, decoupled architecture focusing on high performance, low latency, and a strict <10MB total repository size constraint.

### Frontend Architecture
- **Framework:** React 19 + TypeScript + Vite
- **Routing:** React Router v7 (`react-router-dom`) with role-protected boundaries.
- **Styling:** Tailwind CSS v4 + pure CSS utilities for glassmorphism.
- **3D Engine:** Three.js wrapped in React Three Fiber (`@react-three/fiber`, `@react-three/drei`).
- **State Management:** React hooks + LocalStorage (for session persistence).
- **Animations:** Framer Motion for spatial micro-animations and page transitions.

### Backend Architecture (Local Prototype)
- **Runtime:** Node.js + Express
- **Database:** SQLite (`sqlite3`)
- **Integration:** The backend runs concurrently with the Vite dev server, exposed via a proxy configuration (`/api/*` routes).

### AI Integration
- **Engine:** Google Gemini API (`@google/generative-ai`).
- **Implementation:** Custom wrapper (`src/services/ai.ts`) handling multi-lingual translation, structured function calling, and role-specific prompting.

---

## 3. Visual Design System

The design philosophy mirrors premium products created by Apple, Stripe, and modern spatial interfaces (e.g., Apple Vision Pro). It explicitly avoids generic "SaaS Dashboard" aesthetics.

### Color Palette
- **Deep Stadium Navy** (`#0a192f`): Base application surface.
- **Midnight Blue** (`#020c1b`): Deep background and core structural elements.
- **Premium Gold** (`#d4af37`): Primary accent, used for CTAs, premium highlights, and the 3D cinematic trophy.
- **Electric Blue** (`#00f0ff`): AI indicators, active states, and procedural 3D geometry glow.
- **Emerald Green** (`#00e676`): Positive status indicators (e.g., normal crowd density).

### Typography
- **Primary Text:** `Inter` (Sans-serif) for high legibility in data-dense interfaces.
- **Headings & Display:** `Outfit` (Sans-serif) for a modern, architectural, and premium aesthetic.

### UI Motifs
- **Glassmorphism (`.glass-panel`):** Heavy use of translucent backgrounds (`bg-[#0a192f]/60`), background blurs (`backdrop-blur-md`), and subtle borders to create depth and spatial hierarchy.
- **Glow Effects:** CSS-based hover states (`box-shadow`) to give interactivity a tactile, premium feel without heavy DOM manipulation.

---

## 4. Role-Based Access Control (RBAC)

The application provides unique interfaces based on the authenticated user's role:

1. **System Admin (`/admin`)**
   - **Focus:** System integrity and global configuration.
   - **Features:** Live security audit logs (pulled from SQLite), global stadium state overrides, and AI safety constraint adjustments.

2. **Operations Command (`/operations`)**
   - **Focus:** Real-time crowd management and incident response.
   - **Features:** Live 3D Digital Twin, Gate Queue Analysis, Transport/Sustainability Intelligence, and a Gemini AI Copilot providing active recommendations (e.g., gate redirection).

3. **Volunteer / Ground Staff (`/scanner`)**
   - **Focus:** Fast, localized fan assistance.
   - **Features:** QR code scanning interface that validates tickets against the SQL database in real-time.

4. **Fan Experience (`/fan`, `/ticket`)**
   - **Focus:** Navigation and accessibility.
   - **Features:** Digital Ticket Wallet with dynamic QR code generation (`qrcode.react`), Multi-lingual AI Assistant for wayfinding, food, and medical assistance.

---

## 5. 3D Digital Twin Architecture

To adhere to strict bundle size limits, **zero external 3D assets (.gltf, .obj) are used.** The entire stadium is procedurally generated at runtime.

- **`StadiumScene.tsx`:** The root canvas. Manages lighting, shadows, and the camera controller.
- **`StadiumModel.tsx`:** Procedural mesh generation using Three.js primitives (`ExtrudeGeometry`, `RingGeometry`, `PlaneGeometry`). Styled with deep navy surfaces, gold architectural accents, and glowing cyan pitch lines.
- **`HeroCinematic.tsx`:** A mathematically animated intro sequence using `MeshDistortMaterial` and rotating rings to create a high-end "GenAI" feel without video files.

---

## 6. Data & Database Schema

The SQLite database (`stadiumos.db`) utilizes the following relational schema:

- **Users:** `id`, `username`, `password`, `role`, `name`
- **Tickets:** `id`, `user_id` (FK), `match_id`, `seat`, `gate`, `status`
- **AuditLogs:** `id`, `user_id` (FK), `action`, `timestamp`, `details`
- **Config:** `key`, `value` (Key-value store for global settings)

---

## 7. Performance & Optimization

1. **Bundle Size:** By relying on procedural generation, SVG icons (`lucide-react`), and avoiding heavy component libraries (using raw Tailwind), the final compiled JS size remains ~1.4MB.
2. **Animation Efficiency:** `useFrame` is utilized in React Three Fiber to animate thousands of crowd particles and geometries directly on the GPU without triggering React re-renders.
3. **Graceful Fallbacks:** The 3D Digital Twin includes a built-in 2D SVG toggle (`Eye` vs `Box` icon) for low-end devices or users requiring higher accessibility/contrast.
