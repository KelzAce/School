# Contributing to School Reimagined

Thank you for your interest in contributing! This document explains how to get started, our development workflow, and the standards we follow.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

---

## Code of Conduct

By participating in this project you agree to uphold a respectful, inclusive, and harassment-free environment. Be kind, constructive, and collaborative in all interactions.

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14
- npm ≥ 9

### Setup

```bash
# Clone the repo
git clone https://github.com/KelzAce/School.git
cd School

# Install dependencies
npm install

# Copy environment config
cp .env.example .env
# Edit .env with your local database credentials

# Start in development mode
npm run start:dev
```

The API runs on `http://localhost:3002` by default.  
Swagger docs are available at `http://localhost:3002/api/docs`.

---

## Development Workflow

1. **Fork** the repository (external contributors) or create a branch directly (team members)
2. **Branch** off `main` using the naming convention below
3. **Implement** your feature or fix with tests
4. **Verify** your changes build and all tests pass
5. **Open a Pull Request** targeting `main` with a clear description

---

## Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/<short-description>` | `feat/skill-gap-analysis` |
| Bug fix | `fix/<short-description>` | `fix/enrollment-status-transition` |
| Chore / infra | `chore/<short-description>` | `chore/upgrade-typeorm` |
| Documentation | `docs/<short-description>` | `docs/api-authentication-guide` |
| Refactor | `refactor/<short-description>` | `refactor/simplify-pagination` |

---

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

### Types

| Type | When to use |
|------|------------|
| `feat` | New feature or endpoint |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code change that doesn't fix a bug or add a feature |
| `test` | Adding or updating tests |
| `chore` | Build process, tooling, dependency updates |
| `perf` | Performance improvement |

### Examples

```bash
feat(workplace): add supervisor assessment endpoints
fix(auth): correct refresh token expiry calculation
docs(readme): mark feature 12 as complete
test(badges): add missing edge case for revoked badge verification
```

---

## Code Standards

### TypeScript / NestJS Conventions

- **All imports use `.js` extension** — the project uses ESM module resolution
- **DTOs** use `class-validator` decorators and `@ApiProperty` / `@ApiPropertyOptional` from `@nestjs/swagger`
- **Update DTOs** use `PartialType` from `@nestjs/swagger` (not `@nestjs/mapped-types`)
- **Entities** extend `BaseEntity` from `src/common/entities/base.entity.ts`
- **Every entity is multi-tenant** — include `tenantId` uuid column and `@ManyToOne(() => Tenant, { onDelete: 'CASCADE' })` relation
- **Services** inject repositories via `@InjectRepository`, throw `NotFoundException` / `ConflictException` from `@nestjs/common`
- **Controllers** use `@TenantId()` decorator to extract the resolved tenant ID, `@Roles(...)` for access control, and `@ParseUUIDPipe` on UUID path params
- **Paginated responses** return `{ data: T[], meta: { total, page, limit, totalPages } }`

### Linting & Formatting

```bash
# Run ESLint
npm run lint

# Format with Prettier
npm run format
```

Ensure there are no lint errors before opening a PR.

---

## Testing

We use **Jest** for unit and e2e tests.

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npm run test:e2e

# Generate coverage report
npm run test:cov
```

### Test Requirements

- Every **service** must have a spec file with mocked repositories
- Every **controller** must have a spec file with a mocked service
- Tests must cover: happy path, `NotFoundException` (not found), `ConflictException` (duplicate) where applicable
- **All tests must pass before a PR can be merged** — no exceptions

### Test File Conventions

- Spec files live alongside the source files: `my-service.service.spec.ts`
- Use `jest.fn()` for mocks — do not use external mock libraries
- Use `Test.createTestingModule` from `@nestjs/testing`

---

## Pull Request Process

1. **Title** — follow the Conventional Commits format: `feat(module): short description`
2. **Description** — include:
   - What was added/changed and why
   - New endpoints (if any) in a table
   - Checklist: entities ✅, DTOs ✅, services ✅, controllers ✅, tests ✅, build ✅
3. **Target branch** — always target `main`
4. **All checks must pass** — build, lint, and tests
5. **At least one review** is required before merging
6. **Squash merge** preferred to keep history clean

### PR Checklist

Before requesting a review, confirm:

- [ ] Code builds with `npm run build` (zero TypeScript errors)
- [ ] All existing tests still pass (`npm test`)
- [ ] New functionality has tests
- [ ] Swagger docs are up to date (decorators added to controllers)
- [ ] README updated if new endpoints were added
- [ ] No secrets or credentials committed

---

## Project Structure

```
src/
├── auth/            # JWT auth, guards, decorators
├── badges/          # Digital badges & micro-credentials
├── common/          # Shared: BaseEntity, pagination, filters
├── competency/      # Competency tracking & progress
├── courses/         # Programs & courses
├── industry/        # Industry Partner Portal
├── instructors/     # Instructor profiles & course assignments
├── onboarding/      # School onboarding
├── schedules/       # Cohorts, class sessions
├── skills/          # Skills taxonomy engine
├── students/        # Student profiles & enrollments
├── tenants/         # Multi-tenant architecture
├── users/           # User accounts & roles
├── workplace/       # Workplace Learning Tracker
└── app.module.ts    # Root module
```

---

## Questions?

Open a [GitHub Discussion](https://github.com/KelzAce/School/discussions) or file an issue with the `question` label.
