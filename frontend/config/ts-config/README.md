# @coze-arch/ts-config

> Shared TypeScript configuration presets for the Coze Bot Studio platform

## Project Overview

This package provides standardized TypeScript configuration presets for all projects within the Coze Bot Studio monorepo. It offers multiple configuration options optimized for different project types (web applications, Node.js services, and base configurations) while ensuring consistency across the entire platform. The configurations include strict type checking, modern JavaScript features, and appropriate compiler options for optimal development experience and build performance.

## Features

- **Multiple Configuration Presets**: Web, Node.js, and base configurations for different project types
- **Strict Type Checking**: Comprehensive TypeScript strict mode settings for enhanced code quality
- **Modern JavaScript Support**: Target ES2022 with support for latest JavaScript features
- **Path Mapping**: Built-in support for module path resolution and aliases
- **Monorepo Optimized**: Configured for Rush.js monorepo structure with workspace references
- **Development Friendly**: Source maps, incremental compilation, and fast build settings
- **Library Support**: Appropriate settings for both applications and reusable libraries

## Get Started

### Installation

Add this package to your `package.json` dependencies and set it to `workspace:*` version:

```json
{
  "devDependencies": {
    "@coze-arch/ts-config": "workspace:*"
  }
}
```

Then run:
```bash
rush update
```

### Basic Usage

#### Web Application Configuration

Create a `tsconfig.json` file in your project root:

```json
{
  "extends": "@coze-arch/ts-config/tsconfig.web.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

#### Node.js Service Configuration

```json
{
  "extends": "@coze-arch/ts-config/tsconfig.node.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": [
    "src/**/*"
  ]
}
```

#### Base Configuration (Library)

```json
{
  "extends": "@coze-arch/ts-config/tsconfig.base.json",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist"
  }
}
```

#### Build Configuration

For projects that need separate build configurations:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "sourceMap": false,
    "removeComments": true
  },
  "exclude": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "__tests__/**/*"
  ]
}
```

## API Reference

### Available Configurations

#### `tsconfig.web.json`
Optimized for web applications with React support.

**Key Features:**
- JSX support with `react-jsx` runtime
- DOM and ES2022 library support
- Module resolution optimized for web bundlers
- Strict mode enabled for better type safety

```json
{
  "extends": "@coze-arch/ts-config/tsconfig.web.json",
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@components/*": ["components/*"]
    }
  }
}
```

#### `tsconfig.node.json`
Configured for Node.js applications and services.

**Key Features:**
- Node.js library support
- CommonJS and ES module interoperability
- Optimized for server-side development
- Appropriate module resolution for Node.js

```json
{
  "extends": "@coze-arch/ts-config/tsconfig.node.json",
  "compilerOptions": {
    "types": ["node", "jest"]
  }
}
```

#### `tsconfig.base.json`
Base configuration suitable for libraries and shared packages.

**Key Features:**
- Minimal library dependencies
- Declaration file generation ready
- Flexible target environments
- Core TypeScript strict settings

### Common Compiler Options

All configurations include these base settings:

```typescript
{
  "strict": true,                    // Enable all strict type checking
  "noImplicitReturns": true,        // Error on missing return statements
  "noFallthroughCasesInSwitch": true, // Error on fallthrough cases
  "noUncheckedIndexedAccess": true,  // Strict array/object access
  "exactOptionalPropertyTypes": true, // Exact optional property matching
  "skipLibCheck": true,              // Skip type checking of declaration files
  "forceConsistentCasingInFileNames": true // Enforce consistent file naming
}
```

## Advanced Usage

### Project References

For monorepo projects with dependencies:

```json
{
  "extends": "@coze-arch/ts-config/tsconfig.web.json",
  "references": [
    { "path": "../shared-utils" },
    { "path": "../ui-components" }
  ],
  "compilerOptions": {
    "composite": true
  }
}
```

### Custom Path Mapping

```json
{
  "extends": "@coze-arch/ts-config/tsconfig.web.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@utils/*": ["src/utils/*"],
      "@components/*": ["src/components/*"],
      "@shared/*": ["../shared/src/*"]
    }
  }
}
```

### Environment-Specific Configurations

**Development:**
```json
{
  "extends": "@coze-arch/ts-config/tsconfig.web.json",
  "compilerOptions": {
    "sourceMap": true,
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

**Production:**
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "sourceMap": false,
    "removeComments": true,
    "declaration": false
  }
}
```

## Development

### Available Scripts

The configurations are static JSON files, but the package includes:

- Validation scripts to ensure configuration consistency
- Example projects demonstrating proper usage
- Documentation updates when TypeScript evolves

### Project Structure

```
.
├── tsconfig.base.json          # Base configuration
├── tsconfig.web.json           # Web application preset
├── tsconfig.node.json          # Node.js service preset
├── global.d.ts                 # Global type declarations
└── examples/                   # Usage examples
    ├── web-app/
    ├── node-service/
    └── library/
```

### Adding New Configurations

When adding new TypeScript configurations:

1. Extend from `tsconfig.base.json` for consistency
2. Document the specific use case and target environment
3. Include example usage in the `examples/` directory
4. Update this README with the new configuration options

### TypeScript Version Compatibility

This package is maintained to be compatible with:
- TypeScript 4.9+
- Node.js 18+
- Modern bundlers (Webpack 5, Vite, Rspack, etc.)

## Dependencies

This package has minimal dependencies:

### Development Dependencies
- `@coze-arch/eslint-config` - ESLint configuration for linting this package
- `typescript` - TypeScript compiler for validation

### Peer Dependencies
- `typescript` ^4.9.0 - Required by consuming projects

## License

Apache-2.0
