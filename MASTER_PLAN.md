# HMS — Master Implementation Plan

## Phase 1: Migration 0005
Tables: sessions, locations, participant_sessions, announcements, surveys, survey_responses, announcement_reads
Alter events: logo_url, banner_color, accent_color

## Phase 2: Backend APIs (8 new files)
1. sessions.ts      — Session CRUD + bulk + participant booking
2. locations.ts     — Location CRUD + map image upload to R2
3. announcements.ts — Broadcast CRUD + mark read
4. surveys.ts       — Survey builder + responses + analytics
5. portal.ts        — Participant portal (dashboard, schedule, locations, survey)
6. branding.ts      — Event brand config (logo, colors)
7. services-api.ts  — Event date services CRUD + attendance marking
8. reporting-ext.ts — Session attendance stats, survey analytics, full export

## Phase 3: Frontend Pages (14 new + modifications)
New:
- AdminSessions.tsx       — Session/program management
- AdminLocations.tsx      — Location manager with map
- AdminAnnouncements.tsx  — Broadcast composer
- AdminSurvey.tsx         — Survey builder
- AdminBranding.tsx       — Event branding
- AdminServices.tsx       — Service schedule configuration
- PortalDashboard.tsx     — Participant main dashboard
- PortalSchedule.tsx      — Participant program view
- PortalLocations.tsx     — Participant map view
- PortalAnnouncements.tsx — Participant broadcasts
- PortalSurvey.tsx        — Participant feedback

Modified:
- App.tsx          — Add new routes
- TabBar.tsx       — Add Sessions, Locations, Services tabs
- Dashboard.tsx    — Add session + survey analytics
- Participants.tsx — Add Broadcast button
- EventDetail.tsx  — Add branding + service links

## Phase 4: Staff Features
- StaffDashboard.tsx — Add Attendance tab (service marking)

## Phase 5: Build & Deploy
- npm install
- Vite build
- Wrangler deploy
- Verify all endpoints
