# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Meetopia is a Vue 3 + TypeScript video conferencing and meeting management application built with Vite. It features real-time collaborative meetings, video calls via Agora RTC SDK, screen sharing, live notes editing, and action item tracking.

## Development Commands

```bash
# Development
npm run dev                # Start development server

# Build and Type Checking
npm run build             # Build for production (runs vue-tsc -b && vite build)
npm run preview           # Preview production build locally
```

## Architecture

### Core Stack
- **Frontend**: Vue 3 with Composition API (`<script setup>`) + TypeScript
- **Build Tool**: Vite with Vue plugin and Tailwind CSS Vite plugin
- **State Management**: Pinia stores
- **Routing**: Vue Router with nested routes and auth guards
- **UI Framework**: Custom component library built with Shadcn-ui, Tailwind CSS, and Tailwind Animate
- **Video Conferencing**: Agora RTC SDK NG
- **Real-time**: Socket.IO client for collaborative features
- **HTTP Client**: Axios with interceptors for auth

### Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components (Button, Card, Input, etc.)
│   ├── ActionItems.vue  # Action items display component
│   └── ActionItemManager.vue # Action items CRUD management
├── views/               # Route-level components
├── stores/              # Pinia stores (auth, meeting, actionItem, etc.)
├── types/               # TypeScript type definitions
├── lib/
│   ├── axios.ts         # Axios configuration with auth interceptors
│   └── utils.ts         # Utility functions (cn for class merging)
├── composables/         # Vue composables
└── router/              # Vue Router configuration
```

### Key Features Architecture

#### Authentication System
- Cookie-based authentication with httpOnly cookies
- Auth store handles login/logout/checkAuth state
- Router guards protect authenticated routes
- Axios interceptors handle 401 redirects

#### Video Conferencing (Agora Integration)
- Located in `LiveMeeting.vue`:567-685
- Uses Agora RTC SDK NG for real-time video/audio
- Features: microphone toggle, camera toggle, screen sharing
- Token-based authentication with backend token endpoint
- Dynamic remote video container management

#### Real-time Collaboration
- Socket.IO integration for live features
- Real-time note editing with conflict prevention
- Live user presence and cursor indicators
- Action items collaboration

#### Meeting Management
- CRUD operations via `stores/meeting.ts`
- Meetings can be SCHEDULED, ACTIVE, ENDED, or CANCELLED
- Nested routing under `/dashboard` layout
- Meeting detail views with participant management

#### Action Items System
- Status workflow: OPEN → IN_PROGRESS → DONE
- Priority levels: LOW, MEDIUM, HIGH
- Assigned users with due dates
- Real-time collaboration support

### Important Patterns

#### Store Pattern
All stores use the Composition API pattern:
```typescript
export const useXStore = defineStore('x', () => {
  const state = ref()
  const computed = computed(() => ...)
  const actions = async () => {
    // API calls and state updates
  }
  return { state, computed, actions }
})
```

#### Component Architecture
- UI components in `components/ui/` follow atomic design
- Form components use Reka UI with proper TypeScript types
- Consistent use of `cn()` utility for conditional styling
- Components accept props and emit events for parent communication

#### Route Structure
- Public routes: `/`, `/login`, `/register` (requiresGuest: true)
- Protected routes: `/dashboard/*` (requiresAuth: true)
- Nested dashboard routes with shared layout

## Environment Configuration

- API URL configured via `VITE_API_URL` environment variable
- Default: `http://localhost:3000/api`
- Axios configured with `withCredentials: true` for cookie auth

## Development Notes

- Uses path alias `@/` for `src/` directory
- TypeScript strict mode enabled
- Tailwind CSS for styling with custom component variants
- Component library exports via index.ts files for tree-shaking
- Real-time features require both Socket.IO and Agora services running