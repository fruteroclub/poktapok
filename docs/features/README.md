# Features Documentation

Feature specifications with technical implementation details, API documentation, and usage examples.

## 📋 Feature Specifications

### ✅ Implemented Features

#### [Avatar Upload](./avatar-upload.md)
**Status**: ✅ Complete
**Epic**: E1 (Core User Features)
**Description**: Avatar upload system with Vercel Blob Storage, client-side validation, and service layer architecture

**Key Components**:
- Pure UI component for file selection and preview
- Service layer abstraction (`uploadAvatar`, `deleteAvatar`)
- Blo integration for Ethereum address fallbacks
- Unified submission flow (onboarding) and immediate upload flow (profile editing)

---

## 📝 Creating New Feature Documentation

When documenting a new feature, use this template structure:

### Feature Documentation Template

```markdown
# Feature Name

## Overview
Brief description of the feature and its purpose.

## Architecture
- Design principles and patterns used
- Component responsibilities
- Integration points

## Technical Implementation
- Storage/database requirements
- API endpoints
- Client components
- Service layer functions

## Usage Examples
- Code examples for different use cases
- Integration patterns

## Configuration
- Environment variables
- Setup requirements

## Testing
- Test scenarios
- Edge cases

## Future Improvements
- Planned enhancements
- Known limitations
```

### File Naming Convention
- Use kebab-case: `feature-name.md`
- Be descriptive: `avatar-upload.md` not `upload.md`
- One feature per file

### Cross-References
- Link to related tickets in `/docs/tickets/`
- Reference API routes in main codebase
- Link to related features

---

## 🔗 Related Documentation

- **[Tickets](../tickets/)** - Implementation tickets and epic tracking
- **[Product PRD](../product/prd.md)** - Product requirements and vision
- **[Developer Guides](../dev/)** - Setup and technical guides
