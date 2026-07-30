# Skill 8: Middleware and session conventions

## Global middleware order (must not be changed casually)

```go
s.Use(middleware.ContextCacheMW())      // must be first
s.Use(middleware.RequestInspectorMW())  // must be second
s.Use(middleware.SetHostMW())
s.Use(middleware.SetLogIDMW())
s.Use(corsHandler)
s.Use(middleware.AccessLogMW())
s.Use(middleware.OpenapiAuthMW())
s.Use(middleware.SessionAuthMW())
s.Use(middleware.I18nMW())              // must be after SessionAuthMW
```

## Session access conventions

- Session data is stored in the context cache (key = `consts.SessionDataKeyInCtx`)
- Use `ctxutil.GetUIDFromCtx(ctx)` to safely get the UID (returns `*int64`)
- Use `ctxutil.MustGetUIDFromCtx(ctx)` to require the UID (panics if nil)

## Space (multi-space) authorization

- Middleware authenticates the user and injects session into context, but **space authorization is generally enforced in the Application layer** using `req.SpaceID` + user-space membership checks (e.g., `checkUserSpace` pattern in workflow application).
- Do not assume “logged-in” implies “can access any space”. For space-scoped resources, validate `uid ∈ space` before calling domain services / repositories.

See [citations.md](citations.md) for code pointers.

