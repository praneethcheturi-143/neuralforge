# Contributing to NeuralForge

## Getting Started
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/neuralforge`
3. Create a feature branch: `git checkout -b feat/your-feature`
4. Install dependencies: `pip install -r backend/requirements.txt && cd frontend && npm install`
5. Copy environment variables: `cp .env.example .env`

## Commit Convention
We use conventional commits:
- `feat:` new feature
- `fix:` bug fix
- `chore:` maintenance
- `docs:` documentation
- `refactor:` code refactor
- `test:` adding tests
- `perf:` performance improvement

## Pull Request Process
1. Make your changes on a feature branch
2. Push to your fork
3. Open a PR against `master`
4. Describe what you changed and why

## Code Style
- Python: follow PEP8, use type hints
- TypeScript: strict mode, no any types
- All ML experiments must be logged to MLflow
