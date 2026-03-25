# End-to-end Development Checklist (AI Coding SOP)

```
Full steps to add a new feature/module:

Step 1: Database DDL
  - Create/upgrade tables in the test database (DDL/DDL_UPGRADE)
  - Add mapping in types/ddl/gen_orm_query.go: path2Table2Columns2Model
  - Run: go run types/ddl/gen_orm_query.go (requires MYSQL_DSN env var)
  - Generates:
      domain/{X}/internal/dal/model/*.gen.go
      domain/{X}/internal/dal/query/*.gen.go

Step 2: IDL definition
  - Define Service/Request/Response in idl/{module}/*.thrift
  - Run Hertz codegen (repo uses `hz`, see `backend/.hz`):
      - `hz update -idl idl/api.thrift -enable_extends`
      - Note: `-enable_extends` is critical for the master entry `idl/api.thrift` (otherwise route generation may be empty). See coze-studio issue #372.
  - Generates:
      api/router/coze/api.go (routes)
      api/model/{gen_path}/*.go (API structs)
      api/handler/coze/{service}_service.go (handler stubs)

Step 3: Domain layer implementation
  - entity/          domain entities (embed crossdomain model + domain methods)
  - dto/             service input/output DTOs (domain-scoped)
  - service/
      - service.go          Service interface (with //go:generate mockgen)
      - service_impl.go     impl struct + NewService (dependency injection)
      - {feature}.go        split by responsibility (multiple files)
  - repository/
      - {X}_repository.go   Repository interface
      - {X}_impl.go         implementation (holds DAL/DAO)
      - option.go           Functional Options (field projection)
  - internal/dal/
      - {table}.go          DAO implementation (CRUD + WithTX variants)

Step 4: Register errno
  - Add error-code constants in types/errno/{domain}.go (allocate within range)
  - Register in init(): code.Register(...)

Step 5: Application layer
  - application/{X}/init.go     InitService + dependency injection
  - application/{X}/*.go        orchestrate, call Domain services

Step 6: Implement handler bodies
  - api/handler/coze/{service}_service.go  fill handler function bodies

Step 7: Register crossdomain (if needed)
  - crossdomain/{X}/ define interface contracts
  - application/application.go SetDefaultSVC(...)
```

