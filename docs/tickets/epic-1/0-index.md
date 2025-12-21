# Epic 1: Talent Directory - Ticket Status

**Epic Goal:** Launch a simple, non-intimidating talent directory where builders can create profiles and be discovered.

**Duration:** Week 1 (7 days)
**Story Points:** 29 total
**Team Size:** 3 developers

---

## Success Metrics
- [ ] 100 approved profiles within 2 weeks of launch
- [ ] < 3-minute average profile creation time
- [ ] < 5% spam/low-quality applications
- [ ] 30% of signups via referrals

---

## Ticket Status Overview

| Ticket ID | Title | Story Points | Status | Assignee | Dependencies |
|-----------|-------|--------------|--------|----------|--------------|
| E1-T1 | Authentication Integration (Privy Setup) | 5 | 🔴 Not Started | Full-stack Dev | E0-T0 |
| E1-T2 | Profile Creation Flow | 5 | 🔴 Not Started | Frontend Dev | E1-T1 |
| E1-T3 | Public Directory Page | 5 | 🔴 Not Started | Frontend Dev | E1-T2 |
| E1-T4 | Individual Profile Page | 3 | 🔴 Not Started | Frontend Dev | E1-T2 |
| E1-T5 | Application System | 5 | 🔴 Not Started | Full-stack Dev | E0-T0 |
| E1-T6 | Invitation System | 3 | 🔴 Not Started | Backend Dev | E1-T1, E1-T5 |

**Status Legend:**
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Completed
- 🔵 Blocked

---

## Work Streams (Parallelization)

### Days 1-2: Infrastructure Setup
- **E0-T0:** Database Setup (prerequisite)

### Days 3-4: Core Systems
- **Stream A:** E1-T1 (Auth Integration)
- **Stream B:** E1-T5 (Application System)

### Days 5-6: User-Facing Features
- **Stream A:** E1-T2 (Profile Form)
- **Stream B:** E1-T3 (Directory Page)

### Day 7: Polish & Launch Prep
- **Stream A:** E1-T4 (Profile Page)
- **Stream B:** E1-T6 (Invitations)
- **Testing & Deployment**

---

## Ticket Files

- [E1-T1: Authentication Integration](./E1-T1-auth-integration.md)
- [E1-T2: Profile Creation Flow](./E1-T2-profile-creation.md)
- [E1-T3: Public Directory Page](./E1-T3-directory-page.md)
- [E1-T4: Individual Profile Page](./E1-T4-profile-page.md)
- [E1-T5: Application System](./E1-T5-application-system.md)
- [E1-T6: Invitation System](./E1-T6-invitation-system.md)

---

## Definition of Done (All Tickets)

- [ ] All acceptance criteria met
- [ ] Code reviewed by peer
- [ ] Manual testing completed
- [ ] Deployed to staging environment
- [ ] Product team sign-off

---

## Notes & Blockers

_Use this section to track impediments, questions, or coordination needs._

### Current Blockers
- None

### Questions
- None

### Decisions Made
- None

---

**Last Updated:** 2025-12-20
**Next Review:** After each ticket completion
