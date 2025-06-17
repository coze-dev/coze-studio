# @coze-project-ide/view

A ide features package for the Coze Studio monorepo

## Overview

This package is part of the Coze Studio monorepo and provides ide features functionality. It includes component, hook, store and more.

## Getting Started

### Installation

Add this package to your `package.json`:

```json
{
  "dependencies": {
    "@coze-project-ide/view": "workspace:*"
  }
}
```

Then run:

```bash
rush update
```

### Usage

```typescript
import { /* exported functions/components */ } from '@coze-project-ide/view';

// Example usage
// TODO: Add specific usage examples
```

## Features

- Component
- Hook
- Store
- Service
- Manager
- Plugin

## API Reference

### Exports

- `ReactWidget, ReactWidgetContext`
- `LayoutPanelType,
  ToolbarAlign,
  type ViewPluginOptions,
  type CustomTitleType,
  type CustomTitleChanged,
  type PresetConfigType,`
- `ViewManager`
- `WidgetManager`
- `createViewPlugin`
- `createContextMenuPlugin`
- `VIEW_CONTAINER_CLASS_NAME,
  HOVER_TOOLTIP_LABEL,
  DEBUG_BAR_DRAGGABLE,
  DISABLE_HANDLE_EVENT,`
- `WidgetFactory, type ToolbarItem`
- `HoverService`
- `DragService, type DragPropsType`

*And more...*

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
