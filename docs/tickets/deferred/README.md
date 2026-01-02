# Deferred Tickets

This directory contains tickets that have been deferred to future epics for strategic MVP simplification.

---

## Fully Deferred Tickets

These tickets were originally part of Epic 1 but moved to future epics:

### [E1-T5: Application System](./epic-1/E1-T5-application-system.md)

**Reason:** Quality control and admin review not essential for MVP validation
**Moved to:** Epic 2 (Quality & Growth)
**Dependencies:** Email service (Resend), CAPTCHA, admin middleware
**Reactivate when:** Spam profiles >10% or companies request vetting

### [E1-T6: Invitation System](./epic-1/E1-T6-invitation-system.md)

**Reason:** Viral growth mechanics premature before product-market fit
**Moved to:** Epic 2 (Quality & Growth)
**Dependencies:** E1-T5 (for approval flow integration)
**Reactivate when:** 200+ profiles or developers request referral feature

---

## Partial Implementation Tracking

Tickets that were completed for MVP but have specific features deferred:

### [E1-T4-partial: Profile Page - Deferred Features](./epic-1/E1-T4-partial-profile-page.md)

**Ticket Status:** ✅ MVP Complete (5/7 tasks)
**Deferred Features:**

- Report/abuse modal (community safety)
- Custom 404 page for non-existent profiles

**Rationale:** Core profile viewing and sharing functionality sufficient for MVP. Report feature is a community moderation tool better suited for post-launch when community norms are established.

---

## Reactivation Criteria

### E1-T5 (Application System)

- **Trigger 1:** Spam rate exceeds 10% of total profiles
- **Trigger 2:** Manual review burden exceeds 1 hour/day
- **Trigger 3:** Companies explicitly request developer vetting

**Effort:** ~40 hours (5 days)

### E1-T6 (Invitation System)

- **Trigger 1:** Organic growth stalls (<10 signups/week)
- **Trigger 2:** Developers request "invite friends" feature
- **Trigger 3:** Need for quality signaling (invited = vetted)

**Effort:** ~24 hours (3 days)

### E1-T4 Report Feature

- **Trigger 1:** First abuse/spam report received
- **Trigger 2:** Community size >100 profiles
- **Trigger 3:** Moderation workload requires tooling

**Effort:** ~8 hours (1 day)

---

## Migration Notes

When reactivating these tickets:

1. **Database Schema:** Already implemented - tables exist but unused:
   - `applications` table with status enum
   - `invitations` table with code generation
   - `users.accountStatus` supports 'pending' workflow

2. **Code Updates Needed:**
   - Modify onboarding to check application status
   - Add admin dashboard pages
   - Configure email service (Resend recommended)
   - Add CAPTCHA integration (hCaptcha or Cloudflare Turnstile)

3. **Infrastructure:**
   - Environment variables: `RESEND_API_KEY`, `CAPTCHA_SECRET_KEY`
   - Email templates in `src/emails/` (React Email)
   - Admin middleware for route protection

---

**Last Updated:** 2025-12-26
**Next Review:** After Epic 1 launch metrics collected (Week 2)
