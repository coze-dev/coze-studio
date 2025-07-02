# @coze-workflow/sdk

workflow对外sdk

## Overview

This package is part of the Coze Studio monorepo and provides architecture functionality. It includes component, editor.

## Getting Started

### Installation

Add this package to your `package.json`:

```json
{
  "dependencies": {
    "@coze-workflow/sdk": "workspace:*"
  }
}
```

Then run:

```bash
rush update
```

### Usage

```typescript
import { /* exported functions/components */ } from '@coze-workflow/sdk';

// Example usage
// TODO: Add specific usage examples
```

## Features

- Component
- Editor

## API Reference

### Exports

- `schemaExtractor, nodeResultExtractor`
- `ExpressionEditorEvent,
  ExpressionEditorToken,
  ExpressionEditorSegmentType,
  ExpressionEditorSignal,
  ExpressionEditorLeaf,
  ExpressionEditorSuggestion,
  ExpressionEditorCounter,
  ExpressionEditorRender,
  ExpressionEditorModel,
  ExpressionEditorParser,
  ExpressionEditorTreeHelper,
  ExpressionEditorValidator,
  useListeners,
  useSelectNode,
  useKeyboardSelect,
  useRenderEffect,
  useSuggestionReducer,`


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
