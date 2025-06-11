# @coze-arch/vitest-config

> Shared Vitest configuration for the Coze architecture ecosystem

A unified testing configuration package that provides optimized Vitest setups for Node.js and web applications in the Coze monorepo. This package simplifies test configuration management and ensures consistency across all projects.

## Features

- **Multiple Presets**: Pre-configured setups for `default`, `node`, and `web` environments
- **TypeScript Support**: Built-in TypeScript path mapping with `vite-tsconfig-paths`
- **React Testing**: Web preset includes React plugin for component testing
- **Coverage Reporting**: Comprehensive coverage configuration with multiple reporters
- **Performance Optimized**: Fork-based test execution with configurable pool options
- **Semi-UI Compatibility**: Special handling for Semi Design components
- **Flexible Configuration**: Easy to extend and customize for specific project needs

## Get Started

### Installation

Add the package to your project:

```bash
# In your package.json
{
  "devDependencies": {
    "@coze-arch/vitest-config": "workspace:*"
  }
}
```

Then run:

```bash
rush update
```

### Basic Usage

Create a `vitest.config.ts` file in your project root:

```typescript
import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig({
  dirname: __dirname,
  preset: 'web', // or 'node' or 'default'
});
```

## API Reference

### `defineConfig(config, otherConfig?)`

The main configuration function that creates a Vitest configuration based on your requirements.

#### Parameters

**config** (`VitestConfig`):
- `dirname` (string, required): The project root directory (`__dirname`)
- `preset` (string, required): Configuration preset - `'default'` | `'node'` | `'web'`
- All other Vitest configuration options

**otherConfig** (`OtherConfig`, optional):
- `fixSemi` (boolean): Enable Semi Design component compatibility fixes

#### Examples

**Default Configuration:**
```typescript
import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig({
  dirname: __dirname,
  preset: 'default',
});
```

**Node.js Application:**
```typescript
import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig({
  dirname: __dirname,
  preset: 'node',
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['src/**/*.browser.test.ts'],
  },
});
```

**React/Web Application:**
```typescript
import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig({
  dirname: __dirname,
  preset: 'web',
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./src/test-setup.ts'],
  },
});
```

**With Semi Design Components:**
```typescript
import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig({
  dirname: __dirname,
  preset: 'web',
}, {
  fixSemi: true,
});
```

**Custom Coverage Configuration:**
```typescript
import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig({
  dirname: __dirname,
  preset: 'web',
  test: {
    coverage: {
      all: true,
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
```

### Available Presets

#### `default`
- Basic Vitest configuration
- TypeScript path mapping
- Fork-based test execution
- Coverage reporting disabled by default

#### `node`
- Extends default preset
- Optimized for Node.js applications
- No browser-specific plugins

#### `web`
- Extends default preset
- Includes React plugin for JSX/TSX support
- Uses `happy-dom` environment for DOM testing
- Optimized for frontend applications

### Built-in Features

**Test Execution:**
- Pool: `forks` with 1-32 workers
- Parallel hook execution
- Global test APIs enabled
- Silent mode in CI environments

**Coverage:**
- Provider: V8
- Formats: Cobertura, Text, HTML, Clover, JSON
- Includes: `src/**/*.ts`, `src/**/*.tsx`
- Excludes: Standard Vitest defaults

**TypeScript:**
- Automatic path mapping via `vite-tsconfig-paths`
- Resolve main fields: `main`, `module`, `exports`

## Development

### Scripts

```bash
# Lint the code
rush lint

# Development mode
rush dev
```

### Project Structure

```
src/
├── index.js          # CommonJS entry point with Sucrase
├── define-config.ts  # Main configuration function
├── preset-default.ts # Base configuration preset
├── preset-node.ts    # Node.js specific preset
├── preset-web.ts     # Web/React specific preset
└── tsc-only.ts       # TypeScript-only mock file
```

## Dependencies

### Production Dependencies
- `vite-tsconfig-paths`: TypeScript path mapping support

### Development Dependencies
- `vitest`: Core testing framework
- `@vitejs/plugin-react`: React support for web preset
- `@vitest/coverage-v8`: Coverage reporting
- `happy-dom`: Lightweight DOM environment
- `sucrase`: Fast TypeScript compilation

## License

This package is part of the Coze architecture ecosystem and follows the project's licensing terms.