# @coze-studio/bot-env-adapter

> Environment configuration adapter for bot applications with multi-region support

## Project Overview

The `@coze-studio/bot-env-adapter` package provides a centralized environment configuration management system for bot applications. It consolidates environment variables, feature flags, and business configurations into a type-safe, region-aware adapter that supports different deployment environments (CN, SG, VA) and build types (local, online, offline, test).

This package was originally extracted from `apps/bot/env` to provide reusable environment configuration management across the bot ecosystem.

## Features

- **Multi-Region Support**: Configures environments for China (CN), Singapore (SG), and Virginia (VA) regions
- **Environment-Aware Configuration**: Automatically selects appropriate configurations based on build type and region
- **Type Safety**: Auto-generated TypeScript definitions ensure type safety across the application
- **Feature Flags**: Centralized feature flag management for different environments and regions
- **Business Configuration**: Environment-specific business settings and API configurations
- **Build-Time Validation**: Validates required environment variables at build time

## Get Started

### Installation

Install the package in your workspace:

```bash
# Add to your package.json dependencies
"@coze-studio/bot-env-adapter": "workspace:*"

# Run rush update to install
rush update
```

### Basic Usage

```typescript
import { GLOBAL_ENVS } from '@coze-studio/bot-env-adapter';

// Access environment variables
console.log(GLOBAL_ENVS.REGION); // 'cn' | 'sg' | 'va'
console.log(GLOBAL_ENVS.BUILD_TYPE); // 'local' | 'online' | 'offline' | 'test'
console.log(GLOBAL_ENVS.BOT_BRAND_NAME); // Region-specific brand name

// Access feature flags
if (GLOBAL_ENVS.FEATURE_ENABLE_SSO) {
  // Enable SSO functionality
}

// Access business configurations
const appId = GLOBAL_ENVS.APP_ID;
const cdnUrl = GLOBAL_ENVS.CDN;
```

### Runtime Environment

```typescript
import { runtimeEnv } from '@coze-studio/bot-env-adapter/runtime';

// Access runtime environment information
console.log(runtimeEnv.isPPE); // Production environment check
```

### Type Definitions

```typescript
import type { TConfigEnv } from '@coze-studio/bot-env-adapter/typings';

// Use predefined types for configuration
const myConfig: TConfigEnv<string> = {
  cn: {
    boe: 'boe-value',
    inhouse: 'inhouse-value',
    release: 'release-value',
  },
  sg: {
    inhouse: 'sg-inhouse-value',
    release: 'sg-release-value',
  },
  va: {
    release: 'va-release-value',
  },
};
```

## API Reference

### Core Exports

#### `GLOBAL_ENVS`
The main export containing all environment variables, feature flags, and configurations.

```typescript
import { GLOBAL_ENVS } from '@coze-studio/bot-env-adapter';

// Base environment variables
GLOBAL_ENVS.BUILD_TYPE    // Build environment type
GLOBAL_ENVS.REGION        // Deployment region
GLOBAL_ENVS.NODE_ENV      // Node environment
GLOBAL_ENVS.CDN           // CDN URL for current environment

// Feature flags
GLOBAL_ENVS.FEATURE_ENABLE_SSO           // SSO feature toggle
GLOBAL_ENVS.FEATURE_ENABLE_APP_GUIDE     // App guide feature
GLOBAL_ENVS.FEATURE_GOOGLE_LOGIN         // Google login support

// Business configurations
GLOBAL_ENVS.APP_ID                       // Application ID
GLOBAL_ENVS.BOT_BRAND_NAME              // Brand name for current region
GLOBAL_ENVS.GOOGLE_CLIENT_ID            // Google OAuth client ID
```

#### `extractEnvValue<T>(config: TConfigEnv<T>): T`
Utility function to extract environment-specific values based on current region and build type.

```typescript
import { extractEnvValue } from '@coze-studio/bot-env-adapter';

const apiUrl = extractEnvValue<string>({
  cn: {
    boe: 'https://api-boe.example.cn',
    inhouse: 'https://api-inhouse.example.cn',
    release: 'https://api.example.cn',
  },
  sg: {
    inhouse: 'https://api-inhouse.example.com',
    release: 'https://api.example.com',
  },
  va: {
    release: 'https://api-va.example.com',
  },
});
```

### Configuration Structure

#### Base Configuration (`base.ts`)
Contains fundamental environment variables and regional judgments:
- Build type and version information
- Regional flags (IS_OVERSEA, IS_CN_REGION, etc.)
- CDN configurations
- Development mode flags

#### Feature Flags (`features.ts`)
Boolean flags controlling feature availability:
- Authentication features (SSO, Google login, etc.)
- Regional feature differences
- Version-specific feature toggles

#### Business Configurations (`configs.ts`)
Environment-specific business settings:
- API keys and application IDs
- External service configurations
- Legal document URLs
- Platform-specific settings

### Type Definitions

The package automatically generates TypeScript definitions in `src/typings.d.ts` based on the environment configuration. These types are available for import:

```typescript
// Auto-generated types based on actual configuration
declare const BUILD_TYPE: 'local' | 'online' | 'offline' | 'test';
declare const REGION: 'cn' | 'sg' | 'va';
declare const FEATURE_ENABLE_SSO: boolean;
// ... and many more
```

## Development

### Project Structure

```
src/
├── index.ts           # Main entry point, exports GLOBAL_ENVS
├── base.ts            # Base environment variables and regional flags
├── features.ts        # Feature flag configurations
├── configs.ts         # Business-specific configurations
├── typings.d.ts       # Auto-generated type definitions
├── runtime/
│   └── index.ts       # Runtime environment utilities
├── utils/
│   ├── config-helper.ts    # Configuration extraction utilities
│   └── current-branch.ts   # Git branch detection
└── configs/
    └── volcano.ts     # Volcano platform configurations
```

### Configuration Guidelines

When adding new environment configurations, follow these conventions:

1. **Use `extractEnvValue` for environment-specific values**:
```typescript
const MY_CONFIG = extractEnvValue<string>({
  cn: {
    boe: 'boe-value',
    inhouse: 'inhouse-value',
    release: 'release-value',
  },
  sg: {
    inhouse: 'sg-inhouse-value',
    release: 'sg-release-value',
  },
  va: {
    release: 'va-release-value',
  },
});
```

2. **Ensure all environments are covered** to prevent configuration gaps
3. **Update the `envs` object** in `src/index.ts` to include new configurations
4. **Run the build script** to regenerate type definitions

### Build Process

The package includes an automated TypeScript definition generator:

```bash
npm run build
```

This command:
1. Analyzes the `envs` object in `src/index.ts`
2. Generates type definitions in `src/typings.d.ts`
3. Compiles TypeScript files

### Environment Variables

Set these environment variables to control the adapter behavior:

- `BUILD_TYPE`: Build environment ('local' | 'online' | 'offline' | 'test')
- `REGION`: Deployment region ('cn' | 'sg' | 'va')
- `CUSTOM_VERSION`: Version type ('inhouse' | 'release')
- `NODE_ENV`: Node environment ('development' | 'production' | 'test')
- `VERBOSE`: Set to 'true' to log all environment values

### Testing

```bash
npm run test        # Run tests
npm run test:cov    # Run tests with coverage
npm run lint        # Run linting
```

## Dependencies

### Runtime Dependencies
This package has no runtime dependencies, making it lightweight and suitable for both client and server environments.

### Development Dependencies
- **@coze-arch/eslint-config**: Workspace ESLint configuration
- **@coze-arch/ts-config**: Workspace TypeScript configuration
- **@coze-arch/vitest-config**: Workspace Vitest configuration
- **ts-morph**: TypeScript AST manipulation for type generation
- **sucrase**: Fast TypeScript compiler for build scripts

## License

Apache-2.0
