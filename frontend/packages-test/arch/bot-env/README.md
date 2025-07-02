# @coze-arch/bot-env

> A TypeScript-based environment variable management system for the bot-studio monorepo, providing compile-time type safety and runtime environment configuration.

## Features

- 🔧 **Compile-time Environment Variables**: Access to environment variables with full TypeScript support
- 🏗️ **Multi-environment Support**: Handles different deployment environments (BOE, production, development)
- 🌍 **Multi-region Configuration**: Supports CN, SG, and VA regions with region-specific configurations
- 🎯 **Feature Flags**: Built-in feature toggle system for conditional functionality
- 📝 **Auto-generated Types**: Automatically generates TypeScript declarations from environment configuration
- 🔒 **Type Safety**: Full TypeScript support with strict typing for all environment variables
- ⚡ **Runtime Environment Access**: Provides runtime environment detection and configuration

## Get Started

### Installation

```bash
# Install the package
rush add -p @coze-arch/bot-env

# Update dependencies
rush update
```

### Basic Usage

```typescript
// Import compile-time environment variables
import { GLOBAL_ENVS } from '@coze-arch/bot-env';

// Access environment variables with full type safety
console.log(GLOBAL_ENVS.REGION); // 'cn' | 'sg' | 'va'
console.log(GLOBAL_ENVS.IS_PROD); // boolean
console.log(GLOBAL_ENVS.BUILD_TYPE); // 'local' | 'online' | 'offline' | 'test'

// Import runtime environment utilities
import { runtimeEnv } from '@coze-arch/bot-env/runtime';

// Access runtime environment information
console.log(runtimeEnv.isPPE); // boolean
```

### TypeScript Declarations

```typescript
// Import TypeScript declarations
/// <reference types="@coze-arch/bot-env/typings" />

// All environment variables are available as global constants
declare const REGION: 'cn' | 'sg' | 'va';
declare const IS_PROD: boolean;
declare const FEATURE_ENABLE_SSO: boolean;
// ... and many more
```

## API Reference

### GLOBAL_ENVS

The main export containing all environment variables organized by category:

#### Base Environment Variables
- `BUILD_TYPE`: Build environment type (`'local' | 'online' | 'offline' | 'test'`)
- `CUSTOM_VERSION`: Version type (`'inhouse' | 'release'`)
- `REGION`: Deployment region (`'cn' | 'sg' | 'va'`)
- `NODE_ENV`: Node environment (`'production' | 'development' | 'test'`)
- `IS_PROD`: Production environment flag
- `IS_BOE`: BOE environment flag
- `IS_OVERSEA`: Overseas deployment flag
- `IS_RELEASE_VERSION`: Release version flag

#### Feature Flags
- `FEATURE_ENABLE_SSO`: Single Sign-On feature
- `FEATURE_ENABLE_APP_GUIDE`: Application guide feature
- `FEATURE_ENABLE_MSG_DEBUG`: Message debugging feature
- `FEATURE_AWEME_LOGIN`: Aweme login integration
- `FEATURE_GOOGLE_LOGIN`: Google login integration
- And many more feature toggles...

#### Configuration Variables
- `CDN`: Content delivery network URL
- `UPLOAD_CDN`: Upload CDN configuration
- `COZE_DOMAIN`: Coze service domain
- `APP_ID`: Application identifier
- `APP_KEY`: Application key
- Various service-specific configurations

### Runtime Environment

```typescript
import { runtimeEnv } from '@coze-arch/bot-env/runtime';

// Runtime environment detection
runtimeEnv.isPPE // boolean - Production-like environment detection
```

### Build Scripts

```typescript
import { build } from '@coze-arch/bot-env/build';

// Generate TypeScript declarations from environment configuration
build();
```

## Development

### Project Structure

```
src/
├── index.ts          # Main exports
├── runtime/          # Runtime environment utilities
├── typings.d.ts      # Auto-generated TypeScript declarations
└── global.d.ts       # Global type definitions

scripts/
├── build.ts          # Build script exports
└── index.ts          # Build script runner
```

### Environment Configuration

This package acts as a wrapper around `@coze-studio/bot-env-adapter`, which provides the actual environment configuration logic. The adapter package includes:

- **Base configuration**: Core environment variables like region, build type, and deployment flags
- **Feature flags**: Toggle switches for various application features
- **Business configs**: Service-specific configuration values
- **Configuration helpers**: Utilities for environment-specific value extraction

### Auto-generated Types

The package automatically generates TypeScript declarations based on the environment configuration. The build process:

1. Analyzes the `envs` object in the source code
2. Extracts type information for each environment variable
3. Generates corresponding TypeScript declarations
4. Updates the `typings.d.ts` file with the latest types

### Environment-specific Configuration

Use the `extractEnvValue` utility for environment-specific configurations:

```typescript
const API_ENDPOINT = extractEnvValue<string>({
  cn: {
    boe: 'https://boe.api.example.com',
    inhouse: 'https://inhouse.api.example.com',
    release: 'https://api.example.com'
  },
  sg: {
    inhouse: 'https://sg-inhouse.api.example.com',
    release: 'https://sg.api.example.com'
  },
  va: {
    release: 'https://va.api.example.com'
  }
});
```

### Running Tests

```bash
# Run tests
rush test -t @coze-arch/bot-env

# Run tests with coverage
rush test:cov -t @coze-arch/bot-env
```

### Building

```bash
# Build the package
rush build -t @coze-arch/bot-env

# Generate type definitions
rush build:types -t @coze-arch/bot-env
```

## Dependencies

### Runtime Dependencies
- `@coze-studio/bot-env-adapter`: Core environment configuration adapter

### Development Dependencies
- `@coze-arch/eslint-config`: ESLint configuration
- `@coze-arch/ts-config`: TypeScript configuration
- `@coze-arch/vitest-config`: Vitest testing configuration
- `ts-morph`: TypeScript AST manipulation for type generation
- `sucrase`: Fast TypeScript/JSX compiler
- `vitest`: Testing framework

## License

Apache-2.0 License - see package.json for details.

---

For more information about environment configuration patterns and best practices, refer to the [bot-studio monorepo documentation](../../docs/).
