# Project Documentation Rules

## 🚨 CRITICAL: Documentation MUST Be Updated With Code Changes

**This is a hard requirement for this project.** Every code change MUST be accompanied by documentation updates.

### When Making Changes

Before committing ANY code changes, you MUST:

1. **Identify affected documentation** based on the change type
2. **Update all relevant documentation files** (see table below)
3. **Verify accuracy** - documentation must match the code exactly
4. **Stage documentation files** along with code changes

### Documentation Update Matrix

| Code Change | Required Documentation Updates |
|-------------|-------------------------------|
| **API Routes** (`app/api/**`) | → PRD.md (Section 5), README.md (API Reference) |
| **Database/Schema** (`supabase/**`, schema changes) | → PRD.md (Section 4), TECHNICAL_ARCHITECTURE.md |
| **Game Logic** (carousel, spin, queue, winners) | → GAME_FLOW.md, PRD.md (Section 3) |
| **Components** (`components/**`) | → TECHNICAL_ARCHITECTURE.md, PROJECT_STRUCTURE.md |
| **New Files/Folders** | → PROJECT_STRUCTURE.md |
| **Setup/Deployment** | → README.md, IMPLEMENTATION_CHECKLIST.md |
| **Dependencies** (package.json) | → README.md (Tech Stack), IMPLEMENTATION_CHECKLIST.md |
| **Config Files** (.env, next.config) | → README.md (Setup) |

### Workflow for Code Changes

```
1. Make code changes
2. Review what was changed (git status, git diff)
3. Update relevant documentation files
4. Stage both code AND documentation (git add)
5. Commit with descriptive message
6. Pre-commit hook will verify documentation is included
```

### Available Commands

- `/update-docs` - Automated documentation update assistant
  - Analyzes your changes
  - Identifies required documentation updates
  - Helps update all relevant files

### Pre-Commit Hook

A pre-commit hook is installed that will:
- ✅ **Block commits** if code changes lack documentation
- ✅ **Show which docs** need to be updated
- ✅ **Provide clear guidance** on what to update

**Cannot be bypassed** (unless using `--no-verify`, which is discouraged)

### Documentation Files

| File | Purpose |
|------|---------|
| **PRD.md** | Complete product requirements, features, APIs, database schema |
| **GAME_FLOW.md** | Visual flows, game logic, state management |
| **TECHNICAL_ARCHITECTURE.md** | System architecture, data flow, component structure |
| **PROJECT_STRUCTURE.md** | File/folder organization, naming conventions |
| **IMPLEMENTATION_CHECKLIST.md** | Step-by-step setup and deployment guide |
| **README.md** | Quick start, API reference, troubleshooting |

## Best Practices

1. **Update docs as you code** - Don't wait until the end
2. **Be specific and accurate** - Include code examples that match implementation
3. **Test documentation** - Verify examples and instructions actually work
4. **Keep it current** - Documentation should always reflect the latest code

## Remember

> **"Undocumented code is incomplete code."**
>
> Every feature, API change, or structural modification MUST be documented before the PR is created.

---

**These rules are enforced by:**
- Pre-commit hook (`.git/hooks/pre-commit`)
- Code review process
- Contributing guidelines (`CONTRIBUTING.md`)
