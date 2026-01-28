# Coding Conventions

**Analysis Date:** 2026-01-26

## Naming Patterns

**Files:**
- Use kebab-case for all file names (never PascalCase)
- Examples: `multi-step-onboarding-form.tsx`, `user-card.tsx`, `hero-section.tsx`, `goal-input.tsx`, `avatar-upload.tsx`
- Page components use kebab-case: `onboarding/page.tsx`, `profile/[username]/page.tsx`

**Functions:**
- Use camelCase for function names: `fetchActivePrograms()`, `submitApplication()`, `handleNext()`
- Hook functions prefixed with `use`: `useActivePrograms()`, `useSubmitApplication()`, `useAuth()`
- Component functions exported as named exports (functions) or default exports
- Service functions are async and descriptive: `fetchPendingUsers()`, `approveApplication()`

**Variables:**
- Use camelCase for variable names: `currentStep`, `formData`, `submissionError`
- Constants use UPPER_SNAKE_CASE: `GOAL_MAX_LENGTH`, `MOTIVATION_MAX_LENGTH`, `EXISTING_MEMBER_TEXT`
- Define constants at module level before component definitions

**Types:**
- Use PascalCase for interface names: `FormData`, `FormErrors`, `MemberOnlyProps`, `ProfileCardProps`
- Interfaces define component props: `interface GoalInputProps { ... }`
- Type aliases use PascalCase: `type OnboardingStep = 'program' | 'goal' | 'social' | 'review'`

## Code Style

**Formatting:**
- Prettier with TypeScript parser
- Tab width: 2 spaces
- No semicolons (semi: false)
- Single quotes for strings (singleQuote: true)
- Print width: 80 (default, 100 for markdown)
- Tailwind CSS classes are sorted by prettier-plugin-tailwindcss

**Linting:**
- ESLint 9 with Next.js core-web-vitals and TypeScript configs
- Configuration: `eslint.config.mjs` (uses flat config format)
- **CRITICAL RULE**: NEVER use `any` type - ESLint rejects it as an error
  - Use proper type definitions or `unknown` for truly unknown types
  - For error handling: Use `error instanceof Error` pattern
  - Example:
    ```typescript
    // ❌ WRONG
    catch (error: any) {
      console.error(error.message);
    }

    // ✅ CORRECT
    catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
    ```

**TypeScript:**
- Strict mode enabled
- Target: ES2017
- Use `import type` for type-only imports
- All components must be fully typed
- Path alias configured: `@/*` maps to `./src/*`

## Import Organization

**Order:**
1. React and Next.js imports (React, hooks, Next.js modules)
2. Third-party libraries (lucide-react, sonner, etc.)
3. UI components from `@/components/ui/`
4. Custom components from `@/components/`
5. Services from `@/services/`
6. Hooks from `@/hooks/`
7. Types from `@/types/`
8. Library utilities from `@/lib/`

**Path Aliases:**
- Use `@/` prefix for all internal imports (configured in `tsconfig.json` and `components.json`)
- Examples: `@/components/ui/button`, `@/services/onboarding`, `@/lib/api/fetch`
- Do not use relative paths like `../../../components`

**Example imports:**
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { ProgramSelector } from './program-selector'
import { useSubmitApplication } from '@/hooks/use-onboarding'
import type { FormData } from '@/types/forms'
```

## Error Handling

**Patterns:**
- Use `ApiError` class for API errors (`src/lib/api/fetch.ts`)
- `ApiError` has `code`, `details`, and `status` properties
- In services: Let errors propagate to caller (don't catch)
- In components: Use `try-catch` with `error instanceof Error` pattern
- In API routes: Use `apiError()`, `apiErrors.*()` or `apiValidationError()` from `src/lib/api/response.ts`

**Service-level:**
```typescript
// Service functions throw errors for callers to handle
export async function submitApplication(data: SubmitApplicationRequest): Promise<SubmitApplicationResponse> {
  return apiFetch<SubmitApplicationResponse>('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}
```

**Hook-level:**
```typescript
export function useSubmitApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SubmitApplicationRequest) => submitApplication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })
}
```

**Component-level:**
```typescript
const submitMutation = useSubmitApplication()
const handleSubmit = () => {
  submitMutation.mutate(formData, {
    onSuccess: () => {
      toast.success('Success!')
      router.push('/profile')
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error submitting')
    },
  })
}
```

**API route-level:**
```typescript
import { apiSuccess, apiError, apiValidationError, apiErrors } from '@/lib/api/response'

try {
  const result = schema.safeParse(body)
  if (!result.success) {
    return apiValidationError(result.error)
  }

  if (!user) {
    return apiErrors.notFound('User')
  }

  return apiSuccess({ data })
} catch (error) {
  console.error('Error:', error)
  return apiErrors.internal()
}
```

## Logging

**Framework:** console object (no external logging library)

**Patterns:**
- Use `console.error()` for errors in try-catch blocks
- Use `console.log()` sparingly for debugging only
- Include context in log messages: `console.error('Error submitting application:', error)`
- Error logs always include the error object for stack traces

**Example:**
```typescript
try {
  await submitApplication(data)
} catch (error) {
  console.error('Error submitting application:', error)
  if (error instanceof ApiError) {
    toast.error(error.message)
  }
}
```

## Comments

**When to Comment:**
- Complex business logic or validation rules
- Non-obvious algorithms or patterns
- Workarounds or hacks (mark with `TODO` or `FIXME`)
- Cross-file dependencies or integrations

**JSDoc/TSDoc:**
- Document all exported functions with JSDoc blocks
- Include `@param` and `@returns` tags
- Include `@example` for complex functions
- Use JSDoc for service functions and hooks

**Example:**
```typescript
/**
 * Submit onboarding application with program selection and goal
 *
 * @param data - Application data (programId, goal, optional social accounts)
 * @returns {Promise<SubmitApplicationResponse>} Created application
 * @throws ApiError if request fails (validation, duplicate, etc.)
 */
export async function submitApplication(
  data: SubmitApplicationRequest,
): Promise<SubmitApplicationResponse> {
  return apiFetch<SubmitApplicationResponse>('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}
```

## Function Design

**Size:**
- Keep functions focused (single responsibility principle)
- Prefer smaller, composable functions over large blocks
- Extract validation, calculations, and side effects into separate functions

**Parameters:**
- Use destructuring for multiple parameters
- Group related parameters in objects: `interface FormData { ... }`
- Optional parameters documented in types

**Return Values:**
- Be explicit with return types (no implicit `any`)
- Return objects for multiple values instead of arrays
- Async functions always return `Promise<T>` (never bare value from async function)

**Example:**
```typescript
interface OnboardingStep {
  id: string
  title: string
  description: string
}

export async function fetchOnboardingSteps(): Promise<OnboardingStep[]> {
  return apiFetch<{ steps: OnboardingStep[] }>('/api/onboarding/steps')
    .then(result => result.steps)
}
```

## Module Design

**Exports:**
- Use named exports for functions: `export function MyComponent() { ... }`
- Use default exports for page components: `export default function Page() { ... }`
- Export types/interfaces for external use

**Barrel Files:**
- Not commonly used; import directly from modules
- Example: Import from `src/components/onboarding/goal-input` directly

**Service Layer:**
- `src/services/` contains API abstractions
- Each service file uses `apiFetch` for HTTP calls
- Functions are async and throw on error
- Include JSDoc for each function

**Hook Layer:**
- `src/hooks/` contains custom hooks using TanStack Query
- Use `useQuery` for data fetching, `useMutation` for mutations
- Hooks wrap service functions for state management
- Include JSDoc with examples

**Component Layer:**
- Components use hooks for data and mutations
- Handle loading/error states from hooks
- Use `toast` for user feedback
- Components should be simple and focused on UI

## Client Components

**'use client' directive:**
- Required for all components using hooks (useState, useEffect, custom hooks)
- Place at very top of file before any imports
- Examples: `src/components/onboarding/multi-step-onboarding-form.tsx`, `src/components/common/member-only.tsx`

**Server vs Client:**
- Page components are server components by default
- Use 'use client' only when needed (hooks, event handlers, state)
- Pass data to client components via props from server

## Styling

**Tailwind CSS v4:**
- Use utility-first approach: `className="space-y-4 text-lg font-semibold"`
- **NEVER use `bg-muted` or variations** (e.g., `bg-muted/50`, `hover:bg-muted`)
- Use explicit color classes or semantic alternatives
- For spacing: Use `space-y-` for block containers, `gap-` for flex/grid

**cn() utility:**
- Located in `src/lib/utils.ts`
- Combines clsx and tailwind-merge for conditional classes
- Example: `className={cn('px-4 py-2', isActive && 'bg-blue-500')}`

**Theme:**
- CSS variables defined in `src/styles/globals.css`
- Use semantic classes: `bg-foreground`, `text-muted-foreground`, `border`
- `next-themes` for dark/light mode support

## Validation

**Zod schemas:**
- Define validation schemas inline or in separate files
- Use `safeParse()` in API routes before processing
- Return `apiValidationError()` for validation failures
- Example:
  ```typescript
  const applicationSchema = z.object({
    programId: z.string().uuid('Invalid program ID').optional(),
    goal: z.string().min(1).max(280),
  })

  const result = applicationSchema.safeParse(body)
  if (!result.success) {
    return apiValidationError(result.error)
  }
  ```

## TypeScript Best Practices

**Type Safety:**
- No `any` type (ESLint enforces this)
- Use `unknown` for truly unknown values
- Type component props with interfaces ending in `Props`
- Export types from `src/types/` directory

**Generics:**
- Use for reusable functions: `apiFetch<T>(url, options): Promise<T>`
- Type hooks: `useQuery({ ... })` and `useMutation({ ... })`
- Use in API response wrappers

**Discriminated Unions:**
- Used in API responses (success vs error)
- Example: `{ success: true, data: T } | { success: false, error: Error }`
- TanStack Query and `apiFetch` handle discrimination automatically

---

*Convention analysis: 2026-01-26*
