# Documentation Guide

Quick reference for creating and maintaining Poktapok documentation.

## 📂 Directory Structure

```
docs/
├── README.md                    # Documentation index
├── DOCUMENTATION_GUIDE.md       # This file
│
├── product/                     # Product documentation
│   ├── prd.md                  # Product Requirements Document
│   ├── prd-implementation.md   # Implementation tracking
│   └── database-design.md      # Database architecture
│
├── tickets/                     # Implementation tickets
│   ├── TICKET_TEMPLATE.md      # New ticket template
│   ├── epic-0/                 # Database foundation
│   ├── epic-1/                 # Core user features
│   ├── epic-2/                 # Portfolio & projects
│   └── deferred/               # Postponed features
│
├── features/                    # Feature specifications
│   ├── README.md               # Features index
│   ├── FEATURE_TEMPLATE.md     # New feature template
│   └── avatar-upload.md        # Example: Avatar upload spec
│
├── specs/                       # Complex system specifications
│   ├── README.md               # Specifications index
│   ├── pulpa-workshop-system-spec.md
│   └── pulpa-implementation-complete.md
│
├── design/                      # UI/UX documentation
│   ├── README.md               # Design index
│   ├── admin-dashboard.md
│   └── users-management.md
│
├── workflows/                   # Process documentation
│   ├── README.md               # Workflows index
│   └── users-management.md
│
├── dev/                         # Developer guides
│   ├── database-setup.md
│   └── privy/                  # Third-party integrations
│
└── database/                    # Database documentation
    ├── README.md               # Database index
    ├── migrations.md
    └── migration-quick-reference.md
```

## 🎯 When to Use Each Documentation Type

### Product Documentation (`product/`)
**Use for**: Strategic documents, product vision, high-level architecture
**Audience**: Product managers, stakeholders, executives
**Examples**: PRD, roadmap, business requirements

### Tickets (`tickets/`)
**Use for**: Implementation tracking, sprint work, task management
**Audience**: Developers, project managers
**Examples**: Feature tickets, bug fixes, technical debt
**Template**: `TICKET_TEMPLATE.md`

### Feature Specifications (`features/`)
**Use for**: Individual feature documentation with technical details
**Audience**: Developers, technical writers
**Examples**: Avatar upload, authentication, profile management
**Template**: `FEATURE_TEMPLATE.md`
**When**: Single self-contained feature, 1-2 sprint implementation

### System Specifications (`specs/`)
**Use for**: Complex multi-feature systems spanning multiple epics
**Audience**: Architects, senior developers, product managers
**Examples**: Workshop system, payment processing, notification system
**When**: Multi-epic project, complex integrations, long-term implementation

### Design Documents (`design/`)
**Use for**: UI/UX specifications, design systems, visual guidelines
**Audience**: Designers, frontend developers
**Examples**: Dashboard design, component library, responsive layouts

### Workflows (`workflows/`)
**Use for**: Process documentation, operational procedures, multi-actor flows
**Audience**: All team members, operations, support
**Examples**: User onboarding, approval workflows, admin processes

### Developer Guides (`dev/`)
**Use for**: Setup instructions, technical how-tos, integration guides
**Audience**: Developers (new and existing)
**Examples**: Database setup, API integration, deployment

### Database Documentation (`database/`)
**Use for**: Database-specific guides, migration procedures, schema reference
**Audience**: Backend developers, DBAs
**Examples**: Migration workflow, connection setup, query patterns

## ✍️ Creating New Documentation

### Step 1: Choose Document Type

Ask yourself:
1. **Is this a single feature?** → `features/` (use FEATURE_TEMPLATE.md)
2. **Is this a complex multi-feature system?** → `specs/`
3. **Is this a task to implement?** → `tickets/` (use TICKET_TEMPLATE.md)
4. **Is this UI/UX focused?** → `design/`
5. **Is this a process or workflow?** → `workflows/`
6. **Is this a setup guide?** → `dev/`
7. **Is this database-specific?** → `database/`
8. **Is this product strategy?** → `product/`

### Step 2: Use Template

```bash
# For features
cp docs/features/FEATURE_TEMPLATE.md docs/features/your-feature-name.md

# For tickets
cp docs/tickets/TICKET_TEMPLATE.md docs/tickets/epic-X/EX-TY-task-name.md
```

### Step 3: Fill Out Sections

- Replace placeholder text
- Delete irrelevant sections
- Add specific implementation details
- Include code examples
- Add cross-references

### Step 4: Update Indexes

- Add link to appropriate README.md
- Update docs/README.md if needed
- Cross-reference related documents

## 📝 Documentation Standards

### File Naming

```bash
# Features
features/feature-name.md           ✅ Good
features/FeatureName.md            ❌ Bad (PascalCase)
features/feature_name.md           ❌ Bad (snake_case)

# Tickets
tickets/epic-1/E1-T1-auth.md       ✅ Good
tickets/epic-1/auth-feature.md     ❌ Bad (no epic/task prefix)

# Design
design/admin-dashboard.md          ✅ Good
design/AdminDashboard.md           ❌ Bad (PascalCase)

# Workflows
workflows/user-onboarding.md       ✅ Good
workflows/process-1.md             ❌ Bad (non-descriptive)
```

### Content Structure

**Every document should have:**
1. **Title** - Clear, descriptive heading
2. **Overview** - Brief 1-2 sentence description
3. **Status** - Current implementation status (🎯 Planned, 🚧 In Progress, ✅ Complete)
4. **Body** - Structured content with headings
5. **Cross-references** - Links to related docs
6. **Last Updated** - Date of last modification

### Writing Style

**Do:**
- Use clear, concise language
- Include code examples
- Provide context and rationale
- Cross-reference related documentation
- Keep content up-to-date
- Use consistent terminology

**Don't:**
- Assume prior knowledge
- Use jargon without explanation
- Include outdated information
- Duplicate content across documents
- Mix documentation types

### Markdown Conventions

```markdown
# H1 - Document title (one per document)
## H2 - Major sections
### H3 - Subsections
#### H4 - Details

**Bold** - Emphasis, labels
*Italic* - Subtle emphasis
`code` - Inline code, commands
```code block``` - Code examples

> Blockquote - Important notes

- Bullet lists - Unordered items
1. Numbered lists - Sequential steps

[Link text](url) - Hyperlinks
![Alt text](image-url) - Images

| Column 1 | Column 2 | - Tables
|----------|----------|

---

Horizontal rule - Section dividers
```

## 🔄 Maintaining Documentation

### When Code Changes

1. **Feature Changes**:
   - Update corresponding feature spec
   - Update affected tickets
   - Update related workflows

2. **API Changes**:
   - Update API documentation in feature specs
   - Update integration guides
   - Update example code

3. **Database Changes**:
   - Update database documentation
   - Document migration steps
   - Update schema diagrams

### Regular Maintenance

**Monthly**:
- Review all documentation for accuracy
- Archive outdated documents
- Update status indicators
- Fix broken cross-references

**Per Sprint**:
- Close completed tickets
- Update implementation tracking
- Create new tickets for next sprint
- Review and refine feature specs

**Per Release**:
- Update PRD implementation status
- Archive deprecated features
- Create release notes
- Update setup guides if needed

## 🔍 Finding Documentation

### Search Strategies

**By Feature Name**:
```bash
# Search all docs
grep -r "feature name" docs/

# Search specific type
grep -r "feature name" docs/features/
```

**By Epic/Ticket**:
```bash
# Find epic tickets
ls docs/tickets/epic-1/

# Search epic content
grep -r "search term" docs/tickets/epic-1/
```

**By Type**:
```bash
# List all features
ls docs/features/

# List all specs
ls docs/specs/
```

### Quick Links

- **Setup**: [docs/dev/database-setup.md](./dev/database-setup.md)
- **PRD**: [docs/product/prd.md](./product/prd.md)
- **Features**: [docs/features/](./features/)
- **Tickets**: [docs/tickets/](./tickets/)

## 📊 Documentation Checklist

### New Feature Implementation

- [ ] Create feature ticket from template
- [ ] Document feature specification
- [ ] Update PRD implementation tracking
- [ ] Create or update design docs
- [ ] Document workflows (if applicable)
- [ ] Update developer guides (if needed)
- [ ] Document database changes
- [ ] Add usage examples
- [ ] Cross-reference related docs
- [ ] Update README indexes

### Code Review

- [ ] Verify documentation is updated
- [ ] Check code examples are accurate
- [ ] Validate cross-references work
- [ ] Confirm API docs match implementation
- [ ] Review for completeness

### Release

- [ ] Update all affected documentation
- [ ] Archive deprecated features
- [ ] Update version numbers
- [ ] Create release notes
- [ ] Verify setup guides current

## 🤝 Collaboration

### Documentation Reviews

**Before Committing**:
- Self-review for clarity and completeness
- Check spelling and grammar
- Validate code examples
- Test cross-references

**Pull Request**:
- Include documentation changes
- Highlight significant updates
- Request review from relevant team members

### Feedback

- Use PR comments for documentation feedback
- Create tickets for documentation improvements
- Update based on team input

## 📖 Best Practices

1. **Write as You Code**: Document while implementing, not after
2. **Keep It Current**: Update docs when code changes
3. **Be Consistent**: Follow templates and conventions
4. **Be Helpful**: Write for future developers (including yourself)
5. **Cross-Reference**: Link related documentation
6. **Use Examples**: Show, don't just tell
7. **Stay Organized**: Use correct directories and naming
8. **Review Regularly**: Check and update documentation periodically

---

**Questions about documentation?** Check the main [docs/README.md](./README.md) or create a ticket with questions.
