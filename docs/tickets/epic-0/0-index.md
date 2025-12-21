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

## Ticket Status Overview

| Ticket ID | Title | Story Points | Status | Assignee | Dependencies |
|-----------|-------|--------------|--------|----------|--------------|
| E0-T0.1 | Drizzle Configuration | 0.5 | 🟡 Ready | Backend Dev | None |
| E0-T0.2 | Schema Utilities | 1 | 🟡 Ready | Backend Dev | E0-T0.1 |
| E0-T0.3 | Users Table Schema | 2 | 🟡 Ready | Backend Dev | E0-T0.2 |
| E0-T0.4 | Profiles Table Schema | 2 | 🟡 Ready | Backend Dev | E0-T0.3 |
| E0-T0.5 | Applications & Invitations | 3 | 🟡 Ready | Backend Dev | E0-T0.3 |
| E0-T0.6 | Database Client Setup | 1 | 🟡 Ready | Backend Dev | E0-T0.2-5 |
| E0-T0.7 | Generate & Run Migrations | 2 | 🟡 Ready | Backend Dev | E0-T0.6 |
| E0-T0.8 | Verification & Team Sync | 1 | 🟡 Ready | Backend Dev + Team | E0-T0.7 |

**Total Story Points:** 12.5

**Status Legend:**
- 🔴 Not Started
- 🟡 Ready for Implementation
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
**A:** PostgreSQL computes it automatically based on `redeemed_at` and `expires_at`. No manual updates, always accurate, can be indexed.

### Q: Why so many indexes?
**A:** Query performance. Directory page filters by visibility + availability + learning tracks + country. Without indexes, full table scan on every page load (slow). With composite indexes, queries stay < 50ms at 10K+ users.

### Q: What's the migration strategy for Epics 2-4?
**A:** Additive migrations only. Epic 2 adds `projects`, `skills` tables. Epic 3 adds `bounties`, `bounty_claims`. Epic 4 adds `transactions`. Never modify existing tables (only add columns/indexes).

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
- [x] All 4 tables created with correct types
- [x] All 8 enums defined
- [x] All CHECK constraints present
- [x] All foreign keys with explicit cascade policies
- [x] All indexes created (24+ total)
- [x] Triggers for updated_at timestamps
- [x] Generated column for invitation status

### Testing
- [ ] Verification script passes (tables, indexes, constraints)
- [ ] Normalization test passes (cascade deletes work)
- [ ] EXPLAIN ANALYZE shows index usage
- [ ] Team members can sync successfully (2+ tested)

### Documentation
- [x] database-design.md complete
- [ ] Schema diagram generated (Mermaid or dbdiagram.io)
- [x] Enhanced E0-T0 ticket created
- [ ] Team design review completed and approved

### Review & Approval
- [ ] PR created with schema code
- [ ] Backend developer reviewed code
- [ ] Database architect approved design
- [ ] Team lead approved for merge
- [ ] Merged to `dev` branch

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
