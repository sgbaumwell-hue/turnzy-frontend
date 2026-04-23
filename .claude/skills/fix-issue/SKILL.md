---
name: fix-issue
description: Fix a GitHub issue end to end
disable-model-invocation: true
---
Fix GitHub issue: $ARGUMENTS

1. `gh issue view $ARGUMENTS` to read the full issue
2. Understand the problem. Search the codebase for relevant files.
3. Create a feature branch: `git checkout -b fix/issue-$ARGUMENTS`
4. Implement the fix
5. Write a test that would have caught this bug, run it, confirm it passes
6. Run the full relevant test suite, fix any failures
7. `git add -A && git commit -m "Fix #$ARGUMENTS: <description>" && git push origin HEAD`
8. `gh pr create --fill --body "Fixes #$ARGUMENTS"`
9. Tell me the PR URL and what to review
