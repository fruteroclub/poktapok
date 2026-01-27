# Testing Patterns

**Analysis Date:** 2026-01-26

## Test Framework

**Runner:**
- No test framework currently configured (no jest, vitest, or similar)
- Manual testing required for all features
- `bun test` is not configured in scripts

**Build and Lint:**
- Linting: `bun run lint` (ESLint)
- Formatting check: `bun run format:check` (Prettier)
- No automated tests, only linting and type checking

**Run Commands:**
```bash
bun run lint                        # Run ESLint
bun run format:check                # Check Prettier formatting
bun run format                      # Auto-format code
bun dev                             # Run dev server for manual testing
bun run build                       # Build for production
```

## Test File Organization

**Current State:**
- No test files exist in the codebase (no `*.test.*` or `*.spec.*` files)
- Testing is currently manual

**Recommended Structure (if testing framework is added):**
```
src/
├── services/
│   ├── onboarding.ts
│   └── onboarding.test.ts         # Unit tests for service
├── hooks/
│   ├── use-onboarding.ts
│   └── use-onboarding.test.ts     # Hook tests with mocked queries
├── components/
│   ├── onboarding/
│   │   ├── goal-input.tsx
│   │   └── goal-input.test.tsx    # Component render tests
└── lib/
    ├── api/
    │   ├── fetch.ts
    │   └── fetch.test.ts          # Error handling tests
```

## Testing Strategy (Manual)

### Testing Layer Breakdown

**1. Service Layer Testing (Manual)**

Services in `src/services/` make API calls via `apiFetch`. Manual testing verifies:
- API endpoints are reachable
- Request/response structures match types
- Error codes and messages are correct

Example service to test: `src/services/onboarding.ts`
```typescript
export async function fetchActivePrograms(): Promise<ActiveProgramsResponse> {
  return apiFetch<ActiveProgramsResponse>('/api/programs/active')
}

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

Manual testing:
1. Run `bun dev` to start dev server
2. Call service functions from browser console or test file
3. Verify responses match `ActiveProgramsResponse` and `SubmitApplicationResponse` types
4. Test with valid and invalid data

**2. Hook Layer Testing (Manual)**

Hooks in `src/hooks/` use TanStack Query (React Query) to manage service calls and state. Manual testing verifies:
- Data fetching and caching behavior
- Mutation handling
- Loading/error states

Example hook: `src/hooks/use-onboarding.ts`
```typescript
export function useActivePrograms() {
  return useQuery({
    queryKey: ['programs', 'active'],
    queryFn: fetchActivePrograms,
    staleTime: 5 * 60 * 1000,
  })
}

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

Manual testing:
1. Visit onboarding page (`/onboarding`)
2. Wait for programs to load (verify loading state shows spinner)
3. Submit application and verify:
   - Loading state shows "Enviando..."
   - Success: Navigate to profile, show toast
   - Error: Show error toast with message

**3. Component Layer Testing (Manual)**

Components in `src/components/` render UI and handle user interactions. Manual testing verifies:
- Form inputs accept and validate data
- Buttons trigger correct handlers
- Error messages display properly
- UI responds to hook state changes

Example component: `src/components/onboarding/multi-step-onboarding-form.tsx`
- Test each step: program selection, goal entry, social accounts, review
- Test validation: empty fields, exceeding character limits
- Test navigation: next/back buttons, progress bar updates
- Test submission: network errors, success redirect

**4. API Route Testing (Manual)**

API routes in `src/app/api/` handle requests and return responses. Manual testing verifies:
- Request validation works correctly
- Business logic executes properly
- Error responses are correctly formatted

Example route: `src/app/api/applications/route.ts`
```typescript
export async function POST(request: NextRequest) {
  // 1. Validate request (check body structure)
  // 2. Verify user is authenticated
  // 3. Check user status (incomplete)
  // 4. Validate program exists
  // 5. Create application in transaction
  // 6. Update user status
  // 7. Update profile
  // 8. Return success response
}
```

Manual testing:
1. Use curl, Postman, or browser DevTools Network tab
2. Send POST to `/api/applications` with:
   - Valid auth headers
   - Valid request body
3. Verify response matches `SubmitApplicationResponse` type
4. Test error cases:
   - Unauthenticated request → 401
   - Invalid body → 400 with validation errors
   - Duplicate application → 409
   - User not in 'incomplete' status → 400

### Testing Checklist for New Features

**Before committing changes:**

1. **Type Safety:**
   - Run `bun run lint` - no ESLint errors
   - TypeScript compiles with no `any` types
   - Components have proper `Props` interfaces

2. **Code Style:**
   - Run `bun run format:check` - code follows Prettier rules
   - File names use kebab-case
   - Functions use camelCase, constants use UPPER_SNAKE_CASE

3. **API Integration:**
   - Service functions type-checked against responses
   - Error handling with `apiFetch` and `ApiError`
   - API responses match types in `src/types/api-v1.ts`

4. **Component Behavior (Manual):**
   - Forms accept valid input
   - Forms reject invalid input with error messages
   - Loading states display correctly
   - Error toasts show with proper messages
   - Success actions complete (navigation, data refresh)

5. **Database Operations:**
   - Schema changes generated with `bun run db:generate`
   - Migrations applied with `bun run db:migrate`
   - Queries return correct data structure
   - Transactions complete atomically

6. **Error Scenarios (Manual):**
   - Network error: Show user-friendly error toast
   - Server error: Show "Internal server error"
   - Validation error: Show specific field errors
   - Not found error: Handle gracefully (404)

## Mocking Strategy (For Future Testing Framework)

**What to Mock:**
- `apiFetch` calls - mock responses and errors
- TanStack Query - use `@testing-library/react` with MSW
- Next.js router - jest mock for navigation
- Privy authentication - mock `usePrivy()` hook

**What NOT to Mock:**
- Component renders - test actual rendering
- Tailwind CSS classes - classes are applied correctly
- Business logic - test actual validation, calculations
- Hook state - test actual state changes

**Example mock pattern (if framework added):**
```typescript
// Mock service function
jest.mock('@/services/onboarding', () => ({
  fetchActivePrograms: jest.fn().mockResolvedValue({
    programs: [
      { id: '1', name: 'Program A', programType: 'cohort' },
    ]
  }),
  submitApplication: jest.fn().mockResolvedValue({
    application: { id: '1', status: 'pending' }
  }),
}))

// Mock hook with React Query
const mockUseSubmitApplication = jest.fn(() => ({
  mutate: jest.fn((data, callbacks) => {
    callbacks.onSuccess({ application: { id: '1' } })
  }),
  isPending: false,
}))
```

## Database Testing

**Connection Testing:**
```bash
bun run scripts/test-db-connection.ts      # Test connectivity
bun run scripts/verify-migration.ts        # Verify schema objects
bun run scripts/test-crud-operations.ts    # Test CRUD operations
```

**Manual Database Testing:**
1. Verify connection with: `bun run scripts/test-db-connection.ts`
2. Check migrations applied: `bun run db:list-migrations`
3. Browse data with: `bun run db:studio` (opens Drizzle Studio)
4. Test queries in API routes return correct data

## Testing Edge Cases

**Form Validation Edge Cases:**
- Empty required fields
- Exceeding max character limits (goal: 280, motivation: 500)
- Invalid email/URL formats
- Special characters in text fields
- Paste very long text and verify max length enforcement

**API Request Edge Cases:**
- Missing authentication header → 401
- Malformed JSON body → 400
- Missing required fields → 400 with validation error
- User in wrong status (not 'incomplete') → 400
- Program doesn't exist → 404
- Duplicate application from same user → 409

**State Management Edge Cases:**
- Form navigation (back/forward) preserves input
- Multiple rapid submissions are debounced
- Error recovery (can retry after network error)
- Loading states show during async operations
- Concurrent requests don't cause race conditions

## Error Handling Testing

**Service Layer:**
```typescript
// Service throws ApiError
try {
  await submitApplication(data)
} catch (error) {
  // error is ApiError with code, details, status
  if (error instanceof ApiError) {
    console.log(error.code)    // 'VALIDATION_ERROR'
    console.log(error.details) // Zod format() output
    console.log(error.status)  // 400
  }
}
```

**Hook Layer:**
```typescript
// Mutation error is caught by TanStack Query
const mutation = useSubmitApplication()
mutation.mutate(data, {
  onError: (error: ApiError) => {
    if (error.code === 'VALIDATION_ERROR') {
      // Show field-specific errors
    } else {
      // Show generic error
    }
  },
})
```

**Component Layer:**
```typescript
// Component displays error toast
const handleSubmit = () => {
  submitMutation.mutate(formData, {
    onError: (error) => {
      toast.error(error.message || 'Error submitting')
    },
  })
}
```

## Type Safety Testing

**Verify Response Types:**
- Services return correct response type
- Components expect correct hook return type
- API responses match defined types in `src/types/api-v1.ts`

**Example:**
```typescript
// Service returns correct type
const response: SubmitApplicationResponse = await submitApplication(data)

// Hook returns correct type
const { data, isLoading, error } = useSubmitApplication()
// data is SubmitApplicationResponse

// Component receives correct props
<GoalInput
  goal={goal}
  onGoalChange={onGoalChange}
  goalError={goalError}
/>
```

## Code Quality Checks

**Pre-commit Checklist:**
1. `bun run lint` - No ESLint errors or warnings
2. `bun run format:check` - Code formatted with Prettier
3. TypeScript compiles without errors
4. No console errors when running `bun dev`

**Build Verification:**
```bash
bun run build    # Must complete without errors
bun start        # Must start successfully
```

## Performance Testing (Manual)

**Network Performance:**
- Verify staleTime settings prevent unnecessary refetches
- Example: `staleTime: 5 * 60 * 1000` (5 minutes for programs)
- Check React DevTools Profiler for unnecessary renders

**Bundle Size:**
- Run `bun run build` and check output
- No significant increase in bundle size from new code
- Verify production build succeeds with Turbopack

## Test Patterns (When Framework is Added)

**Service Unit Test Pattern:**
```typescript
describe('Onboarding Service', () => {
  it('should fetch active programs', async () => {
    // Mock apiFetch
    // Call fetchActivePrograms()
    // Assert correct URL and response structure
  })

  it('should submit application with validation', async () => {
    // Mock apiFetch
    // Call submitApplication() with valid data
    // Assert request body and response
  })
})
```

**Hook Test Pattern:**
```typescript
describe('useSubmitApplication', () => {
  it('should submit application and invalidate auth query', () => {
    // Render hook with QueryClientProvider
    // Call mutate()
    // Assert onSuccess callback invalidated correct query
  })
})
```

**Component Test Pattern:**
```typescript
describe('MultiStepOnboardingForm', () => {
  it('should validate goal on next', async () => {
    // Render component
    // Leave goal empty
    // Click next button
    // Assert error message displayed
  })
})
```

---

*Testing analysis: 2026-01-26*
