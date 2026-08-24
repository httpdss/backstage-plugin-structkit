# Contributing to @httpdss/plugin-scaffolder-backend-module-structkit

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/backstage-plugin-structkit.git
   cd backstage-plugin-structkit
   ```
3. Install dependencies:
   ```bash
   yarn install
   ```

## Development Workflow

### Building

```bash
yarn build
```

### Running Tests

```bash
yarn test
```

To run tests in watch mode:
```bash
yarn test --watch
```

### Linting

```bash
yarn lint
```

To auto-fix linting issues:
```bash
yarn lint --fix
```

## Code Style

- Use TypeScript for all code
- Follow the existing code style (enforced by ESLint)
- No trailing whitespace
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

## Testing

- Write tests for new functionality
- Ensure all tests pass before submitting a PR
- Aim for good test coverage

## Submitting Changes

1. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/) format:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `test:` for test changes
   - `chore:` for maintenance tasks

3. Push to your fork:
   ```bash
   git push origin feature/my-new-feature
   ```

4. Open a Pull Request on GitHub

## Pull Request Guidelines

- Provide a clear description of the changes
- Reference any related issues
- Ensure all tests pass
- Update documentation if needed
- Keep PRs focused on a single concern

## Reporting Issues

When reporting issues, please include:
- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Your environment (Node version, Backstage version, etc.)
- Any relevant logs or error messages

## Questions?

Feel free to open an issue for questions or discussions!
