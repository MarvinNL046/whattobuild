---
description: Review code changes for quality, security, and best practices
argument-hint: [file or directory to review]
---

# Review

Perform a code review on the specified files or recent changes.

## Variables

REVIEW_TARGET: $ARGUMENTS

## Workflow

1. If no `REVIEW_TARGET`, review recent git changes.
2. Analyze code for issues.
3. Check security, performance, and best practices.
4. Provide actionable feedback.

## Review Checklist

- [ ] **Correctness**: Does the code do what it should?
- [ ] **Security**: Any vulnerabilities? Input validation?
- [ ] **Performance**: Any bottlenecks? Unnecessary re-renders? Missing caching?
- [ ] **Readability**: Is the code clear and maintainable?
- [ ] **Error Handling**: Are errors handled properly?
- [ ] **Types**: Full TypeScript types, no `any`?
- [ ] **Optimistic Updates**: Are mutations using optimistic patterns?

## Performance Checks (WhatToBuild specific)

- Convex queries using proper indexes
- No unnecessary re-fetches
- Optimistic updates on mutations
- Proper use of React.memo / useMemo where needed
- Bundle size impact

## Report

```
## Code Review

**Target**: [file/directory]
**Status**: APPROVED | CHANGES REQUESTED

### Summary
[1-2 sentences]

### Critical Issues
- [file:line] - [issue]

### Warnings
- [file:line] - [warning]

### Suggestions
- [file:line] - [suggestion]

### Performance: [OK/CONCERNS]
### Quality Score: [X/10]
```
