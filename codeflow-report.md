# CodeFlow Analysis Report

**Repository:** Local Folder
**Analyzed:** 11/23/2026, 6:35:38 PM

## Summary

| Metric | Value |
|--------|-------|
| Health Score | 95/100 (A) |
| Files | 6 |
| Functions | 11 |
| Lines of Code | 2,918 |
| Dependencies | 1 |
| Unused Functions | 0 |
| Security Issues | 1 |

## Security Issues

### HIGH: XSS Vulnerability
- **File:** `assets/js/main.js`
- **Description:** Direct HTML injection can lead to XSS attacks. Sanitize user input.

## Design Patterns

### Factory
Creates objects without specifying exact class. Enables loose coupling and extensibility.

**Files:** `main.js`

### Observer/Event
Defines a subscription mechanism for event-driven architecture. Great for decoupling.

**Files:** `main.js`

## Anti-Patterns

### Long File
Files over 500 lines are harder to maintain. Consider breaking into smaller modules.

**Affected files:** `main.js`, `cv.html`

## Architecture Issues

### 1 High Complexity Files
Files with complexity score >30

**Affected:** `main.js (67)`

## File Details

| File | Folder | Layer | Lines | Functions |
|------|--------|-------|-------|----------|
| `deploy.yml` | .github/workflows | utils | 40 | 0 |
| `style.css` | assets/css | utils | 1014 | 0 |
| `main.js` | assets/js | utils | 624 | 11 |
| `cv.html` | root | utils | 561 | 0 |
| `index.html` | root | utils | 593 | 0 |
| `README.md` | root | note | 86 | 0 |
