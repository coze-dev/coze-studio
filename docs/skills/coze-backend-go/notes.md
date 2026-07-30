# Notes

1. **Generated code vs handwritten code**: files under `api/router/coze/api.go`, `api/model/`, `dal/model/*.gen.go`, and `dal/query/*.gen.go` are **generated** and must **not** be edited manually. Handler function bodies, middleware bodies, the `application/` layer, and the `domain/` layer are handwritten.

2. **Framework choices**: HTTP uses [Hertz](https://github.com/cloudwego/hertz) (CloudWeGo), ORM uses gorm + `gorm/gen`, and IDL uses Apache Thrift.

3. **The Application layer is not a mandatory “classic DDD” layer**, but in this codebase it acts as the DDD Application Service: API model mapping, cross-domain orchestration, and event publishing.

4. **`internal/` packages** enforce Go access boundaries: `domain/{X}/internal/dal/` can only be used by code within the same domain module. The Application layer must not call DAL directly; it must go through repository interfaces.

5. **Batch MGet**: for bulk reads, use `slices.Chunks(ids, 20)` to chunk requests and avoid overly large `IN (...)` clauses.

6. **Go error handling**: business errors should be returned as `error` (via `errorx` + `errno`). Avoid `panic` on business paths; reserve `panic` for unrecoverable programming errors. The Application layer may use `defer` + `recover` as a final safety net and convert panics to standard error codes.

7. **Errors must carry a business code**: the Application and Domain layers must not return bare `errors.New(...)` or `fmt.Errorf(...)` for expected business errors. Use `errorx.New(errno.ErrXxx, ...)` for business errors; otherwise the Handler layer will treat it as a system error and respond with HTTP 500, which is both non-actionable and hard to distinguish from real incidents. When propagating errors, use `errorx.Wrapf` / `errorx.WrapByCode` (or `github.com/pkg/errors` Wrap/Wrapf) to preserve call context; before returning to HTTP, ensure it is converted to a status error with a proper errno code.

8. **File header comments**: new files do not need to add legacy copyright headers (this is an internal project). Keep existing headers in old files as-is.

9. **When to use `pkg/`**: small generic utilities (e.g., time/json/file/lang helpers) without business semantics and without direct external system access. Do not put DB/Redis/HTTP SDK integrations into `pkg/`; those belong to `infra/` or domain-specific adapters.

10. **Avoid reinventing wheels**: before adding “utility” code, check whether `pkg/` already provides a similar helper.

