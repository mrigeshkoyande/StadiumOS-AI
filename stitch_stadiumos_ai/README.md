# STADIUMOS AI

> **"Every Fan. Every Movement. Every Moment. Intelligently Connected."**

A production-quality **Generative AI–powered Stadium Operations and Fan Experience platform** built for the FIFA World Cup 2026. StadiumOS AI acts as an intelligence layer that connects fans, venue staff, volunteers, organizers, security teams, and transportation systems through a single AI-powered operating system.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [AI Architecture](#ai-architecture)
- [Demo Scenario](#demo-scenario)
- [Security](#security)
- [Accessibility](#accessibility)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [License](#license)

---

## Overview

FIFA World Cup 2026 stadiums will have massive crowds, multilingual visitors, complex transportation networks, and rapidly changing real-time conditions. **StadiumOS AI** transforms fragmented stadium data into real-time, human-understandable intelligence for every person inside the tournament ecosystem.

The platform delivers two connected experiences powered by one shared AI intelligence layer:

| Experience | Audience | Purpose |
|---|---|---|
| **Operations Command Center** | Stadium managers, operations teams, volunteers | Real-time crowd analytics, AI predictions, incident management |
| **Fan Intelligence Assistant** | Fans, tourists, international visitors | Natural language navigation, accessibility routes, multilingual support |

---

## Key Features

### Operations Command Center
- **Live Operational Metrics** — Attendance, occupancy, entry times, active incidents
- **Interactive Stadium Map** — SVG-based visualization with real-time gate density indicators (color-coded and labeled for accessibility)
- **AI Operations Copilot** — Gemini-powered analysis that predicts congestion, recommends staff redeployment, and summarizes incidents
- **Gate Queue Analysis** — Tabular breakdown of queue lengths, wait times, and density trends
- **Incident Timeline** — Chronological feed of active incidents with severity, assigned teams, and AI-generated summaries

### Fan Intelligence Assistant
- **Natural Language Chat** — Fans ask questions in plain language and receive structured, contextual responses
- **Quick Action Buttons** — One-tap access to common needs: find seat, shortest queue, food, medical help
- **Actionable AI Responses** — Every response includes a direct answer, recommended actions, and confidence score
- **Input Validation** — 500-character limit, trimming, and sanitization before any AI call

### Shared AI Layer
- **Gemini API with Function Calling** — The AI calls structured tool functions (`getCrowdDensity`, `getGateQueueStatus`, etc.) to ground responses in real stadium data
- **Structured JSON Responses** — Every AI response conforms to a typed schema with `type`, `summary`, `recommendation`, `confidence`, `priority`, `actions`, and `timestamp`
- **Graceful Offline Fallback** — If no API key is configured, a deterministic simulator provides realistic demo responses
- **Safety Guardrails** — The AI never fabricates crowd counts, transport times, emergency information, or medical advice

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | React 19 + TypeScript | Component-driven UI with strict type safety |
| **Build Tool** | Vite 8 | Fast HMR, optimized production builds |
| **Styling** | Tailwind CSS 3 | Utility-first CSS with custom design tokens |
| **Routing** | React Router DOM 7 | Client-side navigation between Operations and Fan views |
| **AI** | Google Generative AI (Gemini 1.5 Flash) | Function calling, structured responses, system instructions |
| **Charts** | Recharts 3 | Data visualization (crowd analytics) |
| **Icons** | Lucide React | Consistent, accessible icon set |
| **Testing** | Vitest + Testing Library | Unit and component tests with jsdom |
| **Linting** | OxLint | Fast, zero-config linting |

---

## Project Structure

```
stitch_stadiumos_ai/
├── index.html                    # Entry HTML with meta tags
├── package.json                  # Dependencies and scripts
├── tailwind.config.js            # Custom design tokens (colors, fonts)
├── postcss.config.js             # PostCSS pipeline
├── vite.config.ts                # Vite + Vitest configuration
├── tsconfig.json                 # TypeScript project references
├── tsconfig.app.json             # App-level TS config (strict mode)
├── tsconfig.node.json            # Node-level TS config
│
└── src/
    ├── main.tsx                  # React entry point
    ├── App.tsx                   # Root component with routing
    ├── index.css                 # Tailwind directives + base styles
    │
    ├── types/
    │   └── index.ts              # Shared TypeScript interfaces
    │                               (AIResponse, GateStatus, Incident, TransportStatus)
    │
    ├── services/
    │   ├── ai.ts                 # Gemini API integration + function calling + fallback
    │   └── mockData.ts           # Typed mock data + tool function implementations
    │
    ├── components/
    │   ├── layout/
    │   │   └── Layout.tsx        # App shell (header, nav, outlet)
    │   └── ui/
    │       ├── Button.tsx        # Reusable button with variants, sizes, loading state
    │       ├── Card.tsx          # Card, CardHeader, CardTitle, CardContent
    │       └── Badge.tsx         # Status badge with semantic color variants
    │
    ├── pages/
    │   ├── OperationsView.tsx    # Command center dashboard
    │   └── FanView.tsx           # Fan chat interface + quick actions
    │
    ├── utils/
    │   └── cn.ts                 # Tailwind class merge utility (clsx + twMerge)
    │
    └── tests/
        ├── setup.ts              # Vitest setup (jest-dom matchers)
        ├── Button.test.tsx       # UI component tests
        └── ai.test.ts            # AI service + mock data tests
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# Navigate to the project directory
cd stitch_stadiumos_ai

# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## AI Architecture

### How It Works

```
User Query → askAI() → Gemini API → Function Calling → Stadium Tools → Structured JSON Response → UI
```

1. **User submits a query** (natural language, e.g., "Why is Gate B congested?")
2. **`askAI()`** sends the query to Gemini with a system instruction and tool declarations
3. **Gemini decides** whether to call tool functions (e.g., `getCrowdDensity()`)
4. **Tool responses** are sent back to Gemini for final analysis
5. **Gemini returns structured JSON** conforming to the `AIResponse` interface
6. **The UI renders** the response with summary, recommendation, actions, and confidence

### Tool Functions

| Function | Description |
|---|---|
| `getCrowdDensity()` | Returns crowd density and wait times for all gates |
| `getGateQueueStatus(gateId)` | Returns queue status for a specific gate |
| `getUserLocation()` | Returns the user's simulated current location |
| `getTransportStatus()` | Returns public transport options and delays |
| `getActiveIncidents()` | Returns all active stadium incidents |
| `getAccessibilityRoutes()` | Returns accessible routing recommendations |

### Structured AI Response Schema

```typescript
interface AIResponse {
  type: 'route_recommendation' | 'crowd_analysis' | 'incident_analysis' |
        'transport_recommendation' | 'accessibility_guidance' |
        'multilingual_translation' | 'sustainability_insight' |
        'operational_recommendation';
  summary: string;
  recommendation: string;
  confidence: number;       // 0.0 – 1.0
  priority: 'low' | 'medium' | 'high' | 'critical';
  actions: string[];
  supportingData: any[];
  timestamp: string;        // ISO 8601
}
```

### Offline Fallback

When `VITE_GEMINI_API_KEY` is not set, the system automatically uses a deterministic simulator that returns realistic responses for the demo scenario (Gate B congestion detection and route redirection).

---

## Demo Scenario

The application ships with a built-in demo flow:

| Step | What Happens |
|---|---|
| 1 | Stadium is operating normally |
| 2 | Gate B crowd density begins increasing (450 persons, 18 min wait) |
| 3 | AI detects the trend and analyzes crowd data |
| 4 | AI predicts congestion within 12 minutes |
| 5 | AI recommends: "Redirect fans to Gate C, deploy 3 volunteers" |
| 6 | Operations manager sees actionable buttons to accept |
| 7 | Fan asks: "How do I get to Section 214?" |
| 8 | AI provides a route avoiding Gate B via the east concourse (8 min walk) |

---

## Security

- **API keys** are loaded exclusively via environment variables (`VITE_GEMINI_API_KEY`) and never committed to source
- **User input** is trimmed, length-capped (500 chars), and validated before any AI call
- **AI responses** are parsed through `JSON.parse()` with error handling — never executed as code
- **Error messages** shown to users are human-readable and never expose stack traces or internal state
- **Role separation** is architecturally enforced: fan queries use `role: 'fan'`, operations queries use `role: 'ops'`

---

## Accessibility

- **Semantic HTML** — `<header>`, `<main>`, `<nav>`, `<table>`, `<button>` used correctly throughout
- **ARIA attributes** — `aria-label` on all icon-only buttons, `aria-live="polite"` on dynamic content regions, `role="img"` on SVG map
- **Keyboard navigation** — All interactive elements are focusable and operable via keyboard
- **Color is never the only indicator** — Gate status uses text labels (`LOW`, `MEDIUM`, `HIGH`) alongside color
- **Focus states** — Visible `focus:ring` styles on all interactive elements
- **Input accessibility** — Chat input has explicit `aria-label="Ask the AI assistant"`

---

## Testing

### Run Tests

```bash
npx vitest run
```

### Test Coverage

| Test File | What It Tests |
|---|---|
| `Button.test.tsx` | Rendering, CSS class application, loading/disabled states |
| `ai.test.ts` | Offline fallback responses, structured response schema, mock data tool outputs |

### Test Architecture Decisions

- Tests use **jsdom** for DOM simulation
- AI tests verify **structured response validity** (not exact text matching)
- Mock data tools are tested for **deterministic JSON output**
- All tests run without network access or API keys

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note:** The application works fully without an API key using the built-in offline simulator. The API key is only required for live Gemini integration.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run OxLint for code quality checks |
| `npx vitest run` | Run all unit and component tests |

---

## License

This project was built for the FIFA World Cup 2026 GenAI Hackathon. All rights reserved.
