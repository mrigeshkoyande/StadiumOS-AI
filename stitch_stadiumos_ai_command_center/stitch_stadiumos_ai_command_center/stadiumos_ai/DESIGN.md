---
name: StadiumOS AI
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434654'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#1053d7'
  primary: '#003fad'
  on-primary: '#ffffff'
  primary-container: '#1455d9'
  on-primary-container: '#d1daff'
  inverse-primary: '#b4c5ff'
  secondary: '#4e5f7b'
  on-secondary: '#ffffff'
  secondary-container: '#ccddff'
  on-secondary-container: '#51617e'
  tertiary: '#005431'
  on-tertiary: '#ffffff'
  tertiary-container: '#006f42'
  on-tertiary-container: '#8cf0b3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174c'
  on-primary-fixed-variant: '#003da9'
  secondary-fixed: '#d5e3ff'
  secondary-fixed-dim: '#b6c7e8'
  on-secondary-fixed: '#091c35'
  on-secondary-fixed-variant: '#374762'
  tertiary-fixed: '#93f7ba'
  tertiary-fixed-dim: '#77da9f'
  on-tertiary-fixed: '#002110'
  on-tertiary-fixed-variant: '#00522f'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-hero:
    fontFamily: Outfit
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  panel-gap: 12px
---

## Brand & Style

The design system is engineered for high-stakes, large-scale stadium operations. The brand personality is **authoritative yet ethereal**, combining the precision of an aerospace cockpit with the elegance of a luxury hospitality suite. It targets elite stadium operators and tournament directors who require split-second decision-making capabilities within a serene, low-cognitive-load environment.

The visual style is **Spatial Minimalism**. Inspired by next-generation operating systems, it utilizes glassmorphism and depth-based layering to organize complex "Digital Twin" data. The interface feels light, airy, and grounded in physical space, evoking a sense of calm control over massive crowds and infrastructure. 

Key design principles:
- **Spatial Hierarchy:** Use Z-axis depth to separate ambient monitoring from active intervention.
- **Architectural Precision:** Align elements to a rigid, clean grid inspired by stadium structural engineering.
- **Luminous Interaction:** Use soft glows and refractive glass edges to indicate AI-driven insights and focus states.

## Colors

The palette is anchored in **Stadium White** (#F8FAFC) to maintain a high-daylight, clean aesthetic that minimizes visual fatigue. 

- **Primary (Tournament Blue):** Used for AI prompts, active data streams, and high-priority tactical actions.
- **Secondary (Deep Stadium Navy):** Reserved for core navigation, high-contrast typography, and grounding structural elements.
- **Tertiary (Pitch Green):** Specifically mapped to safety metrics, crowd flow success, and environmental sustainability KPIs.
- **Premium Gold:** An orbital color used strictly for "Final" match states, trophy-related data, and VIP hospitality alerts.

**Surface Strategy:**
Surfaces are never pure white; they utilize a sophisticated stack of semi-transparent layers and background blurs to maintain the "Glassmorphism" effect over the 3D stadium twin.

## Typography

This design system uses a dual-font strategy to balance character with utility. 

**Outfit** is the display face, providing a geometric, futuristic feel for large metrics, section headings, and stadium zone identifiers. Its circular apertures feel modern and premium.

**Inter** handles all functional data, body text, and UI labels. It is chosen for its exceptional legibility at small sizes, particularly when overlaid on glass textures or dynamic 3D maps.

**Implementation Rules:**
- Use `label-sm` for all technical metadata and sensor readings.
- High-priority AI insights should utilize `body-lg` with a medium weight to stand out from standard telemetry.
- Tighten letter-spacing on `display-hero` to maintain a compact, "designed" editorial look.

## Layout & Spacing

The layout philosophy is a **Spatial Fixed Grid**. Central to the OS is a "viewport" (the Stadium Digital Twin) with floating modular panels docked to the edges or floating in a dedicated HUD layer.

- **Desktop (1440px+):** A 12-column grid is used for the overlay UI, but panels should occupy "floating" containers rather than filling the screen width.
- **Tablet/Mobile:** Panels collapse into a bottom-sheet system to keep the stadium view visible at all times.
- **Rhythm:** An 8px linear scale governs all padding and margins. Use `panel-gap` (12px) for spacing between floating modules to maintain the "exploded view" spatial aesthetic.
- **Safe Areas:** Ensure a 40px margin from screen edges on desktop to prevent visual clutter and allow the background "environment" to breathe.

## Elevation & Depth

This design system eschews traditional flat shadows in favor of **Refractive Elevation**. Depth is communicated through the intensity of the background blur and the thickness of the inner highlight (rim light).

- **Level 1 (Base Panels):** Low blur (10px), 60% opacity white background, 1px solid white border at 20% opacity.
- **Level 2 (Active/Hover):** Medium blur (20px), 80% opacity, subtle drop shadow (0 8px 32px rgba(7, 26, 51, 0.08)).
- **Level 3 (Modals/AI Alerts):** High blur (40px), 95% opacity, soft blue-tinted shadow to indicate "Tournament Blue" AI activity.

**Digital Twin Integration:** Components should feel like they are floating 20-50 virtual millimeters above the map surface. Use a "Fresnel" effect on panel edges—a subtle inner glow—to mimic the light-catching properties of thick glass.

## Shapes

The shape language is **Refined Geometric**. Following the `Rounded` preset, the system avoids the playfulness of "Pill-shaped" buttons in favor of more structured, architectural forms.

- **Standard Elements (Buttons, Inputs):** 8px (0.5rem) radius.
- **Containers & Glass Panels:** 16px (1rem) radius (rounded-lg).
- **Large HUD Elements:** 24px (1.5rem) radius (rounded-xl) to create a soft, protective frame around data clusters.

Corners must be "squircled" (continuous curvature) where possible to align with the premium hardware aesthetic of high-end tablets and spatial computers.

## Components

### Buttons & Actions
- **Primary Action:** Solid Tournament Blue with white text. No gradient, but a subtle 1px inner top border (white, 30% opacity) to give a glass-press look.
- **Secondary Action:** Glassmorphic background with Navy text.
- **AI Action:** A subtle pulse animation on the border using Tournament Blue.

### Cards & Modules
All modules use a glass background. Titles are always `label-sm` in Navy, pinned to the top left. Metrics are displayed in `headline-lg` Outfit.

### Input Fields
Inputs are semi-transparent with a 1px border that brightens to Tournament Blue on focus. Labels float above the field in `label-sm`.

### Chips & Status Indicators
- **Crowd Safety:** Pill-shaped, using Pitch Green for "Optimal" and Amber for "Congested."
- **AI Insights:** Use a small spark icon next to the label.

### Lists
Lists should have "ghost" separators (1px Stadium White, 10% opacity). Items have a 4px hover-radius and a light-gray wash (Stadium White at 40% opacity) on hover.

### Additional Components: "The Twin-Controller"
A custom circular gesture-controller for rotating the 3D stadium view, styled like a physical dial made of frosted glass and gold accents for the "Home" orientation.