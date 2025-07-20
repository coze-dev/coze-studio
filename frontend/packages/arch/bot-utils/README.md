# @coze-arch/bot-utils

common utils extracts from apps/bot

## Overview

This package is part of the Coze Studio monorepo and provides utilities functionality. It includes modal, api.

## Getting Started

### Installation

Add this package to your `package.json`:

```json
{
  "dependencies": {
    "@coze-arch/bot-utils": "workspace:*"
  }
}
```

Then run:

```bash
rush update
```

### Usage

```typescript
import { /* exported functions/components */ } from '@coze-arch/bot-utils';

// Example usage
// TODO: Add specific usage examples
```

## Features

- Modal
- Api

## API Reference

### Exports

- `arrayBufferToObject`
- `isMobile`
- `safeJSONParse, typeSafeJSONParse`
- `type BytedUploader, upLoadFile`
- `messageReportEvent, type MessageReportEvent`
- `ArrayUtil`
- `skillKeyToApiStatusKeyTransformer`
- `loadImage`
- `renderHtmlTitle`
- `getParamsFromQuery, appendUrlParam, openUrl`

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
