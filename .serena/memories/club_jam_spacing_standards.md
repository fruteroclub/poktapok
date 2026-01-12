# Spacing Standards for Club & Jam Pages

**Date:** January 11, 2026
**Status:** Standards Updated

## Critical Spacing Rules

### Never Use Y-Axis Margin
- ❌ Never use `mt-*`, `mb-*`, or `my-*` classes
- ❌ No vertical margins between components
- ❌ No margin for spacing elements

### Use These Instead

#### 1. `space-y-*` for Vertical Spacing
Use `space-y-*` utility on parent containers for consistent vertical spacing between children:

```tsx
// ✅ CORRECT
<div className="space-y-4">
  <Component1 />
  <Component2 />
  <Component3 />
</div>

// Common spacing values:
// space-y-2 = 0.5rem (8px)
// space-y-4 = 1rem (16px)
// space-y-6 = 1.5rem (24px)
// space-y-8 = 2rem (32px)
```

#### 2. `gap-*` for Flex/Grid Layouts
Use `gap-*` for flex and grid containers (works for both horizontal and vertical):

```tsx
// ✅ CORRECT - Flex column with gap
<div className="flex flex-col gap-4">
  <Component1 />
  <Component2 />
  <Component3 />
</div>

// ✅ CORRECT - Grid with gap
<div className="grid grid-cols-3 gap-6">
  <Card1 />
  <Card2 />
  <Card3 />
</div>
```

#### 3. Padding for Container Edges
Padding is acceptable for container edges, NOT for spacing between elements:

```tsx
// ✅ CORRECT - Padding for container edges
<div className="py-8 px-4">
  <div className="space-y-6">
    <Component1 />
    <Component2 />
  </div>
</div>

// ❌ WRONG - Padding between elements
<div>
  <Component1 className="pb-4" />
  <Component2 className="pt-4" />
</div>
```

## Examples from Design Docs

### Skeleton Loaders
```tsx
// ✅ CORRECT
<Card className="animate-pulse">
  <CardHeader className="space-y-2">
    <div className="h-6 bg-gray-200 rounded w-3/4" />
    <div className="h-4 bg-gray-200 rounded w-1/2" />
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
    </div>
  </CardContent>
</Card>
```

### Empty States
```tsx
// ✅ CORRECT
<div className="text-center py-12 text-muted-foreground space-y-2">
  <p>No se encontraron programas activos.</p>
  <p className="text-sm">Vuelve pronto para nuevas oportunidades.</p>
</div>
```

### Error States
```tsx
// ✅ CORRECT
<Card className="border-destructive">
  <CardContent className="py-8 text-center space-y-4">
    <p className="text-destructive">Error al cargar proyectos</p>
    <Button onClick={refetch} variant="outline">
      Reintentar
    </Button>
  </CardContent>
</Card>
```

### CTA Sections
```tsx
// ✅ CORRECT
<div className="text-center space-y-4">
  <p className="text-muted-foreground">
    Únete al club para acceder a las sesiones
  </p>
  <AuthButton>Únete al Club</AuthButton>
</div>
```

## Why This Matters

1. **Consistency:** Uniform spacing system across entire application
2. **Maintainability:** Easier to adjust spacing globally
3. **Predictability:** Clear mental model for spacing
4. **Performance:** Tailwind's JIT compiler optimizes these utilities
5. **Team Standards:** Matches existing codebase patterns

## Common Mistakes to Avoid

### ❌ WRONG Patterns
```tsx
// Don't use margin on y-axis
<div>
  <Component1 className="mb-4" />
  <Component2 className="mt-4 mb-4" />
  <Component3 />
</div>

// Don't mix margin and space-y
<div className="space-y-4">
  <Component1 className="mb-2" /> {/* Conflicts with space-y */}
  <Component2 />
</div>

// Don't use padding for spacing between siblings
<div>
  <Component1 className="pb-4" />
  <Component2 className="pt-4" />
</div>
```

### ✅ CORRECT Patterns
```tsx
// Use space-y on parent
<div className="space-y-4">
  <Component1 />
  <Component2 />
  <Component3 />
</div>

// Use gap for flex/grid
<div className="flex flex-col gap-4">
  <Component1 />
  <Component2 />
  <Component3 />
</div>

// Use padding only for container edges
<div className="py-8">
  <div className="space-y-6">
    <Section1 />
    <Section2 />
  </div>
</div>
```

## Implementation Checklist

When implementing Club/Jam pages:
- [ ] No `mt-*`, `mb-*`, or `my-*` classes used
- [ ] All vertical spacing uses `space-y-*` or `gap-*`
- [ ] Padding only used for container edges
- [ ] Consistent spacing values throughout (2, 4, 6, 8)
- [ ] All examples follow these patterns

## Updated Design Documents

All design specifications have been updated to follow these standards:
- ✅ `docs/design/phase-2-jam-section-design.md`
- ✅ `docs/design/phase-3-club-section-design.md`
- ✅ `docs/design/implementation-summary.md`

Developers implementing these designs should strictly follow the spacing patterns demonstrated in the code examples.
