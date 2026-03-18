# Skill 14: Eino (CloudWeGo) conventions (v0.5.1)

## When you will touch Eino

In `coze-studio/backend`, Eino is mainly used for:

- **Streaming production/consumption**: `schema.StreamReader`, `schema.Message`, etc. (e.g., agent streaming events, conversation messages).
- **LLM/Embedding/RAG component abstractions**: `components/model`, `components/embedding`, `components/retriever/indexer`, etc.
- **Composition / workflow execution**: workflow domain uses `compose`, `schema`, etc. for node execution and callbacks.

## Code distribution (practical buckets)

- `backend/domain/workflow/**`: the heaviest usage (node execution, stream, compose, callbacks, schema).
- `backend/domain/agent/**`, `backend/domain/conversation/**`, `backend/domain/knowledge/**`: message/execution/retrieval-related code often references `schema`.
- `backend/infra/embedding/**`, `backend/infra/document/**`: Eino-ext component wrappers, RAG retrieval/parsing pipelines, etc.
- `backend/internal/mock/**`, `backend/domain/**/varmock/**`: mocks/tests around Eino-related interfaces/objects.

## Conventions & boundaries

- **Treat Eino as a component/protocol layer**: when Domain/Application uses Eino `schema`/interfaces, prefer existing project wrappers (e.g., `infra/embedding`, `bizpkg/llm`, or domain-level adapters) rather than assembling complex chains in handlers.
- **Avoid leaking complex Eino compositions through crossdomain**: crossdomain `contract.go` should expose stable business interfaces; inputs/outputs may carry necessary `schema.Message`/`StreamReader`, but do not leak Domain-internal node/compose structures.
- **Testability first**: depend on interfaces for external dependencies (models/embedding/retrieval), generate mocks under `internal/mock` (or domain mock dirs), and avoid `new`-ing concrete providers in business code.

> Note: this skill is about *where to put code* and *how to keep it testable* in this repo, not a full Eino API tutorial. For `hz`/Eino details, defer to CloudWeGo official docs.

