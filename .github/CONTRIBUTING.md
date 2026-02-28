# Contributing to TikiTaP0

Thank you for your interest in contributing!

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```

## Available Scripts

| Command            | Description               |
| ------------------ | ------------------------- |
| `npm run dev`      | Start development server  |
| `npm run build`    | Build for production      |
| `npm run lint`     | Run ESLint                |
| `npm run format`   | Format code with Prettier |
| `npm run test`     | Run tests in watch mode   |
| `npm run test:run` | Run tests once            |

## Code Style

- Use TypeScript for all new code
- Follow ESLint rules (configured in `.eslintrc.js`)
- Format code with Prettier before committing
- Add proper TypeScript types

## Testing

- Write unit tests for new services
- Run tests with `npm run test`
- Ensure all tests pass before committing

## Pull Request Process

1. Create a feature branch from `dev`
2. Make your changes
3. Ensure tests pass and code is formatted
4. Submit a PR to `dev` branch
5. Wait for review and address feedback

## Git Workflow

```
main     - Production code
dev      - Development branch
feature/ - Feature branches
```

## Questions?

- Open an issue on GitHub
- Check existing issues before creating new ones

## License

MIT License - see LICENSE file for details
