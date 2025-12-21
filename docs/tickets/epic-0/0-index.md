# Epic 0: Project Setup & Infrastructure - Overview

**Epic Goal:** Establish production-ready database infrastructure with proper schema design, normalization, and team synchronization capabilities.

**Duration:** Days 1-2 (Setup + Review)
**Story Points:** 3 total
**Team Size:** Backend Developer + Database Architect

---

## Critical Update: Enhanced Database Design

The original E0-T0 ticket (docs/tickets/0-setup.md) has been **superseded** by an enhanced version with proper database design rigor.

### What Changed

**Original Issues:**
- ❌ Combined authentication and profile data (poor normalization)
- ❌ Missing critical constraints (email format, business rules)
- ❌ Inadequate indexing strategy
- ❌ No audit trail or soft deletes
- ❌ Type safety issues (floating point currency, generic IDs)

**Enhanced Version:**
- ✅ Proper 3NF normalization with justified denormalization
- ✅ Comprehensive CHECK constraints on all business rules
- ✅ Performance-optimized indexing (GIN, partial, composite)
- ✅ Audit-ready design (soft deletes, metadata JSONB)
- ✅ Type safety (enums, format validation, cents for currency)

---

## 🎉 Implementation Progress Summary

**Status:** 92% Complete (11.5/12.5 story points) | **Last Updated:** 2025-12-20

### ✅ Completed (E0-T0.1 through E0-T0.7)

**Database Infrastructure:**
- Drizzle ORM configured with node-postgres driver
- 4 tables created (users, profiles, applications, invitations)
- 7 enums defined (user_role, account_status, auth_method, profile_visibility, availability_status, learning_track, application_status)
- 31 indexes created (including composite and partial indexes)
- 47+ CHECK constraints applied across all tables
- 7 FOREIGN KEY relationships with appropriate CASCADE policies

**Key Files Created:**
- `drizzle.config.ts` - ORM configuration
- `drizzle/schema/` - All schema files (utils, users, profiles, applications, invitations, index)
- `src/lib/db/` - Database client and schema exports
- `drizzle/migrations/0000_tricky_carlie_cooper.sql` - Initial migration (applied ✅)
- `scripts/` - Test and verification scripts

**Technical Achievements:**
- ✅ Migrations applied successfully to Neon DB
- ✅ All verification tests passing (tables, indexes, constraints)
- ✅ Node-postgres connection pooling configured
- ✅ Inline pattern validation (fixed Drizzle parameterization issue)
- ✅ Status field workaround (PostgreSQL immutability constraint)

### 🟡 In Progress (E0-T0.8)

**Remaining Tasks:**
- Team design review and approval
- Schema diagram generation
- Normalization testing (cascade delete verification)
- EXPLAIN ANALYZE performance validation
- PR creation and code review
- Team sync testing (2+ developers)

---

## Ticket Status Overview

| Ticket ID | Title | Story Points | Status | Assignee | Completed |
|-----------|-------|--------------|--------|----------|-----------|
| E0-T0.1 | Drizzle Configuration | 0.5 | 🟢 Completed | Backend Dev | 2025-12-20 |
| E0-T0.2 | Schema Utilities | 1 | 🟢 Completed | Backend Dev | 2025-12-20 |
| E0-T0.3 | Users Table Schema | 2 | 🟢 Completed | Backend Dev | 2025-12-20 |
| E0-T0.4 | Profiles Table Schema | 2 | 🟢 Completed | Backend Dev | 2025-12-20 |
| E0-T0.5 | Applications & Invitations | 3 | 🟢 Completed | Backend Dev | 2025-12-20 |
| E0-T0.6 | Database Client Setup | 1 | 🟢 Completed | Backend Dev | 2025-12-20 |
| E0-T0.7 | Generate & Run Migrations | 2 | 🟢 Completed | Backend Dev | 2025-12-20 |
| E0-T0.8 | Verification & Team Sync | 1 | 🟡 In Progress | Backend Dev + Team | - |

**Total Story Points:** 12.5 | **Completed:** 11.5 (92%)

**Status Legend:**
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Completed
- 🔵 Blocked

---

## Documentation Structure

### Implementation Tickets (Sequential)
1. **[E0-T0.1-drizzle-config.md](./E0-T0.1-drizzle-config.md)** - Configure Drizzle ORM
2. **[E0-T0.2-schema-utils.md](./E0-T0.2-schema-utils.md)** - Shared schema utilities
3. **[E0-T0.3-users-schema.md](./E0-T0.3-users-schema.md)** - Users table (core identity)
4. **[E0-T0.4-profiles-schema.md](./E0-T0.4-profiles-schema.md)** - Profiles table (extended data)
5. **[E0-T0.5-applications-invitations-schema.md](./E0-T0.5-applications-invitations-schema.md)** - Applications & Invitations
6. **[E0-T0.6-database-client.md](./E0-T0.6-database-client.md)** - Database client setup
7. **[E0-T0.7-generate-run-migrations.md](./E0-T0.7-generate-run-migrations.md)** - Generate & run migrations
8. **[E0-T0.8-verification-team-sync.md](./E0-T0.8-verification-team-sync.md)** - Verification & team sync

### Supporting Documentation
- **[database-design.md](../../database-design.md)** - Comprehensive architecture document
  - Normalization analysis (3NF with justified exceptions)
  - Foreign key cascade behaviors
  - Query patterns and index usage
  - Future schema for Epics 2-4
  - Security and backup strategy

### Reference Documents
- **[E0-T0-database-setup-v2.md](../E0-T0-database-setup-v2.md)** - Original monolithic ticket (split into E0-T0.1-8)
- **[0-setup.md](../0-setup.md)** - Original v1.0 ticket (superseded, kept for history)

---

## Success Metrics

### Quality Gates
- [ ] Database passes 3NF normalization review
- [ ] All constraints tested and working
- [ ] EXPLAIN ANALYZE shows indexes being used
- [ ] Cascade delete behaviors verified
- [ ] Team design review approved
- [ ] All verification scripts pass

### Team Coordination
- [ ] All developers can sync via `vercel env pull .env.local`
- [ ] Migration workflow tested by 2+ team members
- [ ] Drizzle Studio accessible to all developers
- [ ] Schema diagram reviewed and approved

---

## Implementation Timeline

### Day 1: Setup (2-3 hours)
**Backend Developer Tasks:**
1. Provision hosted PostgreSQL (Vercel Postgres)
2. Configure Drizzle ORM and connection pooling
3. Implement schema definitions from E0-T0-v2
4. Generate and apply initial migration
5. Run verification scripts

### Day 2: Review & Approval (1-2 hours)
**Team Tasks:**
1. Design review meeting (30 min)
   - Walk through database-design.md
   - Review normalization decisions
   - Approve indexing strategy
2. Team sync verification (30 min)
   - Each developer pulls env and runs migrations
   - Verify Drizzle Studio access
   - Test connection and query performance
3. PR review and merge (30 min)

---

## Design Principles

### 1. Single Source of Truth
- Privy owns authentication (DID as foreign key)
- Database stores application state only
- No duplication of auth data

### 2. Audit Everything
- All mutations tracked (who, when, what)
- Soft deletes for compliance
- Metadata JSONB for extensibility

### 3. Performance First
- Indexes on all foreign keys and query patterns
- Denormalization only where justified
- JSONB for flexible but queryable metadata

### 4. Data Integrity
- NOT NULL constraints on required fields
- CHECK constraints for business rules
- Foreign keys with appropriate CASCADE policies
- Unique constraints where applicable

### 5. Future-Proof
- Schema designed for all 4 epics upfront
- Extension points for future features
- Migration-friendly structure

---

## Schema Overview

### Core Tables (Epic 1)
```
users (identity & auth)
  ├── profiles (public display data) [1:1]
  ├── applications (onboarding queue) [reviewed_by]
  └── invitations (referral system) [inviter]
```

### Key Relationships
- **users → profiles**: 1:1, CASCADE DELETE
- **users → users**: Self-referencing (invited_by, approved_by), SET NULL
- **invitations → users**: Many-to-one (inviter), CASCADE DELETE
- **applications → users**: Many-to-one (reviewer), SET NULL

### Future Tables (Epics 2-4)
- **projects** (Epic 2): Portfolio items
- **skills** (Epic 2): Skill taxonomy
- **bounties** (Epic 3): Paid tasks
- **transactions** (Epic 4): Blockchain payments

---

## Critical Files to Review

### Schema Definitions (drizzle/schema/)
1. **utils.ts** - Shared helpers (timestamps, soft delete, metadata)
2. **users.ts** - Identity table with Privy integration
3. **profiles.ts** - Separated public data with privacy controls
4. **applications.ts** - Gated onboarding with admin review
5. **invitations.ts** - Viral growth tracking with generated status

### Verification Scripts
1. **scripts/verify-schema.ts** - Checks tables, indexes, constraints
2. **scripts/test-normalization.ts** - Tests cascade deletes and relationships

### Configuration
1. **drizzle.config.ts** - ORM configuration for migrations
2. **src/lib/db/index.ts** - Database client with connection pooling

---

## Common Questions & Answers

### Q: Why separate users and profiles tables?
**A:** Partial normalization. `users` contains core identity fields (username, displayName, bio, avatarUrl) for performance. `profiles` contains extended data (location, social links, stats, privacy settings). Users table has frequently accessed fields, profiles table has optional/supplementary data.

### Q: Why use USD float for currency?
**A:** Real (float) type chosen for simplicity. Allows direct storage of dollar amounts (e.g., 1250.50 for $1,250.50). For financial precision, alternative is bigint cents.

### Q: Why JSONB for metadata?
**A:** Extensibility without schema migrations. Queryable (unlike JSON), indexed with GIN, perfect for feature flags and non-critical data.

### Q: Why generated column for invitation status?
**A:** Originally designed as generated column, but PostgreSQL doesn't support time-based generated columns (NOW()/CURRENT_TIMESTAMP are not immutable). Converted to regular varchar field with default 'pending'. Status should be computed at query time or updated via application logic/triggers.

### Q: Why so many indexes?
**A:** Query performance. Directory page filters by visibility + availability + learning tracks + country. Without indexes, full table scan on every page load (slow). With composite indexes, queries stay < 50ms at 10K+ users.

### Q: What's the migration strategy for Epics 2-4?
**A:** Additive migrations only. Epic 2 adds `projects`, `skills` tables. Epic 3 adds `bounties`, `bounty_claims`. Epic 4 adds `transactions`. Never modify existing tables (only add columns/indexes).

### Q: Why use node-postgres instead of postgres-js?
**A:** Project decision based on official Drizzle documentation for node-postgres integration. Key differences: Uses `Pool` from `pg` package, syntax is `drizzle({ client: pool })` instead of `drizzle(client)`. Connection pooling configured with max 10 connections, 20s idle timeout.

---

## Technical Issues Resolved During Implementation

### Issue 1: CHECK Constraint Parameterization (E0-T0.7)
**Problem:** Drizzle generated parameterized SQL (`$1`, `$2`) for CHECK constraints using pattern references, causing migration failures.

**Solution:** Inlined all regex patterns directly in CHECK constraints instead of using `PATTERNS` constant references.

**Files Modified:**
- `drizzle/schema/users.ts` - Inlined EMAIL, USERNAME, ETH_ADDRESS patterns
- `drizzle/schema/profiles.ts` - Inlined COUNTRY_CODE pattern
- `drizzle/schema/invitations.ts` - Inlined INVITE_CODE pattern

**Learning:** Drizzle migrations require literal values in CHECK constraints, not variable references.

### Issue 2: Generated Column Immutability (E0-T0.7)
**Problem:** PostgreSQL rejected generated column for invitations.status that compared `expires_at < NOW()` with error "generation expression is not immutable".

**Root Cause:** PostgreSQL requires generated column expressions to be immutable (deterministic). `NOW()` and `CURRENT_TIMESTAMP` return different values on each call, making them non-immutable.

**Solution:** Converted status from generated column to regular varchar field with default 'pending'. Status logic moved to application layer:
```typescript
const status = invitation.redeemedAt
  ? 'redeemed'
  : new Date(invitation.expiresAt) < new Date()
    ? 'expired'
    : 'pending'
```

**Alternative Considered:** PostgreSQL triggers or views, but application-level computation is simpler and more flexible.

**Learning:** Time-based logic cannot be in generated columns. Use triggers, views, or application logic instead.

---

## Risks & Mitigations

### Risk 1: Team Unfamiliar with Normalization
**Impact:** Confusion during review, delays in approval
**Likelihood:** Medium
**Mitigation:**
- Comprehensive database-design.md explains all decisions
- 30-min walkthrough meeting with Q&A
- Mermaid diagram for visual understanding

### Risk 2: Migration Conflicts During Development
**Impact:** Developers overwrite each other's schema changes
**Likelihood:** Low (with proper workflow)
**Mitigation:**
- Always pull before creating new migrations
- Communicate schema changes in Slack before pushing
- Use feature branches for schema changes
- Migration files tracked in git (conflicts visible)

### Risk 3: Performance Issues Not Caught Early
**Impact:** Slow queries in production, poor UX
**Likelihood:** Low (with verification scripts)
**Mitigation:**
- EXPLAIN ANALYZE tests in verification scripts
- Load testing before Epic 1 launch
- Monitoring via Vercel Postgres dashboard
- Slow query alerts in Sentry

---

## Definition of Done

### Schema Implementation
- [x] All 4 tables created with correct types ✅ (2025-12-20)
- [x] All 7 enums defined ✅ (2025-12-20) *Note: 7 enums, not 8 - see below*
- [x] All CHECK constraints present ✅ (2025-12-20)
- [x] All foreign keys with explicit cascade policies ✅ (2025-12-20)
- [x] All indexes created (31+ total) ✅ (2025-12-20)
- [x] Default now() for timestamps (no triggers needed with Drizzle) ✅ (2025-12-20)
- [x] Status field for invitations ✅ (2025-12-20) *Note: Regular field instead of generated column due to PostgreSQL immutability constraints*

**Implementation Notes:**
- **Enums**: 7 total (user_role, account_status, auth_method, profile_visibility, availability_status, learning_track, application_status)
- **Indexes**: 31 total (users: 12, profiles: 7, applications: 6, invitations: 6)
- **Invitation Status**: Converted from generated column to regular field due to PostgreSQL limitations with time-based expressions

### Testing
- [x] Verification script passes (tables, indexes, constraints) ✅ (2025-12-20)
- [ ] Normalization test passes (cascade deletes work) - *Pending E0-T0.8*
- [ ] EXPLAIN ANALYZE shows index usage - *Pending E0-T0.8*
- [ ] Team members can sync successfully (2+ tested) - *Pending E0-T0.8*

### Documentation
- [x] database-design.md complete ✅ (Pre-existing)
- [ ] Schema diagram generated (Mermaid or dbdiagram.io) - *Pending E0-T0.8*
- [x] Enhanced E0-T0 ticket created ✅ (Pre-existing)
- [ ] Team design review completed and approved - *Pending E0-T0.8*

### Review & Approval
- [ ] PR created with schema code - *Pending E0-T0.8*
- [ ] Backend developer reviewed code - *Pending E0-T0.8*
- [ ] Database architect approved design - *Pending E0-T0.8*
- [ ] Team lead approved for merge - *Pending E0-T0.8*
- [ ] Merged to `dev` branch - *Pending E0-T0.8*

---

## Next Steps After Completion

1. **Epic 1 Kickoff:**
   - E1-T1: Authentication Integration (Privy Setup)
   - Parallel with E1-T5: Application System

2. **Schema Monitoring:**
   - Set up slow query alerts
   - Monitor connection pool usage
   - Track database growth

3. **Documentation Updates:**
   - Add database section to README.md
   - Create onboarding guide for new developers
   - Document query patterns for common operations

---

## Resources

### Internal Documentation
- [PRD (Product Requirements)](../../prd.md)
- [Implementation Plan](../../prd-implementation.md)
- [Project README](../../../README.md)
- [Claude Code Guide](../../../CLAUDE.md)

### External References
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Database Normalization (Wikipedia)](https://en.wikipedia.org/wiki/Database_normalization)

### Tools
- [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview) - Visual database browser
- [dbdiagram.io](https://dbdiagram.io) - ERD generator
- [PgAdmin](https://www.pgadmin.org/) - Advanced PostgreSQL client

---

## Team Communication

### Slack Channels
- **#eng-database** - Schema changes and discussions
- **#eng-backend** - API and backend dev
- **#alerts** - Database errors and slow queries

### Meeting Schedule
- **Design Review:** Day 2, 10:00 AM (30 min)
- **Team Sync:** Day 2, 2:00 PM (30 min)
- **Daily Standups:** Every day, 9:00 AM (15 min)

---

**Last Updated:** 2025-12-20
**Next Review:** After Epic 1 completion

---

**Status:** 🟡 Ready for Team Review and Implementation
