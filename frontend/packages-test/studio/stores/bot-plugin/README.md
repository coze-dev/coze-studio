# @coze-studio/bot-plugin-store

plugin store

## Overview

This package is part of the Coze Studio monorepo and provides state management functionality. It includes hook, store, plugin and more.

## Getting Started

### Installation

Add this package to your `package.json`:

```json
{
  "dependencies": {
    "@coze-studio/bot-plugin-store": "workspace:*"
  }
}
```

Then run:

```bash
rush update
```

### Usage

```typescript
import { /* exported functions/components */ } from '@coze-studio/bot-plugin-store';

// Example usage
// TODO: Add specific usage examples
```

## Features

- Hook
- Store
- Plugin
- Api

## API Reference

### Exports

- `BotPluginStoreProvider,
  usePluginStore,
  usePluginCallbacks,
  usePluginNavigate,
  useMemorizedPluginStoreSet,
  usePluginStoreInstance,
  usePluginHistoryController,
  usePluginHistoryControllerRegistry,`
- `ROLE_TAG_TEXT_MAP`
- `useUnmountUnlock`
- `checkOutPluginContext, unlockOutPluginContext`


For detailed API documentation, please refer to the TypeScript definitions.

## Development

This package is built with:

- TypeScript
- React
- Vitest for testing
- ESLint for code quality

## Contributing

This package is part of the Coze Studio monorepo. Please follow the monorepo contribution guidelines.

## License

Apache-2.0
