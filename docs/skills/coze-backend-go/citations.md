# Citations (code pointer index)

This repository’s code changes over time. To avoid copying stale code into the docs, this file provides **file paths + line ranges** you can open on-demand.

All paths are relative to the repo root; `backend/` is the backend directory.

---

## Skill 0 / Boot and layering

| What | Path and lines |
|------|---------------|
| main entry, `application.Init`, `startHttpServer`, middleware ordering | `backend/main.go` (L43-104) |
| Route registration (generated) | `backend/api/router/coze/api.go` (L17-80) |
| `GeneratedRegister` | `backend/api/router/register.go` (L34-39) |

---

## Skill 1: IDL

| What | Path and lines |
|------|---------------|
| Base / `BaseResp`, `EmptyResp` (code+msg+data) | `idl/base.thrift` (L1-42) |
| Service methods and `api.post` / `api.gen_path` annotations | `idl/plugin/plugin_develop.thrift` (L6-50) |

---

## Skill 2: DAL generation

| What | Path and lines |
|------|---------------|
| `path2Table2Columns2Model` config | `backend/types/ddl/gen_orm_query.go` (L44-225) |
| generator main, DSN, FieldModify | `backend/types/ddl/gen_orm_query.go` (L231-326) |
| PO models (`*.gen.go`) | `backend/domain/plugin/internal/dal/model/plugin_draft.gen.go` (L1-33) |
| Query APIs (`*.gen.go`) | `backend/domain/plugin/internal/dal/query/plugin_draft.gen.go` (L1-46) |

---

## Skill 3: DDD (4 layers)

| What | Path and lines |
|------|---------------|
| Entity embeds crossdomain model | `backend/domain/plugin/entity/plugin.go` (L24-54) |
| Service interface, `//go:generate mockgen` | `backend/domain/plugin/service/service.go` (L27-92) |
| `service_impl`, `NewService` DI | `backend/domain/plugin/service/service_impl.go` (L30-65) |
| Repository interface | `backend/domain/plugin/repository/plugin_repository.go` (L27-53) |
| Functional Options (`option.go`) | `backend/domain/plugin/repository/option.go` (L23-86) |
| DAO Create, `ToDO`, `genPluginID` | `backend/domain/plugin/internal/dal/plugin_draft.go` (L39-138) |
| Keyset-pagination list | `backend/domain/plugin/internal/dal/plugin_draft.go` (L158-190) |
| MGet, `slices.Chunks` | `backend/domain/plugin/internal/dal/plugin_draft.go` (L192-212) |
| `CreateWithTX` | `backend/domain/plugin/internal/dal/plugin_draft.go` (L287-315) |
| Repository impl (holds DAO) | `backend/domain/plugin/repository/plugin_impl.go` (L45-72) |
| Transaction template (Begin/defer Rollback/Commit) | `backend/domain/plugin/repository/plugin_impl.go` (L133-170) |
| Multi-table transaction: PublishPlugin | `backend/domain/plugin/repository/plugin_impl.go` (L283-351) |
| DTO definitions | `backend/domain/plugin/dto/plugin.go` (L27-96) |
| Repository mocks | `backend/domain/plugin/repository/mock/` |

---

## Skill 4: Application

| What | Path and lines |
|------|---------------|
| Application struct, DomainSVC | `backend/application/plugin/plugin.go` (L49-59) |
| InitService and DI | `backend/application/plugin/init.go` (L38-89) |
| `basicServices` → `primaryServices` → `complexServices`, `SetDefaultSVC` | `backend/application/application.go` (L84-171) |

---

## Skill 6: Errors and handlers

| What | Path and lines |
|------|---------------|
| errno constants and range | `backend/types/errno/plugin.go` (L25-54) |
| `init`, `code.Register`, `WithAffectStability` | `backend/types/errno/plugin.go` (L56-103) |
| `StatusError` interface | `backend/pkg/errorx/error.go` (L26-36) |
| `errorx.New`, `WrapByCode`, `Wrapf` | `backend/pkg/errorx/error.go` (L54-78) |
| HTTP error response mapping | `backend/api/internal/httputil/error_resp.go` (L35-54) |
| `invalidParamRequestResponse`, `internalServerErrorResponse` | `backend/api/handler/coze/base.go` (L27-33) |
| Handler example: BindAndValidate, validation, calling Application | `backend/api/handler/coze/plugin_develop_service.go` (L34-77) |
| `GetUIDFromCtx`, `MustGetUIDFromCtx` | `backend/application/base/ctxutil/session.go` (L36-52) |
| Session auth middleware | `backend/api/middleware/session.go` (L41-75) |

---

Open the files above at the referenced line ranges. If line numbers drift due to edits, search nearby for the mentioned symbols.

