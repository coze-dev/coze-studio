# @coze-arch/tea

Tea package for monorepo

## Overview

This package is part of the Coze Studio monorepo and provides architecture functionality. It includes adapter, store, plugin.

## Getting Started

### Installation

Add this package to your `package.json`:

```json
{
  "dependencies": {
    "@coze-arch/tea": "workspace:*"
  }
}
```

Then run:

```bash
rush update
```

### Usage

```typescript
import { /* exported functions/components */ } from '@coze-arch/tea';

// Example usage
// TODO: Add specific usage examples
```

## Features

- Adapter
- Store
- Plugin

## API Reference

### Exports

- `EVENT_NAMES,
  AddPluginToStoreEntry,
  AddWorkflowToStoreEntry,
  PublishAction,
  AddBotToStoreEntry,
  BotDetailPageAction,
  PluginPrivacyAction,
  PluginMockDataGenerateMode,
  BotShareConversationClick,
  FlowStoreType,
  FlowResourceFrom,
  FlowDuplicateType,`
- `default Tea;`


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
