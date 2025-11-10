# Horse Racing Platform

A comprehensive horse racing platform that aggregates racing news for sentiment analysis and operates an affiliate odds comparison website targeting the Australian market.

## Project Structure

This is a monorepo containing:

- `backend/` - Node.js/Express API server with TypeScript
- `frontend/` - Next.js 14 web application with TypeScript and Tailwind CSS

## Prerequisites

- Node.js 18+ and npm
- Git

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cd backend && cp .env.example .env
cd ../frontend && cp .env.example .env.local
```

3. Install Git hooks:

```bash
npm run prepare
```

## Development

Run both backend and frontend in development mode:

```bash
# Backend (runs on port 3001)
npm run dev:backend

# Frontend (runs on port 3000)
npm run dev:frontend
```

## Building

Build both projects:

```bash
npm run build:backend
npm run build:frontend
```

## Code Quality

### Linting

```bash
npm run lint
```

### Formatting

```bash
# Check formatting
npm run format:check

# Fix formatting
npm run format
```

### Pre-commit Hooks

Git hooks are automatically configured via Husky to:

- Run ESLint on staged TypeScript files
- Run Prettier on all staged files
- Ensure code quality before commits

## Technology Stack

### Backend

- Node.js with TypeScript
- Express.js
- Strict TypeScript configuration
- ESLint + Prettier

### Frontend

- Next.js 14 with App Router
- React 18
- TypeScript (strict mode)
- Tailwind CSS
- ESLint + Prettier

## Requirements

This project implements requirements from `.kiro/specs/horse-racing-platform/requirements.md`

See individual workspace READMEs for more details:

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
