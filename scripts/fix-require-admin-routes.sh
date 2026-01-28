#!/bin/bash

# Script to fix requireAdmin wrapper pattern in API routes for Next.js 16 compatibility

files=(
  "src/app/api/admin/applications/[id]/approve/route.ts"
  "src/app/api/admin/attendance/bulk/route.ts"
  "src/app/api/admin/attendance/mark/route.ts"
  "src/app/api/admin/attendance/session/[id]/route.ts"
  "src/app/api/admin/pending-users/route.ts"
  "src/app/api/admin/users/[id]/eligibility/route.ts"
  "src/app/api/admin/users/[id]/promote/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"

    # Use perl to do in-place replacements
    # Pattern 1: Replace export const METHOD = requireAdmin(async (request: NextRequest) => {
    #            with: export async function METHOD(request: NextRequest, context) {\n  await requireAdmin(request)\n

    perl -i -pe '
      # For routes with [id] param
      if (/^export const (GET|POST|PUT|PATCH|DELETE) = requireAdmin\(async \(request: NextRequest\)/) {
        s/^export const (GET|POST|PUT|PATCH|DELETE) = requireAdmin\(async \(request: NextRequest\)/export async function $1(request: NextRequest, { params }: { params: Promise<{ id: string }> })/;
        $_ .= "  const { id } = await params\n  await requireAdmin(request)\n\n";
      }
      # For routes without params
      elsif (/^export const (GET|POST|PUT|PATCH|DELETE) = requireAdmin\(async \(request: NextRequest\)/) {
        s/^export const (GET|POST|PUT|PATCH|DELETE) = requireAdmin\(async \(request: NextRequest\)/export async function $1(request: NextRequest)/;
        $_ .= "  await requireAdmin(request)\n\n";
      }
      # Remove trailing })
      s/^\}\)$/}/;
    ' "$file"

    echo "✓ Fixed: $file"
  else
    echo "⨯ Not found: $file"
  fi
done

echo ""
echo "All files processed!"
