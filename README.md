# Mocksy - Idea to concept in seconds

Transform your app or game idea into visual concepts instantly with AI-powered design generation.

## What is Mocksy?

Mocksy is an AI-powered platform that helps creators visualize their app and game ideas in seconds. Describe your concept, and Mocksy generates professional mockups, app icons, and screenshots - turning abstract ideas into tangible designs you can share, iterate on, and bring to life.

## Key Features

- **AI-Powered Generation**: Describe your app or game idea, and get visual concepts in seconds
- **Professional Mockups**: Generate app icons, screenshots, and UI designs instantly
- **Multiple Variations**: Explore different visual directions for your concept
- **Fast Iteration**: Refine and regenerate concepts based on feedback

## Tech Stack

- **Frontend**: Next.js 15.5.3 with App Router, TypeScript, Tailwind CSS v4
- **Backend**: Convex (real-time database and serverless functions)
- **AI/ML**: 
  - BAML (type-safe LLM function framework)
  - FAL AI (image generation models)
  - OpenAI (concept generation)
- **Authentication**: Clerk
- **Bundler**: Turbopack (dev and production builds)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Convex account (for backend)
- Clerk account (for authentication)
- OpenAI API key
- FAL AI API key

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys to .env.local

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Generate BAML types
npm run baml:generate
```

## Project Structure

```
mocksy/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   └── providers/        # React context providers
├── convex/               # Convex backend functions
├── baml_src/             # BAML AI function definitions
├── docs/                 # Project documentation
│   ├── rules/           # Development guidelines
│   ├── features/        # Feature documentation
│   └── learnings/       # Lessons learned
└── public/              # Static assets
```

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **Technology Guidelines**: `docs/rules/` - Best practices for Convex, BAML, FAL AI, Clerk, and more
- **Feature Documentation**: `docs/features/` - Implementation details and architecture decisions
- **Learning Resources**: `docs/learnings/` - Lessons learned and integration patterns

### For AI Agents

- See `AGENTS.md` for repository-wide guidelines and documentation triggers
- See `CLAUDE.md` for Claude-specific development instructions

## Contributing

1. Check the relevant documentation in `docs/rules/` before starting work
2. Follow the code style and naming conventions outlined in `AGENTS.md`
3. Run `npm run lint` before committing
4. Write clear commit messages using imperative mood ("Add feature" not "Added feature")
5. Test your changes with `npm run build && npm run start`

## License

[Add your license here]

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [BAML Documentation](https://docs.boundaryml.com)
- [FAL AI Documentation](https://fal.ai/docs)
