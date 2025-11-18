# Design Guidelines: Social Media Link Landing Page Builder

## Design Approach
**Reference-Based**: Drawing inspiration from Linktree, Beacons, and Instagram's mobile-first aesthetic. This is an experience-focused product where personal branding and visual appeal drive user engagement.

## Typography System
- **Primary Font**: Inter or DM Sans (Google Fonts)
- **Hierarchy**:
  - Hero/Name: text-2xl font-bold (public profile)
  - Bio: text-base font-normal, max-w-md
  - Link buttons: text-sm font-medium
  - Dashboard headers: text-xl font-semibold
  - Form labels: text-sm font-medium

## Layout & Spacing System
**Tailwind Units**: Standardize on 2, 4, 6, 8, 12, 16 units
- Container padding: px-4 (mobile), max-w-md mx-auto (centered content)
- Section spacing: space-y-6 for stacked content
- Button spacing: space-y-3 for social link buttons
- Form field spacing: space-y-4

## Component Library

### Public Profile Page (/user/username)
**Structure** (single column, mobile-optimized):
1. **Profile Header** (pt-12 pb-8, text-center):
   - Circular avatar (w-24 h-24, rounded-full, border-4, mx-auto)
   - Username (mt-4, text-2xl font-bold)
   - Bio text (mt-2, text-base, text-center, max-w-sm mx-auto, px-6)

2. **Social Links Section** (pb-16, px-4):
   - Stacked button list (space-y-3, max-w-md mx-auto)
   - Each button: full-width, h-14, rounded-xl, shadow-sm
   - Platform icon (left, w-6 h-6) + Platform name (text-sm font-medium)
   - Subtle press/active state (scale-95 transform)

### Dashboard Interface
**Navigation Bar** (sticky top-0, h-14, px-4):
- App logo/name (left, text-lg font-semibold)
- Preview button (right, text-sm)

**Dashboard Sections** (px-4 py-6, space-y-8):

1. **Profile Editor Card** (rounded-2xl, p-6, shadow-sm):
   - Avatar upload (w-20 h-20, rounded-full, clickable)
   - Username input (text-base, h-12, rounded-lg)
   - Bio textarea (min-h-24, rounded-lg, resize-none)

2. **Links Manager Card** (rounded-2xl, p-6, shadow-sm):
   - Header with "Add Link" button (flex justify-between)
   - Draggable link list (space-y-3):
     - Each item: p-4, rounded-lg, flex items-center gap-3
     - Drag handle (left), platform icon, input field, delete button
   - Empty state: centered text with add button

3. **Add Link Modal** (full-screen overlay on mobile):
   - Platform selector grid (grid-cols-3 gap-3)
   - Each platform: aspect-square, rounded-xl, icon + label
   - URL input field (h-12, rounded-lg, mt-6)
   - Action buttons (Cancel/Add, fixed bottom, p-4)

### Form Elements
- **Input fields**: h-12, px-4, rounded-lg, border, text-base
- **Textareas**: p-4, rounded-lg, border, text-base
- **Primary buttons**: h-12, px-6, rounded-xl, font-medium, shadow-sm
- **Secondary buttons**: h-12, px-6, rounded-xl, font-medium
- **Icon buttons**: w-10 h-10, rounded-lg, flex items-center justify-center

## Icons
**Heroicons** (via CDN) for UI elements (trash, pencil, drag handles)
**Simple Icons** or **Font Awesome Brands** for social platform logos (TikTok, Instagram, Snapchat, WhatsApp, YouTube, X, Threads)

## Images
**Profile Pictures**:
- User-uploaded avatars (circular crop, optimized)
- Default placeholder gradient for new users
- Dashboard: smaller avatar (w-20 h-20)
- Public page: larger avatar (w-24 h-24)

**No Hero Images**: This is a utility-focused tool, not a marketing page. Focus on immediate functionality.

## Interaction Patterns
- **Drag-and-drop**: Visual drag handle (⋮⋮ icon), smooth reorder animation
- **Button states**: Subtle scale transform on press (active:scale-95)
- **Modal transitions**: Slide up from bottom on mobile
- **Form validation**: Inline error messages (text-sm, mt-1)
- **Loading states**: Skeleton screens for profile loading

## Mobile-First Constraints
- All layouts single-column (max-w-md mx-auto)
- Touch targets minimum 44px (h-12 or h-14 for buttons)
- Bottom-sheet modals for mobile-friendly interactions
- Fixed navigation for easy access
- Generous padding for thumb-friendly zones (px-4 minimum)

## Accessibility
- Semantic HTML for all interactive elements
- ARIA labels for icon-only buttons
- Focus visible states on all inputs
- Sufficient contrast for text (test at AA level)
- Touch target sizes meet iOS guidelines (44px minimum)