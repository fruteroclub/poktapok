# Developer Documentation

Technical guides, setup instructions, and developer resources for the Poktapok platform.

## 📋 Developer Guides

### [Database Setup](./database-setup.md)
**Purpose**: Complete guide for setting up local and production database
**Contents**:
- Environment configuration
- Neon DB setup
- Connection pooling
- Schema management
- Testing and verification

### [API Reference](./api-reference.md)
**Purpose**: Complete API endpoint documentation
**Contents**:
- Authentication endpoints
- Profile management
- Application system
- Program management
- Standard response formats
- Error handling patterns

### [Testing Guide](./testing-guide.md)
**Purpose**: Testing strategies and implementation guide
**Contents**:
- Unit testing patterns
- Integration testing
- E2E testing with Playwright
- Test organization
- Coverage requirements
- CI/CD integration

---

## 🔧 Third-Party Integrations

### [Privy Authentication](./privy/)
**Purpose**: Privy wallet authentication setup and configuration
**Contents**:
- Configuration guides
- Token management
- Integration patterns

---

## 🚀 Quick Start for New Developers

### 1. Environment Setup
```bash
# Clone repository
git clone <repo-url>
cd poktapok

# Install dependencies
bun install

# Setup environment variables
vercel env pull .env.local
```

### 2. Database Setup
Follow the complete [Database Setup Guide](./database-setup.md):
- Configure Neon DB connection
- Apply migrations
- Verify connectivity

### 3. Development Server
```bash
# Start development server
bun dev

# Open browser
open http://localhost:3000
```

### 4. Testing
```bash
# Run linter
bun run lint

# Run database tests
bun run scripts/test-db-connection.ts
```

---

## 📝 Development Workflow

### Feature Development
1. **Create branch**: `git checkout -b feature/feature-name`
2. **Implement feature**: Follow [Feature Template](../features/FEATURE_TEMPLATE.md)
3. **Write tests**: See [Testing Guide](./testing-guide.md)
4. **Document**: Update feature docs and API reference
5. **Create PR**: Include ticket reference and description

### Database Changes
1. **Edit schema**: Modify files in `drizzle/schema/`
2. **Generate migration**: `bun run db:generate`
3. **Review migration**: Check generated SQL
4. **Apply migration**: `bun run db:migrate`
5. **Verify**: Run tests and verify changes

See [Database Documentation](../database/) for complete workflow.

---

## 🔗 Related Documentation

- **[Features](../features/)** - Feature specifications
- **[Specifications](../specs/)** - System specifications
- **[Database](../database/)** - Database documentation
- **[Product PRD](../product/prd.md)** - Product requirements
- **[Tickets](../tickets/)** - Implementation tickets

---

## 🤝 Contributing

### Code Standards
- **TypeScript**: Strict mode enabled, no `any` types
- **Naming**: kebab-case for files, camelCase for variables
- **Styling**: Tailwind CSS, follow existing patterns
- **Components**: Use shadcn/ui components

### Pull Request Guidelines
- Include ticket reference in title
- Update documentation
- Add tests for new features
- Ensure linter passes
- Request review from team

### Code Review Checklist
- [ ] Code follows project standards
- [ ] Tests included and passing
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Responsive design tested
- [ ] Accessibility requirements met

---

## 📖 Additional Resources

### External Documentation
- [Next.js 16 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Privy Docs](https://docs.privy.io)
- [Tailwind CSS v4](https://tailwindcss.com)

### Project Resources
- [CLAUDE.md](../../CLAUDE.md) - Claude Code instructions
- [README.md](../../README.md) - Project overview
