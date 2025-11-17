---
description: "Review changes and update all relevant documentation files before committing"
---

# Documentation Update Assistant

You are helping to update project documentation before a commit. Follow these steps:

## Step 1: Analyze Changes

First, check what files have been modified:
- Run `git status` to see staged and unstaged changes
- Run `git diff` to see the actual changes
- Identify which areas of the codebase were affected

## Step 2: Determine Required Documentation Updates

Based on the changes, determine which documentation files need updates:

| Changed Area | Documentation to Update |
|--------------|------------------------|
| **app/api/** routes | PRD.md (Section 5: APIs), README.md (API Reference) |
| **Database/schema** | PRD.md (Section 4: Database), TECHNICAL_ARCHITECTURE.md |
| **Game logic** (spin, queue, carousel) | GAME_FLOW.md, PRD.md (Section 3: Features) |
| **Components** (new/modified) | TECHNICAL_ARCHITECTURE.md, PROJECT_STRUCTURE.md |
| **File structure** (new files/folders) | PROJECT_STRUCTURE.md |
| **Setup/deployment** | README.md, IMPLEMENTATION_CHECKLIST.md |
| **Dependencies** (package.json) | README.md, IMPLEMENTATION_CHECKLIST.md |
| **Configuration** (env, next.config) | README.md |

## Step 3: Update Documentation Files

For each required documentation file:

1. **Read the current version** of the documentation file
2. **Identify sections** that need updates
3. **Update the content** to reflect the changes
4. **Verify accuracy** - ensure examples, code snippets, and descriptions match the actual code

## Step 4: Review Checklist

Before finishing, verify:
- [ ] All affected documentation files identified
- [ ] Each file updated with accurate information
- [ ] Code examples in docs match actual implementation
- [ ] API endpoints documented with request/response examples
- [ ] Database schema changes reflected in PRD.md
- [ ] File structure changes reflected in PROJECT_STRUCTURE.md
- [ ] Game flow diagrams/descriptions updated if logic changed

## Step 5: Stage Documentation Files

After updating documentation:
```bash
git add PRD.md GAME_FLOW.md TECHNICAL_ARCHITECTURE.md PROJECT_STRUCTURE.md IMPLEMENTATION_CHECKLIST.md README.md
```

## Important Notes

- **Be thorough** - Don't skip documentation files
- **Be accurate** - Documentation must match the actual code
- **Be specific** - Include concrete examples and details
- **Be consistent** - Follow the existing documentation style

Now, analyze the current changes and update all relevant documentation files.
