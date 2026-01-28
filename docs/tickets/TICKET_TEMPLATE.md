# [Epic Number]-T[Task Number]: [Feature Name]

> **Epic**: [Epic Number] - [Epic Name]
> **Status**: 🎯 Todo | 🚧 In Progress | ✅ Complete | 🗄️ Deferred
> **Priority**: 🔴 Critical | 🟡 High | 🟢 Medium | ⚪ Low
> **Effort**: S (< 1 day) | M (1-3 days) | L (3-5 days) | XL (> 1 week)

## 📋 Overview

Brief description of the feature or task and its purpose within the epic.

## 🎯 Objectives

- Primary objective 1
- Primary objective 2
- Primary objective 3

## 📦 Deliverables

- [ ] Deliverable 1 (e.g., API endpoint implemented)
- [ ] Deliverable 2 (e.g., UI component created)
- [ ] Deliverable 3 (e.g., Documentation updated)
- [ ] Deliverable 4 (e.g., Tests written and passing)

## 🔧 Technical Requirements

### Backend
- Database schema changes (if any)
- API endpoints to create
- Service layer functions
- Authentication/authorization requirements

### Frontend
- Pages/routes to create or modify
- Components to build
- State management needs
- API integration points

### Infrastructure
- Environment variables
- Third-party services
- Deployment considerations

## 📐 Design Specifications

### Data Models
```typescript
// Example data model
interface Example {
  id: string
  field1: string
  field2: number
  // ...
}
```

### API Endpoints

#### `POST /api/resource`
**Purpose**: Brief description
**Request**:
```json
{
  "field": "value"
}
```
**Response**:
```json
{
  "success": true,
  "data": { ... }
}
```

### UI Components
- Component 1: Description
- Component 2: Description

## 🔄 User Flow

1. **Step 1**: User action and system response
2. **Step 2**: Next user action and system response
3. **Step 3**: Final state or outcome

## ✅ Acceptance Criteria

### Functional Requirements
- [ ] Requirement 1 is met
- [ ] Requirement 2 is met
- [ ] Requirement 3 is met

### Non-Functional Requirements
- [ ] Performance: [metric and target]
- [ ] Security: [security requirements met]
- [ ] Accessibility: [WCAG compliance level]
- [ ] Responsive: [works on mobile, tablet, desktop]

### Testing Requirements
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] E2E tests written and passing (if applicable)
- [ ] Manual testing completed

## 🔗 Dependencies

### Blocks
- [Epic-Task]: Description of blocking ticket

### Blocked By
- [Epic-Task]: Description of dependency

### Related
- [Epic-Task]: Related work or context

## 🧪 Testing Plan

### Unit Tests
- Test case 1: Description
- Test case 2: Description

### Integration Tests
- Test scenario 1: Description
- Test scenario 2: Description

### E2E Tests
- User flow 1: Description
- User flow 2: Description

### Manual Testing Checklist
- [ ] Happy path tested
- [ ] Error cases tested
- [ ] Edge cases tested
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] Mobile responsive tested
- [ ] Accessibility tested (keyboard navigation, screen reader)

## 📝 Implementation Notes

### Architecture Decisions
- Decision 1: Rationale
- Decision 2: Rationale

### Code Organization
- File structure
- Naming conventions
- Pattern usage

### Known Limitations
- Limitation 1: Description and mitigation plan
- Limitation 2: Description and mitigation plan

## 🚀 Deployment

### Environment Variables
```bash
NEW_VAR=value  # Description of what this variable controls
```

### Database Migrations
```bash
# Migration commands needed
bun run db:generate
bun run db:migrate
```

### Post-Deployment Verification
- [ ] Feature accessible at expected route
- [ ] API endpoints responding correctly
- [ ] Database changes applied successfully
- [ ] No errors in production logs

## 📚 Documentation

### Files to Update
- [ ] `README.md` - Add feature description
- [ ] `CLAUDE.md` - Update project context
- [ ] `docs/features/[feature-name].md` - Create feature documentation
- [ ] API documentation - Document new endpoints
- [ ] Component library - Document new components

### Documentation Content
- Feature overview
- Usage examples
- Configuration guide
- Troubleshooting guide

## 🔄 Future Iterations

### Phase 1 (This Ticket)
- Core functionality

### Phase 2 (Future)
- Enhancement 1
- Enhancement 2

### Phase 3 (Future)
- Advanced feature 1
- Advanced feature 2

## 📖 References

- **Design**: [Link to design document or Figma]
- **Specification**: [Link to detailed spec]
- **API Contract**: [Link to API documentation]
- **Related Tickets**: [Links to related epic tickets]
- **External Resources**: [Links to relevant documentation or resources]

---

## 📊 Progress Tracking

### Milestones
- [x] Planning and design complete
- [ ] Implementation started
- [ ] Backend complete
- [ ] Frontend complete
- [ ] Testing complete
- [ ] Documentation complete
- [ ] Code review complete
- [ ] Deployed to staging
- [ ] Deployed to production

### Time Tracking
- **Estimated**: [X] hours
- **Actual**: [Y] hours
- **Variance**: [Y-X] hours

### Notes and Blockers
- [Date]: Note or blocker description
- [Date]: Resolution or update
