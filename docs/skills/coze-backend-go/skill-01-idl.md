# Skill 1: Design APIs starting from IDL (IDL-first)

## Rules

1. **All APIs start from `.thrift` files under `idl/`.**
2. Each service method’s annotations define the HTTP route, category, and generated code path.
3. `base.thrift` defines the shared `Base` (request) and `BaseResp` (response) structures.
4. Responses follow a unified `{code, msg, data}` shape and include `base.BaseResp` as the tail field.
5. **One method parameter and one return value only**, both must be custom `struct` types.
6. Request/response naming follows `{Method}Request` / `{Method}Response`.
7. Each `Request` struct must include a `Base` field (`base.Base`, field id `255`, `optional`).
8. Each `Response` struct must include a `BaseResp` field (`base.BaseResp`, field id `255`, `optional`).
9. New fields should be declared as `optional`; avoid `required` for forward compatibility.

## Codegen (Hertz `hz`)

`coze-studio` backend v0.5.1 uses `hz` (Hertz toolkit) to generate routes, handler stubs, and `api/model` structs from Thrift IDL. See `backend/.hz` for the configured output directories (handler/model/router).

Common command (run from repo root):

```bash
# Update the master IDL (aggregation/extends) generated routes + handler/model
hz update -idl idl/api.thrift -enable_extends
```

Notes:
- `idl/api.thrift` is usually the master IDL aggregating multiple services (incl. `extends`); in practice `-enable_extends` is required, otherwise route generation may be empty.
- `hz update` only needs the IDL file that defines the `service`; dependent IDLs will be generated automatically.

**IDL template** (see `plugin_develop.thrift` as reference):

```thrift
service XxxService {
    XxxResponse XxxMethod(1: XxxRequest request)
        (api.post='/api/xxx/yyy', api.category="xxx", api.gen_path="xxx")
}
struct XxxRequest {
    1: optional i64 id (api.js_conv = "str"),
    255: optional base.Base Base
}
struct XxxResponse {
    1: i64 code,
    2: string msg,
    3: XxxData data,
    255: optional base.BaseResp BaseResp
}
```

## Conventions

- Service names and method names use **camelCase**.
- Typically, one service per `.thrift` file (except for explicit aggregation via `extends`).
- APIs follow a **RESTful** style for paths; when adding new endpoints, use existing modules as a style reference instead of inventing new patterns.

## Generated code artifacts

- `backend/api/router/coze/api.go` — route registration (**generated**; do not edit)
- `backend/api/router/coze/middleware.go` — middleware stubs (can be manually filled)
- `backend/api/model/{gen_path}/` — request/response structs (**generated**)
- `backend/api/handler/coze/` — handler stubs (implement handler bodies manually)

See [citations.md](citations.md) for code pointers.

