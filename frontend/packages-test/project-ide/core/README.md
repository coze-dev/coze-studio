# @coze-project-ide/core

A ide features package for the Coze Studio monorepo

## Overview

This package is part of the Coze Studio monorepo and provides ide features functionality. It includes adapter, service, plugin and more.

## Getting Started

### Installation

Add this package to your `package.json`:

```json
{
  "dependencies": {
    "@coze-project-ide/core": "workspace:*"
  }
}
```

Then run:

```bash
rush update
```

### Usage

```typescript
import { /* exported functions/components */ } from '@coze-project-ide/core';

// Example usage
// TODO: Add specific usage examples
```

## Features

- Adapter
- Service
- Plugin
- Logger

## API Reference

### Exports

- `Emitter,
  logger,
  useRefresh,
  Disposable,
  DisposableCollection,
  bindContributions,
  Event,`
- `createLifecyclePlugin,
  definePluginCreator,
  loadPlugins,
  Plugin,
  PluginContext,
  ContextKeyService,
  type PluginCreator,
  type PluginsProvider,
  type PluginConfig,
  type PluginBindConfig,
  type OpenerOptions,
  LifecycleContribution,
  OpenerService,
  OpenHandler,
  ContainerFactory,
  StorageService,
  WindowService,
  URI,
  URIHandler,
  prioritizeAllSync,
  prioritizeAll,`
- `Application, IDEContainerModule`
- `type ResourcePluginOptions,
  createResourcePlugin,
  type Resource,
  type ResourceInfo,
  ResourceError,
  ResourceHandler,
  ResourceService,
  AutoSaveResource,
  AutoSaveResourceOptions,`
- `Command,
  createCommandPlugin,
  CommandService,
  CommandContainerModule,
  CommandContribution,
  CommandRegistry,
  type CommandHandler,
  type CommandPluginOptions,
  CommandRegistryFactory,`
- `createShortcutsPlugin,
  ShortcutsContainerModule,
  type ShortcutsPluginOptions,
  ShortcutsContribution,
  ShortcutsService,
  type ShortcutsRegistry,
  Shortcuts,
  SHORTCUTS,
  domEditable,`
- `createPreferencesPlugin,
  PreferenceContribution,
  type PreferenceSchema,
  type PreferencesPluginOptions,`
- `createNavigationPlugin,
  type NavigationPluginOptions,
  NavigationService,
  NavigationHistory,`
- `createStylesPlugin,
  StylingContribution,
  type Collector,
  type ColorTheme,
  ThemeService,`
- `type LabelChangeEvent,
  LabelHandler,
  type LabelPluginOptions,
  LabelService,
  createLabelPlugin,
  URILabel,`

*And more...*

For detailed API documentation, please refer to the TypeScript definitions.

## Development

This package is built with:

- TypeScript
- Modern JavaScript

- ESLint for code quality

## Contributing

This package is part of the Coze Studio monorepo. Please follow the monorepo contribution guidelines.

## License

Apache-2.0
