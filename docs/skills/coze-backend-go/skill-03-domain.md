# Skill 3: Domain module structure (DDD)

**Principle**: business invariants and domain logic live in the Domain layer (Entity/Service/Repository). API and Application layers only do binding/validation, orchestration, and model mapping — they must not own business rules.

---

## Entity (domain entity)

- **Path**: `domain/{X}/entity/`
- Encapsulates domain objects, **not DB schemas**; contains domain behavior and invariants
- Common pattern: embed a crossdomain model, then add domain-specific methods; if legacy DB fields exist, gradually converge toward proper boundaries

## Service (domain service)

- **Path**: `domain/{X}/service/`
- `service.go` defines the **interface** (with `//go:generate mockgen`)
- Implementation can be a private `impl` struct + `NewXxx(...)` constructor (DI), or returned from repository wiring depending on the domain’s conventions
- Split business logic across multiple files by responsibility (e.g., `aggregation.go`, `workflow.go`, `message_extraction.go`)

## Repository

- **Path**: `domain/{X}/repository/`
- Defines repository **interfaces**
- **Implementation options** (follow each domain’s reality):
  - Provide `impl` under `repository/` holding DAO(s), or
  - `NewXxxRepository(...)` returns a DAO from `internal/dal/` directly
- Optional:
  - `option.go` uses **Functional Options** to control field projection
  - `mock/` stores `mockgen` outputs

## DAL (data access layer)

- **Path**: `domain/{X}/internal/dal/`
- Used by Repository; should not be accessed directly by higher layers
- Each DAL struct focuses on a single table or a single storage category
- Internally uses `gorm/gen` model/query; perform PO → domain conversions where needed
- Large listings should use **keyset/cursor-based pagination** (avoid deep `offset`)

The Domain layer talks to:

- **Cross-domain contracts** via `backend/crossdomain/{Y}/contract.go` (per-domain packages; never depend on other domains’ `service` packages directly).
- **Infrastructure capabilities** via interfaces under `backend/infra/{capability}/*.go` (implementations usually live in `backend/infra/{capability}/impl/`; business code should not depend on concrete impl packages).

See [citations.md](citations.md) for code pointers.

