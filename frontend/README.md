# Coze Studio Frontend

This is the frontend project of Coze Studio, an AI Agent development platform built with monorepo architecture, based on React 18 and modern frontend technology stack.

## 🏗️ Project Architecture

### Core Technology Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Rsbuild
- **Package Manager**: Rush + PNPM
- **Routing**: React Router v6
- **State Management**: Zustand
- **UI Components**: @coze-arch/coze-design
- **Internationalization**: @coze-arch/i18n

### Directory Structure

```
frontend/
├── apps/                    # Application layer
│   └── coze-studio/        # Main application
├── packages/               # Core packages
│   ├── agent-ide/         # AI Agent development environment
│   ├── arch/              # Architecture infrastructure
│   ├── common/            # Common components and utilities
│   ├── components/        # UI component library
│   ├── data/              # Data layer
│   ├── devops/            # DevOps tools
│   ├── foundation/        # Foundation infrastructure
│   ├── project-ide/       # Project development environment
│   ├── studio/            # Studio core features
│   └── workflow/          # Workflow engine
├── config/                # Configuration files
│   ├── eslint-config/     # ESLint configuration
│   ├── rsbuild-config/    # Rsbuild build configuration
│   ├── ts-config/         # TypeScript configuration
│   ├── postcss-config/    # PostCSS configuration
│   ├── stylelint-config/  # Stylelint configuration
│   ├── tailwind-config/   # Tailwind CSS configuration
│   └── vitest-config/     # Vitest testing configuration
└── infra/                 # Infrastructure tools
    ├── idl/              # Interface Definition Language tools
    ├── plugins/          # Build plugins
    └── utils/            # Utility libraries
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 21
- PNPM 8.15.8
- Rush 5.147.1

### Install Dependencies
```bash
# Run in project root directory
rush install
# update
rush update
```

### Development Mode
```bash
# Start development server
cd apps/coze-studio
npm run dev
# or use rushx
rushx dev
```

### Production Build
```bash
# Build application
cd apps/coze-studio
npm run build
# or use rushx
rushx build
```

## 📦 Core Modules

### Agent IDE
- **agent-ide**: AI Agent integrated development environment
- **prompt**: Prompt editor
- **tool**: Tool configuration management
- **workflow**: Workflow integration

### Architecture Layer (arch)
- **bot-api**: API interface layer
- **bot-hooks**: React Hooks library
- **foundation-sdk**: Foundation SDK
- **i18n**: Internationalization support
- **bot-flags**: Feature flags management
- **web-context**: Web context utilities

### Workflow Engine (workflow)
- **fabric-canvas**: Canvas rendering engine
- **nodes**: Node component library
- **sdk**: Workflow SDK
- **playground**: Debug runtime environment

### Data Layer (data)
- **knowledge**: Knowledge base management
- **memory**: Memory system
- **common**: Common data processing

## 🔧 Development Standards

### Code Quality
- Code formatting with ESLint + Prettier
- TypeScript strict mode
- Unit test coverage requirements
- Team-based tier management (level-1 to level-4)

### Team Collaboration
- Rush-based monorepo management
- Workspace dependency management
- Unified build and release process

## 📄 License

Apache License 2.0