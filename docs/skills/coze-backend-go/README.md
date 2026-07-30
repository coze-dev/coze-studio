## Coze Backend Go + DDD - Skill

This is the Coze Studio backend engineering conventions

### What this skill covers

- **IDL-first API design** (Thrift → Hertz codegen)
- **DDD layering boundaries** (Handler / Application / Domain / Repository / DAL)
- **DB DDL → `gorm/gen` reverse generation**
- **Domain-scoped error codes (errno)** and layered error-handling rules
- **crossdomain** interface-based calls
- **Middleware and session** conventions
- **Transactions**, **mocks/tests**, and **ID generation**

### Files

- Entry: `SKILL.md`
- SOP: `checklist.md`
- Notes: `notes.md`
- Code pointers: `citations.md`
- Detailed topics: `skill-01-*.md` … `skill-13-*.md`

### How to use

This is a **tool-agnostic** prompt+documentation bundle. You can install it in either:

- **Project-level**: put this directory anywhere inside the target repo, then point your AI coding tool to load it as repository knowledge/instructions.
- **Global-level**: store it in your personal prompt library, and attach/reference it when working on `coze-studio/backend`.

### Common tool setups (optional)

Assume you vendor these skills under `docs/skills/` in your repository (for example: `docs/skills/coze-backend-go/`).

#### Cursor

Project root:

```bash
mkdir -p .cursor && ln -snf ../docs/skills .cursor/skills
```

Windows: copy to `.cursor/skills/` instead of symlink.

#### Claude Code

Project root:

```bash
mkdir -p .claude && ln -snf ../docs/skills .claude/skills
```

Windows: copy to `.claude/skills/` instead of symlink.

#### Codex

Copy the skill directory into your global skills home, then restart your tool:

```bash
cp -r docs/skills/coze-backend-go "$CODEX_HOME/skills/"
```

If you have multiple skills, copy multiple subdirectories.

Suggested trigger keywords (when asking an AI coding tool for help):
"backend", "DDD", "IDL", "Thrift", "errno", "gorm/gen", "DAL", "crossdomain", "middleware", "session", "transaction", etc.

### Alignment with official standards

This skill is derived from:

- The official Coze Studio [Development Standards](https://github.com/coze-dev/coze-studio/wiki/7.-Development-Standards)
- The actual structure and code of this repository

Where they differ, this skill follows **the real repository** (for example, using `mockgen` for Go mocks rather than introducing other mock libraries).

