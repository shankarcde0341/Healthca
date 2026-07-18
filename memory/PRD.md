# Healthca — Premium Healthcare SaaS Landing Page

## Original problem statement
Premium modern Healthcare & Medical Clinic SaaS website with clean, professional, enterprise-level UI inspired by Stripe / Linear / Vercel / Notion / Webflow. Not a traditional hospital site — a premium SaaS product feel with elegant healthcare branding. Palette: Primary #4F46E5, Secondary #2563EB, Accent #8B5CF6, Background #F8FAFC, Surface #FFFFFF, Text #0F172A, Border #E2E8F0. Typography: Plus Jakarta Sans (headings) + Inter (body). Sections: sticky glass Navbar, Hero (split + floating cards), Services (3-col grid with hover), About (image + floating card + counter stats), Features (bento), Doctors, Testimonials (marquee), Appointment form, FAQ (accordion), dark Footer (newsletter).

## User choices
- Scope: single landing page (all sections one page)
- Backend: appointment + newsletter save to MongoDB with success toast
- Content: polished placeholder ("Healthca")
- Stack: React + Tailwind + Framer Motion + Lucide + Sonner (JSX)

## Architecture
- **Backend**: FastAPI (`/app/backend/server.py`) with `/api` prefix, MongoDB via motor.
  - `GET /api/` — health
  - `POST /api/appointments`, `GET /api/appointments` — appointment CRUD
  - `POST /api/newsletter` — newsletter with 409 on duplicate
  - Legacy `/api/status` retained.
- **Frontend**: React CRA in `/app/frontend/src`, sonner toasts, framer-motion animations, all sections in `/app/frontend/src/components/`, landing composed in `/app/frontend/src/pages/Landing.jsx`.
- **Design system**: `/app/frontend/src/index.css` exposes `.hc-container`, `.hc-glass`, `.hc-gradient-bg`, `.hc-gradient-text`, `.hc-hero-bg`, `.hc-soft-shadow`, `.hc-lift-shadow`, and keyframes `hc-float`, `hc-marquee`, `hc-blob`.

## What's implemented (2026-12-08)
- Sticky glass Navbar with scroll blur + mobile menu
- Hero: split layout, gradient text, floating stat glass cards (Happy Patients, Online Consultation, Rating, Emergency, Experience), emergency + hours cards, soft blob background
- Services: 6-card grid with image zoom, gradient border, arrow slide on hover
- About: image + floating "Quality Healthcare" glass card + 3 animated counter stats + CTA
- Features: 4-col bento grid with a large gradient card
- Doctors: 4-card team grid with hover-reveal social icons
- Testimonials: infinite CSS marquee with 6 glass cards + edge fades
- Appointment: floating-label glass form, department select, date picker, POST to `/api/appointments`
- FAQ: shadcn Accordion with 6 items
- Footer: dark, glass newsletter card (POST `/api/newsletter`), 3 link columns, contact info, social icons

## Testing
- Backend 8/8 pass, Frontend all key flows pass (iteration_1.json). No failures.

## Backlog (P0/P1/P2)
- P1: Add real doctor profile modal + booking-per-doctor deep link
- P1: Add SEO meta tags + Open Graph image
- P2: Multi-page routes (Blog, individual service pages, Doctor detail)
- P2: Analytics + heatmap for conversion tuning
- P2: Live chat widget for lead capture
- P2: Convert to TypeScript

## 2026-12-08 — Role-based Auth + Dashboards (Patient / Receptionist / Doctor)
- JWT Bearer auth (bcrypt hashed passwords). Endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`.
- Separate `/login/{role}` and `/register/{role}` pages for each of: patient, receptionist, doctor.
- Backend RBAC via `require_role(...roles)`; wrong-role login returns 403 with clear message.
- New endpoints: `/api/doctors`, `/api/appointments/book`, `/api/appointments/mine`, PATCH+DELETE `/api/appointments/{id}`, `/api/announcements`, `/api/doctor/stats`, `/api/emergency-alerts`.
- Frontend: `AuthContext`, `ProtectedRoute`, and three role-specific dashboards.
  - Patient: book, list, reschedule, cancel; view available doctors; see announcements.
  - Receptionist: stats, book on-behalf (walk-in), reschedule/cancel any, send emergency alerts.
  - Doctor: patient/appointment stats, publish holiday/emergency/general announcements, delete own; see emergency alerts.
- Navbar now has "Sign in" dropdown routing to each portal + `Get Started` -> patient registration.
- Test report iteration_2.json: 100% backend (29/29) + all critical frontend flows.

## Backlog updates
- P1 (new): Convert receptionist `window.prompt()` reschedule into a proper modal
- P1 (new): Password reset + email verification flow (needs Resend integration)
- P2 (new): Doctor calendar availability + slot picker instead of free-form date/time
- P2 (new): Real-time announcement/emergency toast push (WebSocket or SSE)
