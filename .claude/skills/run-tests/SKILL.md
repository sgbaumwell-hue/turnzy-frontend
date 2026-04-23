---
name: run-tests
description: Run the Playwright test suite and report results
disable-model-invocation: true
---
Run tests for: $ARGUMENTS (or full suite if no argument given)

1. If a specific test file or feature is given, run only that: `npx playwright test $ARGUMENTS`
2. Otherwise run the full suite
3. Report: total passing, total failing, any new failures vs last run
4. For each failure, show the test name and error message
5. Do not fix failures unless explicitly asked — just report
