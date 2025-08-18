# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Coze Studio is an open-source AI agent development platform with:
- **Backend**: Go microservices using CloudWeGo/Hertz framework with Domain-Driven Design (DDD)
- **Frontend**: React + TypeScript monorepo managed by Rush.js with 300+ packages
- **API**: Thrift IDL-based code generation for type-safe frontend-backend communication

## Contents

- [Prerequisites and Environment Setup](#prerequisites-and-environment-setup)
- [Quick Start](#quick-start)
- [Common Development Commands](#common-development-commands)
- [Architecture Overview](#architecture-overview)
- [Complete API Development Workflow](#complete-api-development-workflow)
- [Testing](#testing)
- [Docker and Environment](#docker-and-environment)
- [Important Notes and Troubleshooting](#important-notes-and-troubleshooting)
- [Development Checklists](#development-checklists)

## Prerequisites and Environment Setup

### Required Tools

- **Node.js**: Version 21 or greater (as required by `rush.json`)
- **pnpm**: Version 8.15.8 
- **Rush**: Version 5.147.1
- **Go**: Latest version for backend development
- **Docker & Docker Compose**: For local development environment
- **nvm** (optional): For managing Node.js versions

### Setup Commands

```bash
# Install Rush and pnpm globally
npm i -g @microsoft/rush@5.147.1 pnpm@8.15.8

# Switch Node version if needed
nvm install 21
nvm use 21

# Bootstrap monorepo from repository root
rush install
rush build
```

### Environment Files

- Docker debug environment: `docker/.env.debug` (auto-generated from `.env.debug.example`)
- Frontend stack: Rsbuild-based workflow with React 18 and React Router 6

## Quick Start

### Full Stack Development
```bash
make debug
```
- Access frontend at http://localhost:3000
- Access backend at http://localhost:8888

### Frontend Only
```bash
rush install
rush build
cd frontend/apps/coze-studio
npm run dev
```

### Backend Only
```bash
make middleware  # Start dependencies
make server      # Build and run server
```

### API Feature Development
1. Implement Thrift IDL
2. Regenerate frontend TypeScript types and clients
3. Regenerate backend Go models, handlers, routers
4. Implement application service logic
5. Run server and verify with curl
6. Wire frontend call and validate

## Common Development Commands

### Monorepo Lifecycle
```bash
# Install dependencies
rush install

# Build all packages
rush build

# Lint all packages
rush lint

# Test all packages
rush test
```

### Frontend App (frontend/apps/coze-studio)
```bash
cd frontend/apps/coze-studio

# Dev server
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Lint and test
npm run lint
npm run test
npm run test:cov
```

### Backend and Full Stack (via Makefile)
```bash
# Start full debug stack (middleware + python env + build FE if needed + build and run server)
make debug

# Build and run backend server only
make server

# Build backend binary without running
make build_server

# Start middleware only (MySQL, Redis, ES, etc.)
make middleware

# Stop and clean debug docker environment
make down
make clean
```

### Database and Tooling
```bash
# Sync database schema into running DB
make sync_db

# Dump DB schema and migrations
make dump_db

# Dump SQL schema file and copy to helm
make dump_sql_schema

# Recalculate Atlas migration hashes
make atlas-hash

# Setup Elasticsearch indices
make setup_es_index
```

### Docker Web (Optional Distribution)
```bash
# Start web docker environment
make web

# Stop web docker environment
make down_web
```

### Default Ports
- Frontend dev server: 3000
- Backend server: 8888

## Architecture Overview

### Backend (DDD with Hertz)

**Layers:**
- `api/`: HTTP layer with generated handlers and routers
- `application/`: Application services orchestrating domain logic
- `domain/`: Entities and core business rules
- `infra/`: Infrastructure adapters (DB, cache, external services)
- `crossdomain/`: Shared contracts and cross-cutting concerns
- `types/`: Shared constants and types

**Key Points:**
- Code generation via `hz` tool from Thrift IDL
- Handlers are thin and call application services
- ⚠️ Do not edit code marked with `// Code generated` comments

### Frontend (Rush Monorepo)

**Package Levels:**
- **Level 1**: Core architecture and infrastructure packages
- **Level 2**: Utilities and adapters
- **Level 3**: Business logic and UI components
- **Level 4**: Applications

**Structure:**
- Primary app: `frontend/apps/coze-studio` (using Rsbuild)
- Shared packages: `frontend/packages/`
- Configurations: `frontend/config/`
- Routing: `frontend/apps/coze-studio/src/routes.tsx` with lazy loading

### API Model

**Dual Layer Approach:**
1. **@coze-arch/bot-api**: Core internal APIs (40+ services) - **DO NOT MODIFY**
2. **@coze-studio/api-schema**: Open source extension layer - safe to add new APIs

**Code Generation:**
- Source of truth: Thrift IDL files in `idl/` directory
- Frontend: TypeScript clients generated by `idl2ts` in `frontend/packages/arch/api-schema`
- Backend: Go models, handlers, routers generated by `hz` tool

## Complete API Development Workflow

### Stage 1: Define Thrift IDL

Place files under `idl/[module_name]/[module_name].thrift`

**Required annotations:**
- Responses must include `253: required i32 code` and `254: required string msg`
- Path parameters use `(api.path="param_name")` annotation
- Service methods require `(api.post="/path")`, `(api.get="/path")`, etc.

**Naming conventions:**
- IDL: `snake_case` for fields
- Go structs: `PascalCase` fields
- Optional fields generate pointer types in Go

### Stage 2: Generate Frontend TypeScript

1. Update `frontend/packages/arch/api-schema/api.config.js`:
   ```javascript
   entries: {
     your_module: './idl/your_module/your_module.thrift',
   }
   ```

2. Generate code:
   ```bash
   cd frontend/packages/arch/api-schema
   npm run update
   ```

3. Add export in `src/index.ts`:
   ```typescript
   export * as your_module from './idl/your_module';
   ```

### Stage 3: Generate Backend Code

1. Verify router insert point in `backend/api/router/register.go`:
   ```go
   //INSERT_POINT: DO NOT DELETE THIS LINE!
   ```
   ⚠️ **No space between `//` and `INSERT_POINT`**

2. Generate with Hz:
   ```bash
   cd backend
   hz update -idl ../idl/your_module/your_module.thrift
   ```

3. Verify generated files:
   - `backend/api/model/your_module/`
   - `backend/api/handler/your_module/`
   - `backend/api/router/your_module/`

### Stage 4: Implement Business Logic

- In handlers: only bind/validate request and call application services
- Implement application service in `backend/application/`
- Fix `main.go` imports if needed
- ⚠️ Observe PascalCase and pointer types for optionals

### Stage 5: Frontend Consumption

```typescript
// Import using snake_case
import { your_module } from '@coze-studio/api-schema';

// Handle special error flow
try {
  const response = await your_module.YourMethod(params);
  // Handle success
} catch (error: any) {
  // Some 200 responses may surface in catch
  if (error.code === '200' || error.code === 200) {
    const responseData = error.response?.data;
    // Handle as success
  }
}
```

### Testing Backend Routes
```bash
# Test with curl
curl -X GET "http://localhost:8888/api/test/list"
curl -X POST "http://localhost:8888/api/test/create" \
  -H "Content-Type: application/json" \
  -d '{"title":"test","description":"desc"}'
```

## Testing

### Frontend
```bash
# All packages
rush test

# Specific app
cd frontend/apps/coze-studio
npm run test
npm run test:cov

# Linting
rush lint
cd frontend/apps/coze-studio
npm run lint
```

### Backend
```bash
# Unit tests
cd backend
go test ./...
```

### Integration Testing
```bash
# Start middleware
make middleware

# Start backend server
make server

# Manual API verification with curl at localhost:8888
```

### End-to-End Full Stack
```bash
# One-command full stack
make debug

# Or start frontend dev server separately
cd frontend/apps/coze-studio
npm run dev
```

## Docker and Environment

### Debug Compose Setup
- **Compose file**: `docker/docker-compose-debug.yml`
- **Env file**: `docker/.env.debug` (auto-created from `.env.debug.example`)

### Make Targets
```bash
# Start middleware services
make middleware

# Start full debug environment
make debug

# Start server only
make server

# Stop debug environment
make down

# Clean volumes
make clean
```

### Database Migration and Schema
```bash
# Sync DB schema
make sync_db

# Dump DB migrations
make dump_db

# Dump schema SQL for MySQL and copy to helm
make dump_sql_schema
```

### Elasticsearch
```bash
# Setup indices
make setup_es_index
```

### Static Resources
The backend binary serves static resources under `bin/resources/static/` when frontend is built by `make fe` (invoked automatically by `make server` if needed).

## Important Notes and Troubleshooting

### Critical Rules
- ⚠️ **Do not edit generated code** marked with `// Code generated` comments
- ⚠️ **Do not modify @coze-arch/bot-api** - use @coze-studio/api-schema for extensions
- ⚠️ **Node version must be 21+** per rush.json requirements

### Common Issues

**Frontend Import Errors:**
- Module import names use `snake_case`: `import { your_module }` not `import { yourModule }`
- Incorrect import casing causes undefined errors

**Backend Router Issues:**
- INSERT_POINT format: `//INSERT_POINT: DO NOT DELETE THIS LINE!` (no spaces)
- Hz generated routes may need parameter format verification for Hertz

**Big Integer Precision (JavaScript):**
- Prefer strings for `i64` in IDL with `(api.js_conv='true',agw.js_conv="str")` annotations
- Avoid `parseInt()` on large IDs on frontend
- Convert to int64 on backend using `strconv.ParseInt()` with error handling

**API Response Handling:**
- Some successful responses may surface in catch blocks
- Check `error.code` for `'200'` or `200` and extract `error.response.data`

**Path Parameters:**
- DELETE and PUT with path parameters may need additional debugging on frontend client

## Development Checklists

### IDL Checklist
- [ ] File path and namespace correct
- [ ] Response fields include `253: code` and `254: msg`
- [ ] Path parameters annotated with `(api.path="name")`
- [ ] Big integer fields use string conversions where needed

### Frontend Generation Checklist
- [ ] `api.config.js` updated with new entry
- [ ] `npm run update` succeeds
- [ ] `src/index.ts` exports new module
- [ ] Import with `snake_case` naming
- [ ] Avoid `parseInt()` for large IDs

### Backend Generation Checklist
- [ ] `INSERT_POINT` comment format verified
- [ ] `hz update` succeeds and router registered
- [ ] Handlers only bind/validate and delegate to application services
- [ ] `main.go` router registration import correct

### Runtime Checklist
- [ ] Node version is 21 or greater
- [ ] Frontend dev server reachable on port 3000
- [ ] Backend reachable on port 8888
- [ ] `make middleware` services healthy

## Key File Locations

- API configuration: `frontend/packages/arch/api-schema/api.config.js`
- Router registration: `backend/api/router/register.go`
- Docker compose: `docker/docker-compose-debug.yml`
- Main build targets: `Makefile`
- Rush configuration: `rush.json`
