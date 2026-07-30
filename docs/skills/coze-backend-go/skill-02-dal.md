# Skill 2: Database DDL → reverse-generate DAL via `gorm/gen`

## Flow

```
1) Create/upgrade tables in the test database (DDL/DDL_UPGRADE)
2) Run backend/types/ddl/gen_orm_query.go
3) Auto-generates:
   domain/{X}/internal/dal/model/*.gen.go   ← PO structs
   domain/{X}/internal/dal/query/*.gen.go   ← type-safe query API
```

## Configuration

In `gen_orm_query.go`, the `path2Table2Columns2Model` mapping controls generation:
- **key**: destination path (e.g., `domain/xxx/internal/dal/query`)
- **value**: table → JSON column → Go type mapping (used to deserialize JSON columns to strong types)

## Key details

- `deleted_at` uses `gorm.DeletedAt` (soft delete)
- `created_at` / `updated_at` use millisecond timestamps (`autoCreateTime:milli` / `autoUpdateTime:milli`)
- JSON columns use `gen.FieldModify` to specify the serialization type and the `serializer:json` tag
- DSN is read from `MYSQL_DSN` (default `root:root@tcp(localhost:3306)/opencoze`)

See [citations.md](citations.md) for code pointers.

