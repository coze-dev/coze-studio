# @coze-arch/bot-studio-store

bot studio global store

## Overview

This package is part of the Coze Studio monorepo and provides state management functionality. It includes store, sdk.

## Getting Started

### Installation

Add this package to your `package.json`:

```json
{
  "dependencies": {
    "@coze-arch/bot-studio-store": "workspace:*"
  }
}
```

Then run:

```bash
rush update
```

### Usage

```typescript
import { /* exported functions/components */ } from '@coze-arch/bot-studio-store';

// Example usage
// TODO: Add specific usage examples
```

## Features

- Store
- Sdk

## API Reference

### Exports

- `/** @deprecated 该使用方式已废弃，后续请使用@coze-arch/foundation-sdk导出的方法*/
  useSpaceStore,
  /** @deprecated 该使用方式已废弃，后续请使用@coze-arch/foundation-sdk导出的方法*/
  useSpace,
  /** @deprecated 该使用方式已废弃，后续请使用@coze-arch/foundation-sdk导出的方法*/
  useSpaceList,`
- `useAuthStore`
- `clearStorage`
- `useSpaceGrayStore, TccKey`


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
