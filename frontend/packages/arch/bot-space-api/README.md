# @coze-arch/bot-space-api

bot space api instance that extracts from apps/bot/src/services/api/space-api.ts

## Overview

This package is part of the Coze Studio monorepo and provides api & networking functionality. It includes store, service, plugin and more.

## Getting Started

### Installation

Add this package to your `package.json`:

```json
{
  "dependencies": {
    "@coze-arch/bot-space-api": "workspace:*"
  }
}
```

Then run:

```bash
rush update
```

### Usage

```typescript
import { /* exported functions/components */ } from '@coze-arch/bot-space-api';

// Example usage
// TODO: Add specific usage examples
```

## Features

- Store
- Service
- Plugin
- Api
- Validation

## API Reference

### Exports

- `type SpaceRequest<T> = Omit<T, 'space_id'>;`
- `const SpaceApi = spaceApiService;`
- `SpaceApiV2`


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
