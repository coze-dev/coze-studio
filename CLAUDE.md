# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Coze Studio is an open-source AI agent development platform from ByteDance. It's a full-stack application with a Go backend following Domain-Driven Design principles and a React TypeScript frontend managed as a Rush.js monorepo.

## Common Development Commands

### Backend Development
```bash
# Start debug environment (middleware + server)
make debug

# Build and run server only  
make server

# Start Docker middleware services (MySQL, Redis, Elasticsearch, Milvus, MinIO, etcd, NSQ)
make middleware

# Start complete Docker environment
make web

# Clean Docker containers and volumes
make clean

# Build frontend assets
make fe
```

### Frontend Development
```bash
# Install dependencies and build all packages
rush rebuild

# Incremental build of changed packages
rush build

# Run tests across all packages
rush test

# Add dependency to a specific package
rush add --package @coze-studio/app --dev <package-name>
```

## Architecture Overview

### Backend Structure (`/backend/`)
- **Language**: Go 1.24.0 with CloudWeGo Hertz framework
- **Architecture**: Domain-Driven Design with clean architecture
- **Key layers**:
  - `api/` - HTTP handlers and routing
  - `application/` - Business logic and use cases
  - `domain/` - Core entities and domain rules
  - `infra/` - Database, cache, external service implementations
  - `crossdomain/` - Shared contracts and cross-cutting concerns
  - `pkg/` - Reusable utilities

### Frontend Structure (`/frontend/`)
- **Language**: TypeScript with React 18
- **Build System**: Rsbuild (Rspack-based bundler)
- **Monorepo**: Rush.js managing 300+ packages
- **Main app**: `apps/coze-studio/`
- **Shared packages**: `packages/` organized by domain (ui, utils, api, etc.)

### Infrastructure Stack
- **Database**: MySQL 8.4.5 (primary), Redis (cache), Elasticsearch 8.18.0 (search)
- **Vector DB**: Milvus 2.5.10 for AI features
- **Storage**: MinIO (S3-compatible)
- **Service Discovery**: etcd
- **Message Queue**: NSQ
- **AI/ML**: Eino framework with multi-provider LLM support

## Development Environment Setup

The project uses Docker Compose for local development with all required middleware services. Environment configuration is managed through `.env` files.

### Key Configuration Files
- `rush.json` - Monorepo package configuration
- `docker-compose.yml` - Development infrastructure
- `Makefile` - Build automation
- `backend/conf/` - Server configuration (model, plugin, database)

## Testing and Quality

### Frontend Testing
- Framework: Vitest
- Run: `rush test`

### Backend Testing  
- Framework: Go testing
- Integration tests use Docker containers

### Code Quality
- ESLint + Prettier for frontend
- License header validation via GitHub Actions
- Semantic PR title validation

## Key Patterns and Conventions

### Backend Patterns
- Domain-Driven Design with aggregate roots
- Repository pattern for data access
- Event-driven architecture with message queues
- Clean architecture with dependency inversion

### Frontend Patterns
- Component-based architecture with Semi Design
- Zustand for state management
- React Router for navigation
- TailwindCSS for styling
- Monorepo package organization by feature/domain

## Build and Deployment

### Local Development
1. `make middleware` - Start infrastructure services
2. `make server` - Start backend server  
3. Frontend runs via Rsbuild dev server

### Production Build
- Backend: Go binary compilation
- Frontend: Rsbuild production build
- Deployment: Kubernetes with Helm charts

## Important Notes

- The monorepo contains 300+ packages - use Rush commands for dependency management
- Backend follows strict DDD principles - respect layer boundaries
- AI functionality integrates through the Eino framework
- All services run in Docker for consistent development environment
- Database migrations handled by Atlas
- Multi-language support (English/Chinese) throughout the application