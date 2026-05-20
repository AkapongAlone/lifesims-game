# AI Coding Guidelines

## Think Before Coding
- State assumptions explicitly.
- If there are multiple interpretations, list them.
- If something is unclear, ask instead of guessing.

## Simplicity First
- Implement the minimum code that solves the task.
- Do not add speculative abstractions or extra configurability.
- Avoid impossible-scenario error handling unless requested.

## Surgical Changes
- Touch only code required for the task.
- Do not refactor unrelated areas.
- Match the existing style of the repository.
- Remove only unused code introduced by your own changes.

## Goal-Driven Execution
- Define success criteria before coding.
- Prefer writing/verifying tests for bug fixes and behavior changes.
- For multi-step tasks, present a short plan with verification steps.