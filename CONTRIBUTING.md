# Contributing Guidelines

Thank you for your interest in contributing to the Social Media Content Analyzer!

## Workflow

1. **Branch Naming**: Use descriptive prefixes for your branches:
   - `feature/` for new capabilities
   - `fix/` for bug fixes
   - `chore/` for tooling/dependency updates

2. **Testing**: 
   - Ensure all tests pass (`npm test` in both root and `server/`).
   - If adding a feature, add corresponding tests.

3. **Continuous Integration**:
   - Our CI runs on all PRs.
   - A PR cannot be merged unless the `frontend` and `backend` jobs pass successfully.

4. **Code Review**:
   - Open a Pull Request targeting the `main` or `master` branch.
   - Describe your changes clearly in the PR description.
