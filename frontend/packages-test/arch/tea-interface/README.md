# @coze-studio/tea-interface

interface that descripts how to use tea

## Overview

This package is part of the Coze Studio monorepo and provides architecture functionality. It includes hook, plugin, api and more.

## Getting Started

### Installation

Add this package to your `package.json`:

```json
{
  "dependencies": {
    "@coze-studio/tea-interface": "workspace:*"
  }
}
```

Then run:

```bash
rush update
```

### Usage

```typescript
import { /* exported functions/components */ } from '@coze-studio/tea-interface';

// Example usage
// TODO: Add specific usage examples
```

## Features

- Hook
- Plugin
- Api
- Sdk

## API Reference

### Exports

- `type SdkOption = Omit<IInitParam, 'app_id'>;`
- `type SdkHookListener = (hookInfo?: any) => void;`
- `const Collector: SdkConstructor;`
- `default Sdk;`


For detailed API documentation, please refer to the TypeScript definitions.

## Development

This package is built with:

- TypeScript
- Modern JavaScript
- Vitest for testing
- ESLint for code quality

## Contributing

This package is part of the Coze Studio monorepo. Please follow the monorepo contribution guidelines.

## License

Apache-2.0
