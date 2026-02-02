# Deep Context - Modern Chat Interface

## Overview
Deep Context is a modern web-based chat application with an Apple-inspired glassmorphism design, providing a multi-user chat experience, robust authentication, message persistence, and AI integration. It also features an analytics dashboard for ad campaign data visualization and a "War Room" for competitive intelligence. The project aims to deliver a seamless, high-performance platform for communication and strategic market analysis.

## User Preferences
- Clean, modern, classy interface
- Apple-inspired glassmorphism design
- Animated gradient background with floating orbs
- Light theme with professional color scheme
- Minimal distractions, focus on chat functionality
- Generous whitespace and breathing room

## System Architecture
The application is built with vanilla HTML, CSS, and JavaScript, emphasizing a glassmorphism aesthetic and robust data handling, alongside a React-based interactive graph visualization dashboard.

### UI/UX Decisions
- **Glassmorphism Design**: Semi-transparent panels with a 24px backdrop-blur.
- **Animated Background**: Floating gradient orbs with smooth animations.
- **Color Palette**: Light theme with blue accents (`#3b82f6`) and gray tones for chat, and a dark, neon cyberpunk aesthetic for the "War Room."
- **Layout**: Collapsible left sidebar, main chat area with AI Assistant header, message list, and fixed input bar.
- **Message Display**: Glass bubble messages with avatars, user messages right, AI messages left.
- **Dashboard Design**: Glass filter section, blue table headers, collapsible content sections.
- **Competitive Intelligence Suite**: 4-pillar tabbed navigation for Battlefield Overview, Pulse of Engagement, Creative Strategy, and AI Vision.
- **War Room Design**: "Neon Glass" dark cyberpunk aesthetic with deep slate background, neon accents, Inter and JetBrains Mono typography, DEFCON module, Aggression Gauge, Ticker Tape, Mission Control dropdowns with neon glow effects, and a bi-directional Battlefield timeline chart.
- **Strategic Map (Graph Dashboard)**: Dark Matrix design with dot grid, Executive Strategy View for aggregated ad data, AI Query Bar, Global Filters Sidebar, Node Inspector Panel, Graph Legend, and floating controls. Uses a Neon Intelligence Palette for nodes and weight-based link styling.

### Technical Implementations
- **Authentication**: Supabase Auth with Google OAuth.
- **Database Architecture**: Two-database system using Supabase PostgreSQL for user data, conversations, messages, analytics (with RLS), and n8n Redis for AI conversation context and memory. Features a central `companies` table for multi-company support.
- **Company-Based Filtering**: Canonical `company_key` for data identification and UI selectors.
- **AI Integration**: n8n webhook endpoint for contextual AI responses based on `sessionId`, `userId`, and `companyKey`.
- **Smart Rendering System**: Modular `message-renderer.js` supporting rich text (Markdown), Chart.js charts, data tables, media galleries, and images. `normalizeEnvelope` handles various AI response formats.
- **Performance Optimizations**: SupabaseManager singleton, QueryCache for caching, batched logging, server-side config injection, and debouncing.
- **Robust Message Saving**: Messages capture IDs, background task tracking, browser `beforeunload` warning, and a client-side `PendingMessageQueue` (localStorage-based) for reliable message persistence with retry logic and auto-flush.
- **Enterprise Chat State Machine**: Manages chat states for UI sync, prevents duplicate sends, and includes global safety watchdog timeouts.
- **Delta-Time Typing Animation**: Uses `requestAnimationFrame` for smooth animations without browser throttling.
- **Connection Management**: `ensureConnectionReady()` for warm-up and `handleVisibilityResume()` for recovery from background tabs, addressing Supabase deadlock bugs. `waitForAuthState()` prevents OAuth race conditions.
- **Application Lifecycle Management**: Ensures strict initialization order with promise-based execution and global error boundaries.
- **Standardized Database Layer**: All Supabase operations return consistent `{ success, data, error }` objects.
- **Server**: Python HTTP server for `/api/config` to deliver secure credentials.
- **Multi-Industry Subdomain Routing**: Server-side routing based on Host header for industry-specific Supabase instances and n8n webhooks.
- **Competitive Intelligence Suite**: `dashboard.html` for client-vs-competitor analysis using Supabase and Chart.js, and `intelligenceUtils.js` for consistent threat scoring.
- **War Room Specifics**: Command Deck (DEFCON + Aggression Gauge), Mission Control, "Stacked Frontline" Battlefield Chart (marketing activity timeline with 4 datasets), Live Intel Feed sidebar, Digital Surveillance (Tech Radar, Visual Intercept "Time Glider" with screenshots and AI analysis, Market Intel - Promotions Tracker). Auto-refresh every 30 seconds.
- **Live Threat Telemetry**: Real-time "COMPETITOR ACTIVITY" badge in header with weighted scoring from `intel_events` table and UI thresholds (SECURE, ELEVATED, CRITICAL).
- **AI Vision Analysis**: Displays AI-analyzed screenshots with "AI Tactical Insight" panel showing marketing intent and analysis.
- **Website AI Analysis Tab**: Glassmorphism-styled screenshot viewer in the Competitive Intelligence Suite with company selector, time slider, and AI Insight Panel.
- **Strategic Map (Graph Dashboard)**: React-based force-directed graph visualization using `react-force-graph-2d`, displaying Neo4j data. Features include: Executive Strategy View with aggregated ad data, AI Query Bar, Global Filters Sidebar, Node Inspector Panel, Graph Legend, and interactive controls (zoom, fit-to-screen). Styling uses Tailwind CSS and Radix UI.

## External Dependencies
- **Supabase**: User authentication (Google OAuth), PostgreSQL database, and Row Level Security.
- **n8n**: AI backend for contextual responses and Redis for AI conversation memory.
- **Neo4j**: Graph database for relationship data (accessed via `/api/graph`).
- **React + Vite**: Frontend development for the Strategic Map dashboard.
- **react-force-graph-2d**: Library for graph visualization in the Strategic Map.
- **Chart.js 4.4.1**: Interactive charts for AI responses and analytics.
- **Typography**: Space Grotesk (locally hosted), Inter and JetBrains Mono (Google Fonts).