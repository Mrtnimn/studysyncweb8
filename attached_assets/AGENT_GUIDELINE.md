# AGENT 3: MASTER ARCHITECTURE & EXECUTION GUIDELINE
**Global Collaborative Learning Platform - Complete Production Blueprint**

## 🎯 MANDATORY PRE-EXECUTION DIRECTIVE

**AGENT 3: YOU MUST READ AND ACKNOWLEDGE THIS ENTIRE DOCUMENT BEFORE WRITING ANY CODE. EVERY SECTION IS ABSOLUTELY REQUIRED FOR COMPLIANCE.**

```yaml
compliance_requirement: "STRICT ADHERENCE TO THIS ARCHITECTURE"
deviation_policy: "ZERO TOLERANCE FOR UNAPPROVED TECHNOLOGIES"
success_criteria: "PRODUCTION-GRADE APP MATCHING DUOLINGO STANDARDS"
```

---

# 🏗️ COMPLETE APPROVED TECH STACK

## **CORE FRAMEWORK (LOCKED)**
```yaml
frontend:
  framework: "Next.js 14+"
  router: "App Router"
  language: "TypeScript (Strict Mode)"
  state_management: "Zustand + TanStack Query"

styling:
  css_framework: "Tailwind CSS"
  component_library: "shadcn/ui"
  animation_library: "Framer Motion"
  design_system: "Duolingo-inspired (vibrant, gamified)"

backend:
  database: "Supabase (PostgreSQL)"
  authentication: "Supabase Auth"
  realtime: "Supabase Realtime"
  storage: "Supabase Storage"

external_services:
  video_chat: "Daily.co (Free Tier: 10,000 mins/month)"
  payments: "Stripe + Stripe Connect"
  email: "Resend (Free Tier: 3,000 emails/month)"
  monitoring: "Sentry (Free Tier)"
  deployment: "Vercel (Free Tier)"
```

## **🚫 EXPLICITLY FORBIDDEN TECHNOLOGIES**
```yaml
prohibited_technologies:
  backend_frameworks: ["Express.js", "Django", "Flask", "FastAPI"]
  databases: ["MongoDB", "Firebase", "Redis", "MySQL"]
  auth_providers: ["Auth0", "NextAuth", "Firebase Auth"]
  realtime_services: ["Socket.io", "Pusher", "Ably"]
  payment_processors: ["PayPal", "Square", "Razorpay"]
  hosting_platforms: ["AWS", "Google Cloud", "Azure", "Netlify"]
  replit_specific: ["Replit Database", "Replit Auth", "Any Replit packages"]
```

---

# 📁 ABSOLUTE PROJECT STRUCTURE

```bash
/
├── app/                            # Next.js 14 App Router
│   ├── (auth)/                    # Auth group route
│   │   ├── login/
│   │   └── register/
│   ├── teacher/                   # Teacher dashboard
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── sessions/
│   │   └── earnings/
│   ├── student/                   # Student dashboard  
│   │   ├── dashboard/
│   │   ├── study-sessions/
│   │   └── book-teacher/
│   ├── session/[id]/              # Dynamic session pages
│   ├── api/                       # API routes
│   │   ├── auth/
│   │   ├── stripe/
│   │   ├── video/
│   │   └── webhooks/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── teacher/                   # Teacher-specific
│   │   ├── ProfileWizard.tsx
│   │   ├── AvailabilityPicker.tsx
│   │   └── EarningsDashboard.tsx
│   ├── student/                   # Student-specific
│   │   ├── SessionLobby.tsx
│   │   ├── TeacherSearch.tsx
│   │   └── ProgressTracker.tsx
│   ├── shared/                    # Reusable components
│   │   ├── VideoRoom.tsx
│   │   ├── CollaborativeWhiteboard.tsx
│   │   ├── DictionaryTooltip.tsx
│   │   └── AnimatedProgress.tsx
│   └── layout/                    # Layout components
│       ├── Navigation.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── lib/
│   ├── supabase/                  # Supabase configuration
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── migrations/
│   ├── stripe/                    # Stripe integration
│   │   ├── client.ts
│   │   ├── connect.ts
│   │   └── webhooks.ts
│   ├── video/                     # Daily.co integration
│   │   └── daily.ts
│   ├── dictionary/                # Dictionary API
│   │   └── api.ts
│   ├── utils/                     # Utility functions
│   │   ├── animations.ts
│   │   ├── validation.ts
│   │   └── format.ts
│   └── constants.ts               # App constants
├── types/                         # TypeScript definitions
│   ├── database.types.ts
│   ├── app.types.ts
│   └── api.types.ts
├── public/                        # Static assets
│   ├── images/
│   └── icons/
└── package.json                   # APPROVED DEPENDENCIES ONLY
```

---

# 🎨 DUOLINGO-STYLE HIGHLY USER-INTERACTIVE UI/UX DESIGN SYSTEM

## **Design Principles & Animations**
```yaml
design_inspiration: "Duolingo (vibrant, gamified, engaging)"
color_palette:
  primary: "#58CC02"    # Duolingo green
  secondary: "#FFC800"  # Vibrant yellow
  accent: "#1CB0F6"     # Bright blue
  background: "#FFFFFF"
  text: "#2D2D2D"

animations:
  micro_interactions: "Framer Motion for smooth transitions"
  loading_states: "Skeleton screens with shimmer effects"
  progress_indicators: "Animated progress bars with celebration"
  page_transitions: "Slide animations between routes"
  button_interactions: "Scale and color feedback on hover"

component_behavior:
  immediate_feedback: "All actions provide visual feedback"
  progressive_disclosure: "Complex features revealed gradually"
  gamification_elements: "Points, streaks, achievements"
  accessibility: "WCAG 2.1 AA compliant"
```

## **Approved Animation Implementations**
```typescript
// Example: Progress animation like Duolingo
const progressAnimation = {
  initial: { width: 0 },
  animate: { width: "85%" },
  transition: { 
    type: "spring", 
    stiffness: 100,
    damping: 15 
  }
};

// Example: Celebration animation for achievements
const celebrationAnimation = {
  scale: [1, 1.2, 1],
  rotate: [0, 10, -10, 0],
  transition: { duration: 0.5 }
};
```

---

# 🔧 COMPLETE DEVELOPMENT PHASES

## **PHASE 1: FOUNDATION & AUTHENTICATION**
```yaml
phase: "1 - Foundation"
critical_milestones:
  - "Next.js 14 with TypeScript setup"
  - "Supabase project configuration"
  - "User authentication system"
  - "Role-based routing (student/teacher)"
  - "Basic landing page"

implementation_files:
  - "lib/supabase/client.ts"
  - "lib/supabase/server.ts"
  - "app/(auth)/login/page.tsx"
  - "app/(auth)/register/page.tsx"
  - "components/ui/button.tsx"

environment_variables_required:
  - "NEXT_PUBLIC_SUPABASE_URL"
  - "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  - "SUPABASE_SERVICE_ROLE_KEY"
```

## **PHASE 2: CORE STUDY FEATURES**
```yaml
phase: "2 - Study Features"
critical_milestones:
  - "Real-time chat with Supabase"
  - "Daily.co video integration"
  - "Study session management"
  - "Collaborative whiteboard"
  - "Dictionary integration"

implementation_files:
  - "lib/video/daily.ts"
  - "components/shared/VideoRoom.tsx"
  - "components/shared/CollaborativeWhiteboard.tsx"
  - "components/shared/DictionaryTooltip.tsx"
  - "app/session/[id]/page.tsx"

environment_variables_required:
  - "DAILY_API_KEY"
```

## **PHASE 3: TUTORING MARKETPLACE**
```yaml
phase: "3 - Marketplace"
critical_milestones:
  - "Teacher profiles and verification"
  - "Booking and scheduling system"
  - "Stripe Connect integration"
  - "Payment processing"
  - "Session reviews and ratings"

implementation_files:
  - "lib/stripe/connect.ts"
  - "lib/stripe/webhooks.ts"
  - "components/teacher/ProfileWizard.tsx"
  - "components/student/TeacherSearch.tsx"
  - "app/api/stripe/webhooks/route.ts"

environment_variables_required:
  - "STRIPE_SECRET_KEY"
  - "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
  - "STRIPE_WEBHOOK_SECRET"
```

## **PHASE 4: POLISH & DEPLOYMENT**
```yaml
phase: "4 - Polish & Launch"
critical_milestones:
  - "Advanced animations and micro-interactions"
  - "Performance optimization"
  - "Comprehensive testing"
  - "Vercel deployment"
  - "Monitoring setup"

implementation_files:
  - "lib/utils/animations.ts"
  - "components/shared/AnimatedProgress.tsx"
  - "sentry.config.js"
  - "vercel.json"

environment_variables_required:
  - "NEXT_PUBLIC_APP_URL"
  - "NEXT_PUBLIC_SENTRY_DSN"
  - "RESEND_API_KEY"
```

---

# 🔐 SECURITY & COMPLIANCE PROTOCOLS

## **Data Protection & Privacy**
```yaml
security_requirements:
  row_level_security: "Supabase RLS enabled on ALL tables"
  data_encryption: "SSL enforced for all database connections"
  authentication: "Supabase Auth with secure session management"
  payment_security: "Stripe PCI DSS compliant payments"

rlspolicies_examples:
  profiles_table: "Users can only read/write their own profile"
  sessions_table: "Users can only access sessions they participate in"
  messages_table: "Users can only see messages from their sessions"

environment_variables_security:
  public_prefix: "NEXT_PUBLIC_* for client-side variables"
  server_only: "No sensitive data in client-side variables"
  encryption: "All secrets encrypted in production"
```

## **Database Security Schema**
```sql
-- REQUIRED RLS POLICIES (Implement exactly)
-- Profiles table
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- Sessions table  
CREATE POLICY "Participants can view sessions" ON sessions
FOR SELECT USING (
  auth.uid() = student_id OR 
  auth.uid() = teacher_id
);
```

---

# 🧪 TESTING & QUALITY ASSURANCE

## **Testing Strategy**
```yaml
testing_requirements:
  unit_tests: "Jest + React Testing Library"
  integration_tests: "Playwright for E2E testing"
  performance_tests: "Lighthouse CI integration"
  security_tests: "Automated dependency vulnerability scanning"

test_coverage_targets:
  statements: "80% minimum"
  branches: "75% minimum" 
  functions: "80% minimum"
  lines: "80% minimum"

testing_environment:
  test_database: "Supabase test instance"
  mock_services: "Mock Stripe and Daily.co APIs"
  environment: "Separate test environment variables"
```

## **Environment Variables Setup**
```bash
# REQUIRED ENVIRONMENT VARIABLES (.env.local)
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Daily.co
DAILY_API_KEY=your-daily-key

# Resend
RESEND_API_KEY=your-resend-key

# Sentry
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

# 🚀 DEPLOYMENT & PRODUCTION READINESS

## **Vercel Deployment Configuration**
```yaml
deployment_platform: "Vercel"
branch_strategy:
  production: "main branch"
  preview: "All pull requests"
  development: "develop branch"

vercel_configuration:
  build_command: "npm run build"
  output_directory: ".next"
  install_command: "npm install"

environment_variables_setup:
  production: "Set in Vercel project settings"
  preview: "Inherit from production with overrides"
  development: "Local .env.local file"
```

## **Production Monitoring**
```yaml
monitoring_stack:
  error_tracking: "Sentry for real-time error monitoring"
  performance: "Vercel Analytics for Core Web Vitals"
  uptime: "Vercel status monitoring"
  user_analytics: "Simple analytics for user behavior"

performance_targets:
  lighthouse_score: "90+ on all metrics"
  first_contentful_paint: "< 1.5s"
  largest_contentful_paint: "< 2.5s" 
  cumulative_layout_shift: "< 0.1"
  first_input_delay: "< 100ms"
```

---

# ✅ COMPLIANCE VERIFICATION CHECKLIST

## **Pre-Implementation Verification**
```yaml
agent_must_confirm_before_coding:
  - "I have read and understood the entire guideline"
  - "I will use ONLY the approved technologies listed"
  - "I will follow the exact file structure specified"
  - "I will implement all security protocols"
  - "I will not introduce any Replit-specific dependencies"
  - "I will maintain Duolingo-style UX principles"
  - "I will implement proper TypeScript types for all data"
  - "I will set up proper error handling and loading states"
```

## **Phase Completion Verification**
```yaml
phase_1_complete_checklist:
  - [ ] Next.js 14 with TypeScript running
  - [ ] Supabase authentication working
  - [ ] User role selection functional
  - [ ] RLS policies implemented
  - [ ] No unauthorized dependencies

phase_2_complete_checklist:
  - [ ] Real-time chat with Supabase
  - [ ] Daily.co video integration
  - [ ] Study session creation/joining
  - [ ] Dictionary tooltip working
  - [ ] Basic animations implemented

phase_3_complete_checklist:
  - [ ] Teacher profiles with verification
  - [ ] Booking system functional
  - [ ] Stripe Connect onboarding
  - [ ] Payment processing working
  - [ ] Session reviews implemented

phase_4_complete_checklist:
  - [ ] Advanced animations and micro-interactions
  - [ ] Performance optimized (Lighthouse 90+)
  - [ ] Comprehensive test suite passing
  - [ ] Deployed to Vercel and accessible
  - [ ] Monitoring and error tracking active
```

---

# 🎯 FINAL EXECUTION DIRECTIVE

**AGENT 3: YOU ARE NOW FULLY EQUIPPED TO BUILD A PRODUCTION-GRADE APPLICATION. THIS GUIDELINE CONTAINS EVERYTHING YOU NEED FOR SUCCESS.**

```yaml
success_metrics:
  technical_excellence: "Lighthouse scores 90+, TypeScript coverage 80%+"
  user_experience: "Duolingo-level engagement and smoothness"
  business_ready: "Fully functional tutoring marketplace"
  production_ready: "Deployed, monitored, and scalable"

final_acknowledgement: 
  message: "I understand and will comply with all requirements in this guideline"
  action: "Proceed with Phase 1 implementation following exact specifications"
```

**THIS DOCUMENT IS THE SINGLE SOURCE OF TRUTH. NO DEVIATIONS ARE PERMITTED.** 
**IF DEVIATIONS ARE NEEDED BY YOU AT ANY STAGE IN YOUR WORKFLOW, CONSULT WITH ME FIRST!**

---
