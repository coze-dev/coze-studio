# Skill 12: ID generation conventions

- All business IDs are generated via `infra/idgen.IDGenerator` (Snowflake; distributed unique)
- ID type is unified as `int64`
- In IDL, any `i64` ID field must add `api.js_conv = "str"` (JavaScript numeric precision)
- ID generation must avoid reserved product IDs (see the retry logic of `genPluginID` in `dal/plugin_draft.go`)

See [citations.md](citations.md) for code pointers.

