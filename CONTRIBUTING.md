# Contributing Guidelines

Thank you for your interest in contributing to **Sorbnai**! This document will help you get started.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Getting Started

### 1. Fork and Clone

```bash
git clone https://github.com/esc-chula/sorb-nai.git

# or

git clone git@github.com:esc-chula/sorb-nai.git

cd sorb-nai
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Create Environment Variables

```bash
cp .env.example .env
# Edit values in .env as needed
```

### 4. Run Development Server

```bash
pnpm dev
```

Open browser at `http://localhost:3000`

## Development Workflow

### 1. Create a New Branch

```bash
# Update your main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:

- `feature/` - for new features
- `fix/` - for bug fixes
- `docs/` - for documentation updates
- `refactor/` - for code refactoring
- `test/` - for adding tests

### 2. Develop Feature

- Write code following [Coding Standards](#coding-standards)
- Add tests for new features
- Verify code works correctly

### 3. Check Code Quality

```bash
# Format and Lint
pnpm check

# Or run separately
pnpm format
pnpm lint

# Build to check
pnpm build
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add amazing feature"
```

See [Commit Guidelines](#commit-guidelines) for commit message format

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Avoid `any` type whenever possible
- Use Zod for runtime validation

### React Components

```typescript
// ✅ Good - use named export
export function ExamCard({ exam }: ExamCardProps) {
  // component code
}

// ❌ Bad - use default export
export default function ExamCard({ exam }: ExamCardProps) {
  // component code
}
```

### Naming Conventions

This project has clear naming conventions:

#### Variables and Functions

```typescript
// Storage variables - use "stored" prefix
const [storedId, setStoredId] = useLocalStorage('student-id', '')
const [storedExams, setStoredExams] = useLocalStorage('exams', [])

// Modal states - use "Open" suffix
const [welcomeOpen, setWelcomeOpen] = useState(false)
const [deleteOpen, setDeleteOpen] = useState(false)

// Event handlers - NO "handle" prefix
const deleteExam = () => {
  /* ... */
}
const toggleExam = () => {
  /* ... */
}
```

#### Query Functions

```typescript
// Use "Query" suffix
export const examRoomsQuery = (studentId: string) => queryOptions({...})
export const studentExamsQuery = (studentId: string) => queryOptions({...})
```

#### Types and Interfaces

```typescript
// Use domain-specific names
type ExamClass = {...}
type StudentExam = {...}
type ExamSchedule = {...}

// Interface Props use "Props" suffix
interface ExamCardProps {
  exam: StudentExam
  onDelete?: (code: string) => void
}
```

#### Files and Components

```typescript
// Component files - kebab-case
exam-card.tsx
exam-list.tsx
confirm-id-modal.tsx

// Component names - PascalCase
export function ExamCard() {...}
export function ExamList() {...}
export function ConfirmIdModal() {...}
```

### File Organization

```typescript
// 1. Imports - grouped by type
// External libraries
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// Internal utilities
import { cn } from '@/lib/utils'

// Components
import { Button } from '@/components/ui/button'
import { ExamCard } from '@/components/exam-card'

// Types
import type { ExamClass } from '@/types/class'

// 2. Types and Interfaces
interface ComponentProps {
  // ...
}

// 3. Component
export function Component({ props }: ComponentProps) {
  // 3.1 Hooks
  const [state, setState] = useState()

  // 3.2 Derived values
  const computed = useMemo(() => {}, [])

  // 3.3 Event handlers
  const handleClick = () => {}

  // 3.4 Effects
  useEffect(() => {}, [])

  // 3.5 Render
  return <div>...</div>
}
```

### CSS and Styling

- Use Tailwind CSS utility classes
- Avoid inline styles
- Use `cn()` helper for conditional classes

```typescript
// ✅ Good
<div className={cn(
  "base-classes",
  condition && "conditional-classes"
)} />

// ❌ Bad
<div style={{ color: 'red' }} />
```

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting changes (no code changes)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or modifying tests
- `chore`: Build tasks, package manager configs, etc.

### Examples

```bash
feat(exam-card): add calendar export functionality

Add buttons to export exam to Google Calendar, Apple Calendar, and Outlook.
Uses calendar-link library for generating calendar URLs.

Closes #123

---

fix(search): fix search not working with Thai characters

Update Fuse.js configuration to properly handle Thai text.

---

docs(readme): update installation instructions

---

refactor(types): simplify exam type definitions

Merge ClassInfoWithInRange into ExamClass to reduce type complexity.
```

## Pull Request Process

### Before Submitting PR

1. ✅ Run `pnpm check` and fix all errors
2. ✅ Run `pnpm build` to check TypeScript errors
3. ✅ Test your feature in browser
4. ✅ Update documentation if needed

### PR Title and Description

**Title:** Use same format as commit message

```
feat: add exam export to calendar feature
fix: search not working with Thai characters
```

**Description:** Should include:

- Summary of changes
- Reason for changes
- Screenshots (if UI changes)
- Breaking changes (if any)
- Related issues

### Template

```markdown
## What does this PR do?

Brief description of the changes.

## Why are we doing this?

Explain the motivation or problem being solved.

## Screenshots (if applicable)

[Add screenshots here]

## Checklist

- [ ] Code follows project coding standards
- [ ] Ran `pnpm check` successfully
- [ ] Built successfully with `pnpm build`
- [ ] Tested in browser
- [ ] Updated documentation if needed

## Related Issues

Closes #123
```

### Review Process

- Wait for maintainer review (may take 2-3 days)
- Respond to feedback and make requested changes
- Once approved, PR will be merged

## Reporting Issues

### Before Reporting Bug

1. Check [existing issues](https://github.com/esc-chula/sorbnai-refresh/issues) to see if already reported
2. Update to latest version
3. Try in different browser

### Report Bug

Open new issue with:

- **Title**: Clear summary of problem
- **Steps to Reproduce**: How to trigger the bug
- **Expected Result**: What should happen
- **Actual Result**: What actually happens
- **Environment**:
  - Browser and version
  - Operating System
  - Project version
- **Screenshots**: If applicable

### Propose New Feature

Open new issue with:

- **Use Case**: Who will use it and why
- **Proposed Solution**: How it should work
- **Alternatives**: Other approaches considered
- **Additional Context**: More info, screenshots, mockups, etc.

## Questions and Help

- Open [Discussion](https://github.com/esc-chula/sorbnai-refresh/discussions) for general questions
- Open [Issue](https://github.com/esc-chula//sorbnai-refresh/issues) for bugs or feature requests

## Thank You!

Thank you for taking the time to contribute to Sorbnai! 🙏

---

Made with ❤️
