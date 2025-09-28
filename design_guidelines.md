# StudySyncWeb Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from Discord's server layout for collaborative features and Notion's clean workspace design for academic focus, creating a modern student-friendly interface that balances functionality with visual appeal.

## Core Design Elements

### A. Color Palette
**Light Mode:**
- Primary: #6366F1 (Indigo) - Navigation, CTAs, active states
- Secondary: #10B981 (Emerald) - Success states, study streaks
- Background: #F8FAFC (Light grey) - Main background
- Text: #1E293B (Slate) - Primary text
- Accent: #F59E0B (Amber) - Notifications, achievements
- Success: #059669 (Green) - Completed tasks, positive feedback

**Dark Mode:**
- Primary: 239 84% 67% (Lighter indigo for contrast)
- Secondary: 160 84% 39% (Adjusted emerald)
- Background: 222 84% 5% (Dark slate)
- Text: 210 40% 98% (Light text)
- Cards: 220 13% 18% (Dark grey cards)

### B. Typography
- **Primary Font**: Inter (Google Fonts) - Clean, readable for UI elements
- **Secondary Font**: Poppins (Google Fonts) - Headings and emphasis
- **Scale**: 14px (body), 16px (default), 18px (large), 24px (h3), 32px (h2), 40px (h1)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### C. Layout System
**Tailwind Spacing Units**: Consistent use of 2, 4, 8, 12, 16 units
- `p-2, m-4, gap-8, space-y-4` for tight spacing
- `p-4, m-8, gap-12` for medium spacing  
- `p-8, m-16` for generous spacing
- 8px border radius for cards and buttons
- 16px base spacing for component padding

### D. Component Library

**Navigation:**
- Discord-inspired sidebar with collapsible sections
- Clean top navigation with user profile and notifications
- Breadcrumb navigation for deep pages

**Cards:**
- Notion-style clean cards with subtle shadows
- Study room cards with preview thumbnails
- Tutor profile cards with subject badges

**Interactive Elements:**
- Rounded buttons with hover states
- Toggle switches for settings (Do Not Disturb)
- Progress bars for gamification (animated)
- Calendar grid with clickable date cells

**Study Environment:**
- Minimalist full-screen study room interface
- Floating control panels with blur backgrounds
- Document viewer with clean typography
- Timer display with large, readable numbers

**Forms:**
- Clean input fields with floating labels
- File upload areas with drag-and-drop styling
- Form validation with inline error messages

### E. Visual Hierarchy
- **Headers**: Bold Poppins fonts with adequate spacing
- **Content Sections**: Clear separation using cards and whitespace
- **CTAs**: Primary buttons using brand indigo with high contrast
- **Secondary Actions**: Outline buttons with hover effects

### F. Gamification Elements
- **Progress Bars**: Animated with emerald success color
- **Badge System**: Colorful achievement badges with subtle animations
- **Streak Counters**: Large, prominent numbers with supporting text
- **XP Display**: Clean numerical displays with progress indicators

### G. Study-Focused Design
- **Distraction-Free**: Minimal UI in study mode, hidden navigation
- **Focus Colors**: Calming background themes for study rooms
- **Readability**: High contrast text, comfortable line spacing
- **Clean Aesthetics**: Academic feel without being sterile

### H. Responsive Design
- **Mobile-First**: Optimized for smartphone studying
- **Tablet**: Enhanced layout for group collaboration
- **Desktop**: Full feature set with multi-panel layouts
- **Breakpoints**: Standard Tailwind responsive utilities

This design system creates an engaging, academic-focused platform that feels welcoming to young students while maintaining the professional quality needed for effective learning environments.