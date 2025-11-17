# Claude Code Configuration

This directory contains Claude Code configuration for the Casino Wheel Game project.

## Files

### `rules.md`
Project-specific rules and guidelines that Claude Code will follow automatically. This file serves as "memory" for documentation requirements.

**What it does:**
- Reminds Claude to update documentation with every code change
- Provides a clear mapping of code changes → documentation updates
- Enforces documentation-first development culture

### `commands/update-docs.md`
Custom slash command for documentation updates.

**Usage:**
```
/update-docs
```

**What it does:**
- Analyzes your current git changes
- Identifies which documentation files need updates
- Guides you through updating each relevant file
- Ensures nothing is missed before commit

## How It Works

1. **Automatic Enforcement**: The `rules.md` file is automatically loaded by Claude Code and acts as persistent context
2. **Slash Command**: Use `/update-docs` when ready to document your changes
3. **Pre-Commit Hook**: `.git/hooks/pre-commit` blocks commits without documentation
4. **Complete Coverage**: Together, these ensure documentation is always up-to-date

## Workflow

```bash
# 1. Make code changes
vim app/api/new-feature/route.ts

# 2. Use Claude to update docs
# In Claude Code: /update-docs

# 3. Stage everything
git add app/api/new-feature/route.ts PRD.md README.md

# 4. Commit (pre-commit hook will verify)
git commit -m "feat: Add new feature"
# ✅ Pre-commit hook passes because docs are included
```

## Documentation Files

| File | When to Update |
|------|----------------|
| **PRD.md** | Features, APIs, database, requirements |
| **GAME_FLOW.md** | Game logic, flows, state management |
| **TECHNICAL_ARCHITECTURE.md** | Architecture, data flow, components |
| **PROJECT_STRUCTURE.md** | File structure, new files/folders |
| **IMPLEMENTATION_CHECKLIST.md** | Setup steps, deployment |
| **README.md** | Quick start, API reference, troubleshooting |

## Enforcement Layers

1. **Claude Code Rules** (`rules.md`) - Proactive reminder during development
2. **Slash Command** (`/update-docs`) - Guided documentation updates
3. **Pre-Commit Hook** (`.git/hooks/pre-commit`) - Blocks undocumented changes
4. **Contributing Guidelines** (`CONTRIBUTING.md`) - Team standards

## Benefits

- ✅ **Never forget to update docs** - Multiple reminders and enforcement points
- ✅ **Consistent documentation** - Clear guidelines on what to update
- ✅ **Reduced review time** - Documentation always included in PRs
- ✅ **Better onboarding** - Docs stay current with code
- ✅ **Fewer bugs** - Requirements and implementation stay in sync

## Customization

To modify documentation rules:
1. Edit `rules.md` to change requirements
2. Update `commands/update-docs.md` to change the update workflow
3. Modify `.git/hooks/pre-commit` to change enforcement behavior

## Support

For questions about Claude Code configuration:
- Read `CONTRIBUTING.md` for contribution guidelines
- Check `.claude/rules.md` for project-specific rules
- Use `/update-docs` command for guided documentation updates
