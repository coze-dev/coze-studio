# Skill 10: DTO conventions

## Location

`domain/{X}/dto/` — domain-scoped data transfer objects used within the Domain/Service layer. **Do not** reuse API-layer Request/Response structs here.

## Layering quick map

| Type | Location | Notes |
|------|----------|------|
| API Request/Response | `backend/api/model/` | Generated from IDL; HTTP layer only |
| Domain DTO | `domain/{X}/dto/` | Service input/output |
| Domain Entity | `domain/{X}/entity/` | Rich domain object with methods |
| DAL PO | `domain/{X}/internal/dal/model/*.gen.go` | Pure DB mapping; generated |
| crossdomain Model | `crossdomain/{X}/model/` | Shared structures across domains |

See [citations.md](citations.md) for code pointers.

