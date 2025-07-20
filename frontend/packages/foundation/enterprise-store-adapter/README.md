# @coze-foundation/enterprise-store-adapter

store for enterprise

## Overview

This package is part of the Coze Studio monorepo and provides state management functionality. It includes hook, store.

## Getting Started

### Installation

Add this package to your `package.json`:

```json
{
  "dependencies": {
    "@coze-foundation/enterprise-store-adapter": "workspace:*"
  }
}
```

Then run:

```bash
rush update
```

### Usage

```typescript
import { /* exported functions/components */ } from '@coze-foundation/enterprise-store-adapter';

// Example usage
// TODO: Add specific usage examples
```

## Features

- Hook
- Store

## API Reference

### Exports

- `PERSONAL_ENTERPRISE_ID`
- `useEnterpriseStore`
- `useEnterpriseList`
- `useCheckEnterpriseExist`
- `useCurrentEnterpriseInfo,
  useCurrentEnterpriseId,
  useIsCurrentPersonalEnterprise,
  useCurrentEnterpriseRoles,
  useIsEnterpriseLevel,
  useIsTeamLevel,
  useIsCurrentEnterpriseInit,
  CurrentEnterpriseInfoProps,`
- `switchEnterprise`
- `isPersonalEnterprise`


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
