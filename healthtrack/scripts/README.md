# Automation Scripts

These scripts help automate error detection, fixing, and deployment monitoring.

## 🚀 Recommended Workflow

**This prevents deploying broken code to Vercel:**

```bash
# 1. Check for errors before pushing
npm run type-check:save

# 2. Tell Claude to fix them
"check the type errors"

# 3. Claude fixes, commits, and pushes
# 4. Vercel auto-deploys ✅

# 5. (Optional) Check Vercel deployment status
./scripts/check-vercel-status.sh
```

## Quick Start

### Option 1: Manual Check (Recommended for AI)
```bash
npm run type-check:save
```
Then say "check the type errors" to Claude - errors are saved to `type-errors.log`

### Option 2: Watch Mode
```bash
npm run type-check:watch
```
Continuously monitors and reports errors as you save files

### Option 3: Auto-Fix Loop
```bash
./scripts/auto-fix-loop.sh
```
Runs continuous monitoring and only reports when errors change

### Option 4: Check Vercel Deployment
```bash
./scripts/check-vercel-status.sh
```
Checks latest Vercel deployment status and saves error logs if failed

## Git Hooks

### Pre-Push Hook
Automatically installed! Blocks git pushes if there are TypeScript errors.

To bypass (use sparingly):
```bash
git push --no-verify
```

## NPM Scripts

- `npm run type-check` - Check for TypeScript errors
- `npm run type-check:watch` - Watch mode for continuous checking
- `npm run type-check:save` - Check and save errors to type-errors.log
- `npm run check-all` - Run both TypeScript and ESLint checks

## Workflow with Claude

1. Make your changes
2. Run `npm run type-check:save`
3. Tell Claude: "check the type errors"
4. Claude will read type-errors.log and fix issues automatically
5. Repeat until clean!

## Files

- `watch-and-fix.sh` - Basic watch mode script
- `auto-fix-loop.sh` - Advanced monitoring with change detection
- `../.git/hooks/pre-push` - Git pre-push hook
