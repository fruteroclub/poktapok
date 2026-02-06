# Convex Backend

Fresh Convex implementation for Poktapok.

## Structure

```
convex/
├── schema.ts          # Database schema definition
├── users.ts           # User queries and mutations
├── events.ts          # Event queries and mutations
├── tsconfig.json      # TypeScript config for Convex
└── _generated/        # Auto-generated (gitignored)
```

## Development

### Start Dev Server

```bash
bunx convex dev
```

This will:
- Watch for changes in `convex/`
- Auto-deploy to cloud dev project
- Generate TypeScript types in `_generated/`

### Schema Changes

Edit `schema.ts` and save - changes deploy automatically.

### Writing Functions

**Query (read-only):**
```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});
```

**Mutation (write):**
```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("users", { name: args.name });
    return id;
  },
});
```

## Frontend Usage

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function MyComponent() {
  const users = useQuery(api.users.list);
  const createUser = useMutation(api.users.create);
  
  return <div>{/* ... */}</div>;
}
```

## Testing

Use Convex Dashboard to:
- Browse tables
- Insert test data
- Run queries manually
- View function logs

Dashboard: https://dashboard.convex.dev

## Deployment

```bash
# Deploy to production
bunx convex deploy --prod
```

## Resources

- [Convex Docs](https://docs.convex.dev)
- [Dev Workflow](../docs/dev/CONVEX_DEV_WORKFLOW.md)
- [Implementation Plan](../docs/CONVEX_IMPLEMENTATION.md)
