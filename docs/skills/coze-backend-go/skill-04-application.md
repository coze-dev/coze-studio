# Skill 4: Application layer conventions

## Responsibilities

- **Orchestrate** multiple Domain services; no core business logic
- Handle: API model ↔ Domain DTO mapping, crossdomain calls, event publishing
- Each Application package has an `init.go` for dependency injection and service initialization

Application services:

- Call **domain services** under `backend/domain/*/service`.
- Interact with **crossdomain contracts** under `backend/crossdomain/*/contract.go` (per-domain packages).
- Depend on **infrastructure capability interfaces** under `backend/infra/*/*.go` (never depend on `impl` directly in business code).

## Initialization chain (3 tiers)

The system is initialized in dependency order:

`basicServices` → `primaryServices` → `complexServices`

See [citations.md](citations.md) for code pointers.

