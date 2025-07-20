# @flowgram-adapter/common

对 flowgram 的封装

## Overview

This package is part of the Coze Studio monorepo and provides utilities functionality. It includes service, plugin, logger.

## Getting Started

### Installation

Add this package to your `package.json`:

```json
{
  "dependencies": {
    "@flowgram-adapter/common": "workspace:*"
  }
}
```

Then run:

```bash
rush update
```

### Usage

```typescript
import { /* exported functions/components */ } from '@flowgram-adapter/common';

// Example usage
// TODO: Add specific usage examples
```

## Features

- Service
- Plugin
- Logger

## API Reference

### Exports

- `useObserve, ReactiveState`
- `type IPoint,
  type PaddingSchema,
  type PositionSchema,
  type AsClass,
  type MaybePromise,
  type MaybeArray,
  type SchemaDecoration,
  type CancellationToken,
  type RecursivePartial,
  bindContributions,
  domUtils,
  Rectangle,
  DisposableCollection,
  delay,
  Emitter,
  logger,
  SizeSchema,
  Disposable,
  ContributionProvider,
  bindContributionProvider,
  pick,
  useRefresh,
  Event,
  addEventListener,
  isNumber,
  isObject,
  CancellationTokenSource,
  PromiseDeferred,
  Deferred,
  DecorationStyle,
  isFunction,
  compose,`
- `type HistoryPluginOptions,
  type Operation,
  createHistoryPlugin,
  HistoryService,
  OperationService,`
- `type CommandHandler,
  CommandContainerModule,
  CommandRegistry,
  Command,
  CommandService,
  CommandContribution,
  CommandRegistryFactory,`


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
