# Poktapok Documentation

> Comprehensive documentation for the Poktapok talent platform

## 📚 Documentation Structure

### 🎯 [Product Documentation](./product/)
Product requirements, specifications, and design documents
- **[PRD (Product Requirements Document)](./product/prd.md)** - Core product vision and requirements
- **[PRD Implementation Status](./product/prd-implementation.md)** - Implementation tracking and progress
- **[Database Design](./product/database-design.md)** - Database architecture and schema design

### 🎫 [Tickets & Tasks](./tickets/)
Feature tickets organized by epic with implementation tracking
- **[Epic 0: Database Foundation](./tickets/epic-0/)** - Database setup, schema, and migrations
- **[Epic 1: Core User Features](./tickets/epic-1/)** - Authentication, profiles, directory
- **[Epic 2: Portfolio & Projects](./tickets/epic-2/)** - Project CRUD, portfolio builder, skills management
- **[Deferred Tickets](./tickets/deferred/)** - Features postponed for future iterations

### ✨ [Features](./features/)
Feature specifications and technical documentation
- **[Avatar Upload](./features/avatar-upload.md)** - Avatar upload system with Vercel Blob Storage

### 🔧 [Developer Guides](./dev/)
Technical guides and development resources
- **[Database Setup](./dev/database-setup.md)** - Complete database setup and configuration guide
- **[API Reference](./dev/api-reference.md)** - Complete API endpoint documentation
- **[Testing Guide](./dev/testing-guide.md)** - Testing strategies and implementation guide
- **[Privy Integration](./dev/privy/)** - Privy authentication setup and configuration

### 🎨 [Design Documents](./design/)
UI/UX specifications and design systems
- **[Admin Dashboard](./design/admin-dashboard.md)** - Admin dashboard design and workflows
- **[Users Management](./design/users-management.md)** - User management UI and workflows
- **[Landing Page V2 Update](./design/landing-page-v2-update.md)** - Landing page version 2 design specifications

### 🔄 [Workflows](./workflows/)
Process documentation and operational workflows
- **[Users Management Workflow](./workflows/users-management.md)** - Complete user lifecycle management

### 📋 [Specifications](./specs/)
Detailed technical specifications for complex features
- **[Pulpa Workshop System](./specs/pulpa-workshop-system-spec.md)** - Workshop and activity system specification
- **[Pulpa Implementation](./specs/pulpa-implementation-complete.md)** - Complete implementation details
- **[Epic 4: Program System](./specs/epic-4-program-system.md)** - Programs, sessions, and activities relationships

### 🗄️ [Database](./database/)
Database-specific documentation
- **[Migrations Guide](./database/migrations.md)** - Database migration workflows and best practices
- **[Migration Quick Reference](./database/migration-quick-reference.md)** - Quick commands and patterns
- **[Migration Troubleshooting](./database/migration-troubleshooting.md)** - Emergency procedures and fixes

## 🚀 Quick Start

### For Product Managers
1. Start with **[PRD](./product/prd.md)** to understand product vision
2. Review **[PRD Implementation Status](./product/prd-implementation.md)** for current progress
3. Check **[Tickets](./tickets/)** for feature tracking and prioritization

### For Developers
1. Review **[Database Setup](./dev/database-setup.md)** for local environment configuration
2. Check **[Features](./features/)** for implementation specifications
3. Refer to **[Tickets](./tickets/)** for current sprint work

### For Designers
1. Review **[Design Documents](./design/)** for UI/UX specifications
2. Check **[Workflows](./workflows/)** for user flow documentation
3. Refer to **[Specifications](./specs/)** for detailed feature requirements

## 📝 Documentation Standards

### File Naming Conventions
- Use **kebab-case** for all file names: `feature-name.md`
- Prefix tickets with epic and number: `E1-T1-feature-name.md`
- Use descriptive names that indicate content: `avatar-upload.md` not `feature1.md`

### Directory Structure Guidelines
- **product/** - High-level product documentation (PRD, strategy)
- **tickets/** - Implementation tickets organized by epic
- **features/** - Feature specifications (one per feature)
- **dev/** - Developer setup and technical guides
- **design/** - UI/UX specifications and design systems
- **workflows/** - Process documentation and operational guides
- **specs/** - Detailed technical specifications for complex systems
- **database/** - Database-specific documentation

### Documentation Types

#### 1. Feature Specifications (`features/`)
- **Purpose**: Document individual features with implementation details
- **Template**: Feature name, overview, technical implementation, API endpoints, usage examples
- **Example**: `features/avatar-upload.md`

#### 2. Tickets (`tickets/`)
- **Purpose**: Track implementation work organized by epics
- **Template**: Epic number, task number, description, acceptance criteria, implementation notes
- **Example**: `tickets/epic-1/E1-T1-auth-integration.md`

#### 3. Specifications (`specs/`)
- **Purpose**: Detailed technical specifications for complex multi-feature systems
- **Template**: System overview, architecture, data models, workflows, integration points
- **Example**: `specs/pulpa-workshop-system.md`

#### 4. Design Documents (`design/`)
- **Purpose**: UI/UX specifications with visual mockups and interaction patterns
- **Template**: Component designs, user flows, accessibility requirements
- **Example**: `design/admin-dashboard.md`

## 🔄 Maintenance

### Adding New Documentation
1. Determine the appropriate directory based on content type
2. Follow naming conventions (kebab-case)
3. Use existing documents as templates
4. Update this README with links to new documentation

### Updating Existing Documentation
1. Keep documentation in sync with code changes
2. Mark outdated sections clearly
3. Update implementation status in PRD tracking documents
4. Review cross-references when moving or renaming files

### Archiving Old Documentation
1. Move superseded documents to `archive/` subdirectories
2. Add deprecation notices to old documents
3. Update references in other documentation
4. Keep archive/ out of main README navigation

## 📖 Related Documentation

- **[Project README](../README.md)** - Main project overview and setup
- **[CLAUDE.md](../CLAUDE.md)** - Claude Code instructions and project context

## 🤝 Contributing to Documentation

When creating or updating documentation:
1. **Be Clear**: Use simple language and concrete examples
2. **Be Complete**: Include all necessary context and information
3. **Be Current**: Keep documentation synchronized with implementation
4. **Be Organized**: Follow the directory structure and naming conventions
5. **Be Helpful**: Write for your audience (PM, developer, designer, etc.)
