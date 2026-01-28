# Epic 3: Program Management System

> **Status**: 🎯 Planning
> **Priority**: 🔴 Critical
> **Timeline**: 4 weeks
> **Effort**: XL

## Overview

Transform Frutero's onboarding into a program-based application system where users apply to specific learning programs (De Cero a Chamba, DeFi-esta, Open), commit to measurable 1-month goals, and earn "Club Guest" status while awaiting approval.

## Epic Scope

📋 **[EPIC-3-SCOPE.md](./EPIC-3-SCOPE.md)** - Complete MVP scope document

**Key Features:**
- Application-based onboarding with admin review
- Program selection during signup (3 programs)
- Goal commitment (1-280 characters)
- Club Guest status for platform access before approval
- Social account linking (GitHub, Twitter)
- Attendance tracking (admin-marked)
- Progress monitoring within programs

**Explicitly Out of Scope (MVP):**
- POAP integration
- LinkedIn/Telegram linking
- Program switching
- Automated approvals
- Multi-program participation
- Self-serve attendance

## Implementation Tickets

### Phase 1: Foundation (Week 1-2)
- **[E3-T1](./E3-T1-database-schema-setup.md)**: Database Schema Setup
- **[E3-T2](./E3-T2-onboarding-flow-updates.md)**: Onboarding Flow Updates
- **[E3-T3](./E3-T3-club-guest-implementation.md)**: Club Guest Implementation

### Phase 2: Admin Features (Week 3)
- **[E3-T4](./E3-T4-admin-applications-queue.md)**: Admin Applications Queue
- **[E3-T5](./E3-T5-admin-attendance-management.md)**: Admin Attendance Management

### Phase 3: User Experience (Week 4)
- **[E3-T6](./E3-T6-program-dashboard.md)**: Program Dashboard
- **[E3-T7](./E3-T7-testing-documentation.md)**: Testing & Documentation

## Database Schema

### New Tables
- `programs` - Learning program definitions
- `program_activities` - Junction table linking programs to activities
- `program_enrollments` - User enrollment in programs
- `attendance_records` - Session attendance tracking

### Extended Tables
- `applications` - Added program_id, goal, github_username, twitter_username

### Account Status Flow
```
incomplete → pending → guest (Club Guest) → active (Full Member)
```

**Key Distinction:**
- **Pending**: Application submitted, no platform access, awaiting admin review
- **Guest**: Approved for platform access, building participation history
- **Active/Member**: Promoted based on consistent participation and progress

**Admin Flexibility:**
- New users → typically approved as Guest first
- Returning users with history → can be fast-tracked to Member

## Key User Journeys

### 1. New User Application (Guest Path)
```
Login → Profile Setup → Choose Program → Set Goal → Link Socials → Submit
→ Admin Review → Approved as Guest → Club Guest Access
→ Build Progress (attend + submit) → Admin Promotion → Full Member
```

### 2. Fast-Track Application (Member Path)
```
Login → Profile Setup → Apply
→ Admin Reviews History → Approved as Member → Immediate Full Access
```

### 3. Guest Experience
```
Browse Directory → View Activities → Submit to Bounties → Attend Sessions
→ Build Participation History → Await Promotion
```

### 4. Active Member Participation
```
View Program Dashboard → Attend Sessions → Admin Marks Attendance
→ Complete Activities → Track Progress → Earn Benefits
```

## API Endpoints Summary

### User-Facing
- `PATCH /api/users/update` - Extended with program, goal, social accounts
- `GET /api/applications/me` - Get application status
- `GET /api/programs` - List active programs
- `GET /api/programs/:id` - Program details with activities
- `GET /api/users/:id/attendance` - Attendance history

### Admin-Only
- `GET /api/admin/applications` - Pending applications queue
- `PATCH /api/admin/applications/:id` - Review application (approve as guest/member, or reject)
- `PATCH /api/admin/users/:id/promote` - Promote guest to member
- `POST /api/admin/programs` - Create new program
- `PATCH /api/admin/programs/:id` - Update program
- `DELETE /api/admin/programs/:id` - Delete program
- `POST /api/admin/programs/:id/activities` - Link activity to program
- `PATCH /api/admin/programs/:programId/activities/:activityId` - Update program-activity relationship
- `DELETE /api/admin/programs/:programId/activities/:activityId` - Unlink activity from program
- `POST /api/admin/attendance` - Mark attendance
- `GET /api/admin/attendance/:activityId` - Session attendance list

## Success Metrics

### Application Funnel
- Application start rate
- Application completion rate
- Application approval rate
- Time to review

### Program Engagement
- Program enrollment distribution
- Activity completion rate by program
- Attendance rate by program
- Goal achievement rate

### Platform Health
- Club Guest retention
- Directory listing quality
- Bounty submission rate (guests vs active)

## Dependencies

### Prerequisites
- ✅ Existing users table with accountStatus field
- ✅ Existing activities and submissions tables
- ✅ Authentication via Privy
- ✅ Admin role permissions system

### Blockers
- None - can start immediately

### Related Epics
- **E2: Admin Dashboard** - Prerequisite for admin features
- **E4: Bounty System** - Benefits from program context

## Resources

### Documentation
- [Program Management Feature Spec](../../features/program-management.md) (to be created)
- [Database Schema Diagrams](../../database/schema.md)
- [API v1 Specification](../../specs/api-v1.md)

### Design Documents
- [Program Discovery Questions](../../design/program-discovery-questions.md)

## Timeline

**Week 1-2**: Foundation (E3-T1, E3-T2, E3-T3)
**Week 3**: Admin Features (E3-T4, E3-T5)
**Week 4**: User Experience & Testing (E3-T6, E3-T7)

**Target Completion**: End of Week 4
**Target Release**: MVP v1.0

## Next Steps

1. Review and approve this scope document
2. Create individual ticket files (E3-T1 through E3-T7)
3. Assign tickets to developers
4. Begin Phase 1: Database Schema Setup
5. Set up staging environment for testing

---

**Last Updated**: 2026-01-05
**Epic Owner**: TBD
**Status**: Awaiting approval to begin implementation
