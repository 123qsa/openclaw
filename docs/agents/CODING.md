---
summary: "Coding style, TypeScript conventions, and file organization"
read_when:
  - Writing new code
  - Refactoring existing code
  - Understanding code conventions
---

# Coding Standards

## Language & TypeScript

- **Language**: TypeScript (ESM)
- **Strict typing**: Prefer strict typing; avoid `any`
- **Runtime**: Node **22+** (keep Node + Bun paths working)

## Linting & Formatting

We use Oxlint and Oxfmt:

```bash
pnpm check        # Run lint + format check
pnpm format       # Format check only
pnpm format:fix   # Auto-fix formatting
```

### Rules

- **NEVER** add `@ts-nocheck`
- **NEVER** disable `no-explicit-any` - fix root causes instead
- Only update Oxlint/Oxfmt config when truly required

## Dynamic Import Guardrail

Do **NOT** mix dynamic and static imports for the same module:

```typescript
// ❌ Bad - mixing styles
import { foo } from "x";
const { bar } = await import("x");

// ✅ Good - use a boundary
// x.runtime.ts - re-exports from x
// Then dynamically import x.runtime.ts from lazy callers only
```

After refactors touching lazy-loading/module boundaries, run `pnpm build` and check for `[INEFFECTIVE_DYNAMIC_IMPORT]` warnings.

## Class Design

**NEVER** share class behavior via prototype mutation:

```typescript
// ❌ Never do this
applyPrototypeMixins(ClassA, ClassB);
Object.defineProperty(SomeClass.prototype, "method", ...);
export const ClassPrototype = { ... };

// ✅ Use explicit inheritance/composition
class A extends B extends C {}
// Or helper composition
```

If this pattern is absolutely required, get explicit approval before shipping.

## Test Conventions

- Prefer per-instance stubs over prototype mutation
- Only use `SomeClass.prototype.method = ...` when a test explicitly documents why prototype-level patching is required

## File Organization

### Keep Files Concise

- **Guideline**: Keep files under ~700 LOC
- Extract helpers instead of creating "V2" copies
- Use existing patterns for CLI options and dependency injection

### Naming Conventions

- **Product**: Use **OpenClaw** for product/app/docs headings
- **CLI**: Use `openclaw` for CLI command, package/binary, paths, and config keys
- **Spelling**: American English (e.g., "color" not "colour", "behavior" not "behaviour")

## Code Comments

Add brief comments for tricky or non-obvious logic. Don't over-document obvious code.

## Dependencies

- Any dependency with `pnpm.patchedDependencies` must use an exact version (no `^`/`~`)
- **NEVER** patch dependencies (pnpm patches, overrides, or vendored changes) without explicit approval
