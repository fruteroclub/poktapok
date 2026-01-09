# Admin Navigation Design - Epic 3 Integration

## Current State Analysis

### Existing Admin Navigation
```
Admin Section:
├── admin home (/admin)
├── pending users (/admin/pending-users)
├── users management (/admin/users)
├── activities (/admin/activities)
└── submissions (/admin/submissions)
```

### New Admin Pages (Epic 3)
```
Epic 3 - Program Management:
├── applications (/admin/applications) - E3-T4
├── programs (/admin/programs) - E3-T8 ✅ NEW
└── sessions/[id]/attendance (/admin/sessions/[id]/attendance) - E3-T5
```

## Design Problem

**Current Issues**:
1. Flat navigation structure doesn't scale well (already 5+ items)
2. No visual grouping of related features
3. Epic 3 pages not represented in navigation
4. Missing session management entry point (attendance only accessible via deep link)
5. No clear information architecture for program lifecycle

## Proposed Solution

### Option 1: Categorized Navigation with Collapsible Sections

```
┌─ ADMIN NAVIGATION ──────────────────┐
│                                      │
│ 📊 Overview                          │
│   └─ Dashboard                       │
│                                      │
│ 👥 User Management ▼                 │
│   ├─ All Users                       │
│   ├─ Pending Users                   │
│   └─ Applications Queue       [NEW]  │
│                                      │
│ 🎓 Program Management ▼       [NEW]  │
│   ├─ Programs                 [NEW]  │
│   ├─ Sessions                 [NEW]  │
│   └─ Attendance               [NEW]  │
│                                      │
│ 📝 Content Management ▼              │
│   ├─ Activities                      │
│   └─ Submissions                     │
│                                      │
└──────────────────────────────────────┘
```

**Pros**:
- Clear information architecture
- Scalable for future features
- Reduces cognitive load
- Modern UX pattern

**Cons**:
- More complex implementation
- Requires collapsible component
- More clicks to reach deep pages

### Option 2: Grouped Navigation with Visual Separators

```
┌─ ADMIN NAVIGATION ──────────────────┐
│                                      │
│ Dashboard                            │
│                                      │
│ ─────── Users ───────                │
│ All Users                            │
│ Pending Users                        │
│ Applications                  [NEW]  │
│                                      │
│ ─────── Programs ─────       [NEW]  │
│ Programs                      [NEW]  │
│ Sessions                      [NEW]  │
│                                      │
│ ─────── Content ──────               │
│ Activities                           │
│ Submissions                          │
│                                      │
└──────────────────────────────────────┘
```

**Pros**:
- Simpler implementation
- All items visible at once
- Clear grouping without interaction
- Easy to scan

**Cons**:
- Takes more vertical space
- Less scalable long-term
- Can become cluttered

### Option 3: Two-Level Flat Navigation (Recommended)

```
┌─ ADMIN NAVIGATION ──────────────────┐
│                                      │
│ 📊 Dashboard                         │
│                                      │
│ 👥 Users                             │
│ 👥 Pending Users                     │
│ 📋 Applications               [NEW]  │
│                                      │
│ 🎓 Programs                   [NEW]  │
│ 📅 Sessions                   [NEW]  │
│                                      │
│ 📝 Activities                        │
│ 📄 Submissions                       │
│                                      │
└──────────────────────────────────────┘
```

**Pros**:
- Simple implementation (just add items + icons)
- Clear grouping via whitespace and icons
- All items visible and accessible
- Balances simplicity and organization

**Cons**:
- Icon dependency for visual grouping
- Medium scalability

## Recommended Implementation: Option 3

### Information Architecture

**Category: Overview**
- Dashboard → `/admin` (existing)

**Category: User Management**
- Users → `/admin/users` (existing)
- Pending Users → `/admin/pending-users` (existing)
- Applications → `/admin/applications` (NEW - E3-T4)

**Category: Program Management** (NEW)
- Programs → `/admin/programs` (NEW - E3-T8)
- Sessions → `/admin/sessions` (NEW - needs implementation)

**Category: Content Management**
- Activities → `/admin/activities` (existing)
- Submissions → `/admin/submissions` (existing)

### Navigation Structure

```typescript
type MenuSection = {
  category: string
  items: MenuItemType[]
}

const ADMIN_MENU_SECTIONS: MenuSection[] = [
  {
    category: 'Overview',
    items: [
      {
        displayText: 'Dashboard',
        href: '/admin',
        icon: 'LayoutDashboard',
        adminOnly: true
      },
    ],
  },
  {
    category: 'User Management',
    items: [
      {
        displayText: 'Users',
        href: '/admin/users',
        icon: 'Users',
        adminOnly: true
      },
      {
        displayText: 'Pending Users',
        href: '/admin/pending-users',
        icon: 'UserCog',
        adminOnly: true
      },
      {
        displayText: 'Applications',
        href: '/admin/applications',
        icon: 'ClipboardList',
        adminOnly: true,
        badge: 'pending' // Show pending count
      },
    ],
  },
  {
    category: 'Program Management',
    items: [
      {
        displayText: 'Programs',
        href: '/admin/programs',
        icon: 'GraduationCap',
        adminOnly: true
      },
      {
        displayText: 'Sessions',
        href: '/admin/sessions',
        icon: 'Calendar',
        adminOnly: true
      },
    ],
  },
  {
    category: 'Content Management',
    items: [
      {
        displayText: 'Activities',
        href: '/admin/activities',
        icon: 'FileText',
        adminOnly: true
      },
      {
        displayText: 'Submissions',
        href: '/admin/submissions',
        icon: 'Send',
        adminOnly: true,
        badge: 'pending' // Show pending count
      },
    ],
  },
]
```

### Visual Design

**Spacing & Typography**:
- Category header: text-xs uppercase text-muted-foreground font-semibold pt-4 pb-2
- Menu item: px-3 py-2 text-sm font-medium
- Section spacing: 12px between categories
- Icon size: 16px (h-4 w-4)

**Color Scheme**:
- Active state: bg-accent text-accent-foreground
- Hover state: hover:bg-accent/50
- Default: text-muted-foreground
- Category header: text-muted-foreground/70

**Badge System** (Optional Enhancement):
```typescript
// Show counts for actionable items
Applications → Badge with pending count
Submissions → Badge with pending review count
```

### Implementation Plan

**Phase 1: Add New Menu Items** (Immediate)
1. Add "Applications" under User Management section
2. Add "Programs" as new Program Management section
3. Add "Sessions" under Program Management section
4. Add icons to all menu items

**Phase 2: Visual Enhancements** (Next sprint)
1. Add category headers with visual separation
2. Implement badge system for pending counts
3. Add icons from lucide-react

**Phase 3: Advanced Features** (Future)
1. Add collapsible sections (if navigation grows)
2. Implement search/filter for navigation
3. Add keyboard shortcuts

## Implementation Code

### Updated MenuItemType

```typescript
export type MenuItemType = {
  displayText: string
  href: string
  icon?: string // Lucide icon name
  adminOnly?: boolean
  badge?: 'pending' | 'count' // Badge type
  category?: string // For grouping
}
```

### Menu Items with Epic 3 Integration

```typescript
const MENU_ITEMS: MenuItemType[] = [
  // Overview
  {
    displayText: 'Dashboard',
    href: '/admin',
    icon: 'LayoutDashboard',
    adminOnly: true,
    category: 'Overview'
  },

  // User Management
  {
    displayText: 'Users',
    href: '/admin/users',
    icon: 'Users',
    adminOnly: true,
    category: 'User Management'
  },
  {
    displayText: 'Pending Users',
    href: '/admin/pending-users',
    icon: 'UserCog',
    adminOnly: true,
    category: 'User Management'
  },
  {
    displayText: 'Applications',
    href: '/admin/applications',
    icon: 'ClipboardList',
    adminOnly: true,
    category: 'User Management',
    badge: 'pending'
  },

  // Program Management (NEW SECTION)
  {
    displayText: 'Programs',
    href: '/admin/programs',
    icon: 'GraduationCap',
    adminOnly: true,
    category: 'Program Management'
  },
  {
    displayText: 'Sessions',
    href: '/admin/sessions',
    icon: 'Calendar',
    adminOnly: true,
    category: 'Program Management'
  },

  // Content Management
  {
    displayText: 'Activities',
    href: '/admin/activities',
    icon: 'FileText',
    adminOnly: true,
    category: 'Content Management'
  },
  {
    displayText: 'Submissions',
    href: '/admin/submissions',
    icon: 'Send',
    adminOnly: true,
    category: 'Content Management',
    badge: 'pending'
  },
]
```

## Alternative: Mobile Navigation

For mobile/responsive view, consider:

**Dropdown Menu Approach**:
```
Admin Menu ▼
├─ Overview
│  └─ Dashboard
├─ Users
│  ├─ All Users
│  ├─ Pending Users
│  └─ Applications (12)
├─ Programs
│  ├─ Programs
│  └─ Sessions
└─ Content
   ├─ Activities
   └─ Submissions (5)
```

## Migration Notes

**Existing pages that need updating**:
- ✅ `/admin/programs` - Already created (E3-T8)
- ✅ `/admin/applications` - Already created (E3-T4)
- ⚠️ `/admin/sessions` - Needs to be created (session list page)
- ⚠️ `/admin/sessions/[id]/attendance` - Already exists but no parent route

**Required new pages**:
1. `/admin/sessions/page.tsx` - Session list view with:
   - All sessions across programs
   - Filter by program
   - Quick actions: View Attendance, Edit Session
   - Create new session button

## User Flow Examples

### Admin creates new program
1. Click "Programs" in sidebar
2. See programs list at `/admin/programs`
3. Click "Create Program" button
4. Fill program form
5. Save program

### Admin manages session attendance
1. Click "Sessions" in sidebar
2. See all sessions at `/admin/sessions`
3. Click "Mark Attendance" on specific session
4. Navigate to `/admin/sessions/[id]/attendance`
5. Mark attendance for enrolled users

### Admin reviews applications
1. See badge "Applications (12)" in sidebar
2. Click "Applications"
3. View applications queue at `/admin/applications`
4. Review and approve/reject

## Accessibility Considerations

- Use semantic HTML (`<nav>`, `<ul>`, `<li>`)
- Include ARIA labels for icons
- Ensure keyboard navigation works
- Add skip navigation link
- Maintain color contrast ratios (WCAG AA)

## Future Considerations

**When navigation grows beyond 15 items**:
- Implement collapsible sections (Option 1)
- Add navigation search
- Consider tabs for major sections
- Implement breadcrumbs for deep pages

**Analytics tracking**:
- Track most used admin features
- Monitor navigation patterns
- Optimize based on usage data
