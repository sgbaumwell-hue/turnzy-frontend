---
name: session-wrap
description: End-of-session wrap-up — summarizes work done, updates CONTEXT.md, commits and pushes
disable-model-invocation: true
---
At the end of this session:
1. Summarize what was accomplished in this session (features built, bugs fixed, tests added, decisions made)
2. Note any active branches and their status
3. Note what should happen next
4. Update CONTEXT.md with this information, replacing the previous session's content. Keep the format:
   - Last updated
   - What Turnzy is (keep this static)
   - Current state
   - Recently completed
   - What to work on next
   - Active branches
5. `git add CONTEXT.md && git commit -m "Update session context" && git push origin HEAD`
