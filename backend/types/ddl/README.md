# DDL Management

This directory contains DDL (Data Definition Language) specifications for various storage models including ORM, Cache, and MQ models. This document focuses on the management of these storage models, particularly the ORM models.

## ORM Models

ORM models are managed in two different approaches:
1. Table Models (SQL-First)
   - Database table structures are defined using SQL files
   - Better version control and migration management
   - Clear database schema history tracking

2. JSON Field Models (Code-First)
   - JSON column structures are defined using Go structs
   - Better development experience with type safety
   - Easier to maintain complex nested structures

### JSON Field Management

For tables containing JSON fields, follow these Code-First steps:

1. Manually create JSON field models in the code generation directory
2. Reference these models in `gen_orm_query.go` for table model generation

#### Directory Structure

```
backend/
└── domain/
    └── {domain}/
        └── dal/
            ├── model/          # Manually written JSON field models
            └── query/          # Generated table models and query code
```

#### Development Process

1. **Define JSON Field Models**
   - Create Go structs for JSON fields in domain's `dal/model` directory
   - Use Go struct tags to define JSON field validation and behavior
   - Follow Go naming conventions and type safety practices
   - Example: `backend/domain/agent/dal/model/single_agent.schema.go`

2. **Table Model Generation**
   - Import JSON field models in `gen_orm_query.go`
   - Reference the models in table definitions
   - Run query generation to create table models with typed JSON fields

This Code-First approach provides:
- Better type safety during development
- IDE support for code completion
- Compile-time error checking for JSON field usage

### Soft Delete Convention

All tables use GORM's built-in soft delete functionality:

- Tables include a `deleted_at` field
- GORM automatically adds `deleted_at = 0` condition to queries
- To include deleted records, use `Unscoped()` in queries

Example:
```go
// Normal query (excludes deleted records)
db.Where("id = ?", 1).Find(&user)

// Include deleted records
db.Unscoped().Where("id = ?", 1).Find(&user)
```