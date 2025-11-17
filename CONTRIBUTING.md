# Contributing Guidelines

## 📋 Overview

This document provides guidelines for contributing to the Casino Wheel Game project. Following these guidelines ensures consistency, maintainability, and clear documentation.

---

## 🚨 Critical Rules

### 1. Documentation MUST Be Updated Before Every PR

**This is non-negotiable.** Before creating any pull request, you must:

1. Review all changes you've made
2. Update **ALL** relevant documentation files
3. Ensure documentation accurately reflects the current state
4. Test that all examples still work

### 2. Documentation Files to Check

For **ANY** change, review these files and update if affected:

| File | When to Update |
|------|----------------|
| **PRD.md** | Changes to features, APIs, database, requirements, game logic |
| **GAME_FLOW.md** | Changes to game flow, queue logic, win determination, modals |
| **TECHNICAL_ARCHITECTURE.md** | Changes to architecture, data flow, components, API structure |
| **PROJECT_STRUCTURE.md** | New files/folders, restructuring, new components, utilities |
| **IMPLEMENTATION_CHECKLIST.md** | Changes to setup steps, deployment process, dependencies |
| **README.md** | Changes to setup, API endpoints, deployment, troubleshooting |

### 3. Automated Documentation Enforcement

A **pre-commit hook** is installed in `.git/hooks/pre-commit` that automatically checks for documentation updates:

- **Detects code changes** - API routes, database schemas, components, game logic, etc.
- **Checks for documentation updates** - Ensures relevant docs are staged for commit
- **Blocks commits** if required documentation is missing
- **Provides clear feedback** on what needs to be updated

**To bypass the hook (not recommended):**
```bash
git commit --no-verify
```

**The hook will:**
✅ Allow commits with only documentation changes
✅ Allow commits when all required docs are updated
❌ Block commits when code changes lack documentation
⚠️  Warn about recommended documentation updates

---

## ✅ Pre-PR Checklist

Before submitting a pull request, complete this checklist:

### Code Changes
- [ ] All new code follows TypeScript best practices
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] Code is properly formatted (`npm run format`)
- [ ] All functions have proper type annotations
- [ ] Console.logs removed (except intentional logging)

### Testing
- [ ] Manually tested all changed features
- [ ] Tested on multiple screen sizes (mobile, tablet, desktop)
- [ ] Tested edge cases
- [ ] No browser console errors
- [ ] API endpoints tested (if changed)

### Documentation
- [ ] **PRD.md** updated (if applicable)
- [ ] **GAME_FLOW.md** updated (if applicable)
- [ ] **TECHNICAL_ARCHITECTURE.md** updated (if applicable)
- [ ] **PROJECT_STRUCTURE.md** updated (if applicable)
- [ ] **IMPLEMENTATION_CHECKLIST.md** updated (if applicable)
- [ ] **README.md** updated (if applicable)
- [ ] Code comments added for complex logic
- [ ] API changes documented

### Database
- [ ] Migration file created (if schema changed)
- [ ] Migration tested locally
- [ ] PRD.md database schema section updated

### Git
- [ ] Commit messages are descriptive
- [ ] No sensitive data in commits
- [ ] .env files not committed
- [ ] Branch name follows convention: `feature/description` or `fix/description`

---

## 📝 Commit Message Guidelines

Use clear, descriptive commit messages:

### Format
```
<type>: <short description>

<optional longer description>
<optional breaking changes>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring without changing functionality
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples
```bash
# Good
git commit -m "feat: Add queue processing for multiple concurrent players"
git commit -m "fix: Resolve GSAP animation stutter on mobile devices"
git commit -m "docs: Update PRD.md with new API endpoints"

# Bad
git commit -m "updates"
git commit -m "fix stuff"
git commit -m "changes"
```

---

## 🎯 Development Workflow

### 1. Before Starting Work

1. Pull latest changes from main branch
2. Create a new feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Review relevant documentation to understand current architecture

### 2. During Development

1. Make incremental commits
2. Test frequently
3. Update documentation as you go (don't wait until the end)
4. Keep PRD.md and other docs in sync with code

### 3. Before Creating PR

1. Complete the [Pre-PR Checklist](#-pre-pr-checklist)
2. Review all your changes one more time
3. Update documentation
4. Test everything again
5. Write a descriptive PR description

### 4. PR Description Template

```markdown
## What Changed
Brief description of what you changed.

## Why
Explanation of why this change was needed.

## How to Test
1. Step-by-step testing instructions
2. Expected behavior
3. Edge cases to check

## Documentation Updated
- [x] PRD.md
- [x] GAME_FLOW.md
- [ ] TECHNICAL_ARCHITECTURE.md (not affected)
- [ ] PROJECT_STRUCTURE.md (not affected)
- [ ] IMPLEMENTATION_CHECKLIST.md (not affected)
- [x] README.md

## Screenshots (if UI changes)
[Add screenshots here]

## Breaking Changes
List any breaking changes and migration steps.
```

---

## 🏗️ Code Style Guidelines

### TypeScript

```typescript
// ✅ Good: Explicit types, clear naming
interface GameSettings {
  sliderItemCount: number;
  spinCountToWin: number;
  minPointsForPlay: number;
  headlineText: string;
}

async function getSettings(): Promise<GameSettings> {
  // Implementation
}

// ❌ Bad: No types, unclear naming
async function get() {
  // Implementation
}
```

### React Components

```typescript
// ✅ Good: Typed props, clear component name
interface GameSliderProps {
  items: SliderItem[];
  onSpinComplete: (result: SpinResult) => void;
}

export function GameSlider({ items, onSpinComplete }: GameSliderProps) {
  // Implementation
}

// ❌ Bad: No types, unclear
export function Slider({ items, onComplete }) {
  // Implementation
}
```

### API Routes

```typescript
// ✅ Good: Validation, error handling, types
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate
    if (!body.username || !body.points) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Process
    const result = await processGame(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Game API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ❌ Bad: No validation, no error handling
export async function POST(req: Request) {
  const body = await req.json();
  const result = await processGame(body);
  return NextResponse.json(result);
}
```

---

## 🗂️ File Organization

### New Files

When creating new files, follow this structure:

1. Place in appropriate directory (see PROJECT_STRUCTURE.md)
2. Use proper naming convention
3. Add to PROJECT_STRUCTURE.md documentation

### Component Files

```typescript
// ComponentName.tsx structure:

'use client'; // If needed

// 1. Imports
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

// 2. Types/Interfaces
interface ComponentNameProps {
  // Props
}

// 3. Component
export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // 3a. State
  const [state, setState] = useState();

  // 3b. Effects
  useEffect(() => {
    // Effect
  }, []);

  // 3c. Handlers
  const handleClick = () => {
    // Handler
  };

  // 3d. Render
  return (
    // JSX
  );
}
```

---

## 🐛 Bug Fixes

When fixing bugs:

1. **Understand the root cause** - Don't just patch symptoms
2. **Write a test** - Prevent regression
3. **Update documentation** - If behavior changed
4. **Document the fix** - Explain what was wrong and how you fixed it

### Bug Fix PR Template

```markdown
## Bug Description
What was the bug? What was the expected vs actual behavior?

## Root Cause
What caused the bug?

## Fix
How did you fix it?

## Test Plan
How to verify the fix works?

## Documentation Updated
- [ ] Added code comments explaining the fix
- [ ] Updated relevant documentation files
```

---

## ⚠️ Important Reminders

### UI Changes

**🚨 TODO Before Production:**
- Remove the manual "Spin" button from homepage bottom
- Game should be triggered primarily via API
- Keep admin testing tools in `/admin` only

### Database Changes

- **Always** create migration files for schema changes
- **Never** modify existing migrations
- **Always** test migrations on a local database first
- **Update** PRD.md database schema section

### Environment Variables

- **Never** commit `.env.local`
- **Always** update `.env.example` when adding new variables
- **Always** document new variables in README.md

### API Changes

When changing APIs:
1. Update PRD.md Section 5 (APIs)
2. Update README.md API Reference section
3. Update any example requests
4. Consider backward compatibility

---

## 🔒 Security Checklist

Before every PR, verify:

- [ ] No sensitive data in code or commits
- [ ] Input validation on all API endpoints
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention (sanitize user input)
- [ ] CORS properly configured
- [ ] Environment variables used for secrets
- [ ] No API keys or tokens in code

---

## 📊 Performance Guidelines

- Use `'use client'` directive only when necessary
- Prefer server components when possible
- Lazy load heavy components
- Optimize images (use Next.js Image component)
- Minimize bundle size
- Cache frequently accessed data

---

## 🧪 Testing Guidelines

### Manual Testing Required

Before submitting PR, manually test:

1. **Game Flow**
   - [ ] API request adds user to queue
   - [ ] Player modal shows for 2 seconds
   - [ ] Slider animates smoothly
   - [ ] Winning spin selects random product
   - [ ] Winner modal shows for 5 seconds
   - [ ] Leaderboard updates

2. **Admin Panel**
   - [ ] Product upload to R2
   - [ ] Product CRUD operations
   - [ ] Settings update
   - [ ] Winners pagination

3. **Edge Cases**
   - [ ] No active products
   - [ ] Empty queue
   - [ ] Invalid API requests
   - [ ] Concurrent requests

### Automated Tests (Future)

When implementing tests:
- Unit tests for utilities
- Integration tests for API routes
- E2E tests for critical flows

---

## 📞 Getting Help

If you're unsure about:
- **Architecture decisions** → Review TECHNICAL_ARCHITECTURE.md
- **Implementation steps** → Check IMPLEMENTATION_CHECKLIST.md
- **Game logic** → See GAME_FLOW.md
- **Project structure** → Refer to PROJECT_STRUCTURE.md
- **Requirements** → Read PRD.md

---

## ✨ Best Practices

1. **Code Quality**
   - Write self-documenting code
   - Use meaningful variable names
   - Keep functions small and focused
   - Follow DRY (Don't Repeat Yourself)

2. **Documentation**
   - Update docs as you code, not after
   - Be specific in documentation
   - Include examples
   - Keep diagrams current

3. **Git Hygiene**
   - Small, focused commits
   - Descriptive commit messages
   - Keep PRs manageable in size
   - Rebase before creating PR

4. **Communication**
   - Ask questions early
   - Explain complex logic
   - Document decisions
   - Share knowledge

---

## 🎉 Thank You!

Following these guidelines helps maintain a high-quality, well-documented codebase. Your attention to documentation and code quality is appreciated!

Remember: **Documentation is not optional—it's a core part of every feature.**
