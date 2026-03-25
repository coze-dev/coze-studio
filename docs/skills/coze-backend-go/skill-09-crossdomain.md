# Skill 9: crossdomain conventions

## Purpose

When Domain A needs to call Domain B, **do not directly depend** on B’s `service` package. Instead, call through the interfaces defined under:

- `backend/crossdomain/{B}/contract.go` — cross-domain interface definitions (anti-corruption layer)
- `backend/crossdomain/{B}/impl/` — concrete implementations
- (common) `backend/crossdomain/{B}/model/` — cross-domain models (prefer stable shapes; avoid exposing Domain entities directly)
- (common) `backend/crossdomain/{B}/*mock/` — mocks (generated or handwritten, depending on the package)

## Registration

In `application.Init()`, register global singletons via `SetDefaultSVC(...)` (exact function names depend on each crossdomain package), wiring Domain services behind crossdomain contracts.

## Shape (current repo)

In `coze-studio` v0.5.1, crossdomain uses a **per-domain package** structure instead of a centralized `contract/` directory. A typical layout:

```
backend/crossdomain/{domain}/
  contract.go
  impl/
  model/
  convert/        (optional)
  {domain}mock/   (optional)
```

See [citations.md](citations.md) for code pointers.

