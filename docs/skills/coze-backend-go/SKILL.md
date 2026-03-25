---
name: coze-backend-go
description: "Documentation of Coze Studio backend Go + DDD conventions. Use when editing `backend/`, implementing APIs (IDL-first), working with Domain/Application/Repository/DAL boundaries, generating DAL via gorm/gen, handling errno and layered errors, crossdomain calls, sessions/middleware, transactions, mocks/tests, and ID generation."
---

# Coze Studio Backend Go + DDD

This skill documents the Coze Studio backend conventions as **actionable AI-coding guidelines**: **Go practices**, **DDD layering**, **IDL-driven development**, DB reverse generation via `gorm/gen`, and Coze-specific patterns such as **domain-scoped error codes**, **space/session isolation**, and **workflow-domain conventions**.

> This skill is aligned with `coze-studio` backend **v0.5.1**. If the repository evolves (structure/codegen commands), treat the repo as the source of truth and refresh this skill accordingly.

## Emphasis

- **Go**: interface vs implementation separation, Functional Options, error-as-value, `internal` packages, `mockgen`, context propagation, and chunked batch queries.
- **DDD**: business invariants live in the Domain layer; API/Application layers orchestrate and map models only.
- **Coze conventions**: IDL-first, unified `{code,msg,data}` responses, errno ranges per domain, crossdomain interfaces, and workflow-specific error handling.
- **Multi-space (tenant-like)**: most resources are scoped by `SpaceID` and must enforce access control (user ↔ space membership) at the Application boundary; never query/update cross-space data without explicit checks.

---

## Skill 0: Architecture and layering overview

```
idl/                        ← (1) IDL definitions (Thrift)
backend/
  api/
    handler/coze/           ← (2) HTTP handlers (generated stubs + manual bodies)
    router/coze/            ← (3) Route registration (generated)
    model/                  ← (4) API request/response structs (generated)
    middleware/             ← (5) Middleware (session/auth/log/etc.)
  application/{domain}/     ← (6) Application services (orchestration only)
  domain/{domain}/
    entity/                 ← (7) Domain entities
    service/                ← (8) Domain service interfaces + implementations
    repository/             ← (9) Repository interfaces + implementations
    internal/dal/
      model/                ← (10) gorm/gen models (*.gen.go)
      query/                ← (11) gorm/gen query APIs (*.gen.go)
    dto/                    ← (12) Domain DTOs
  crossdomain/              ← (13) Cross-domain per-domain packages (ACL)
    {domain}/
      contract.go           ← cross-domain interface definitions (anti-corruption layer)
      impl/                 ← concrete implementations
      model/                ← cross-domain models (stable, avoid domain entities)
      *mock/                ← mocks (generated)
  infra/                    ← (14) Infrastructure capabilities (interface + impl/)
    {capability}/
      *.go                  ← capability interfaces/types (acts as "contract")
      entity/               ← (optional) infra-level entities/VOs
      impl/                 ← implementations (mysql/redis/nsq/...)
  types/
    ddl/                    ← (15) DB reverse-generation scripts (gen_orm_query.go)
    errno/                  ← (16) Global/domain error codes
    consts/                 ← (17) Global constants
```

Boot entry: `backend/main.go` → `application.Init(ctx)` → `router.GeneratedRegister(s)`

Cross-domain calls must go through the `crossdomain/{domain}/contract.go` interfaces instead of directly depending on other domains’ `service` packages.

---

## Documents index

| Topic | File |
|------|------|
| End-to-end “add a module” SOP | [checklist.md](checklist.md) |
| Notes and caveats | [notes.md](notes.md) |
| Code pointers (paths + line ranges) | [citations.md](citations.md) |
| Skill 1: IDL-first API design | [skill-01-idl.md](skill-01-idl.md) |
| Skill 2: DB DDL → gorm/gen DAL generation | [skill-02-dal.md](skill-02-dal.md) |
| Skill 3: Domain module structure (DDD) | [skill-03-domain.md](skill-03-domain.md) |
| Skill 4: Application layer conventions | [skill-04-application.md](skill-04-application.md) |
| Skill 5: Transaction patterns | [skill-05-transaction.md](skill-05-transaction.md) |
| Skill 6: Errno + layered validation/error handling | [skill-06-errno.md](skill-06-errno.md) |
| Skill 7: Handler conventions | [skill-07-handler.md](skill-07-handler.md) |
| Skill 8: Middleware & session conventions | [skill-08-middleware.md](skill-08-middleware.md) |
| Skill 9: crossdomain conventions | [skill-09-crossdomain.md](skill-09-crossdomain.md) |
| Skill 10: DTO conventions | [skill-10-dto.md](skill-10-dto.md) |
| Skill 11: Mocks & tests | [skill-11-mock.md](skill-11-mock.md) |
| Skill 12: ID generation rules | [skill-12-id.md](skill-12-id.md) |
| Skill 13: Mermaid flowcharts & architecture diagrams | [skill-13-flowchart-generator.md](skill-13-flowchart-generator.md) |
| Skill 14: Eino conventions | [skill-14-eino.md](skill-14-eino.md) |

