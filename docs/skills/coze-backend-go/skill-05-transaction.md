# Skill 5: Transaction conventions

## Standard transaction template

```go
tx := p.query.Begin()
if tx.Error != nil { return tx.Error }
defer func() {
    if r := recover(); r != nil {
        tx.Rollback(); err = fmt.Errorf("catch panic: %v\nstack=%s", r, debug.Stack()); return
    }
    if err != nil { tx.Rollback() }
}()
// ... business operations via WithTX(ctx, tx, ...) ...
return tx.Commit()
```

## DAL must provide both variants

- `Create(ctx, entity)` — standalone transaction
- `CreateWithTX(ctx, tx, entity)` — participate in an external transaction

See [citations.md](citations.md) for code pointers.

