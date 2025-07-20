# @coze-foundation/foundation-sdk

基座提供sdk的具体实现package

## Overview

This package is part of the Coze Studio monorepo and provides architecture functionality. It includes sdk.

## Getting Started

### Installation

Add this package to your `package.json`:

```json
{
  "dependencies": {
    "@coze-foundation/foundation-sdk": "workspace:*"
  }
}
```

Then run:

```bash
rush update
```

### Usage

```typescript
import { /* exported functions/components */ } from '@coze-foundation/foundation-sdk';

// Example usage
// TODO: Add specific usage examples
```

## Features

- Sdk

## API Reference

### Exports

- `logoutOnly, uploadAvatar`
- `getIsSettled,
  getIsLogined,
  getUserInfo,
  getUserAuthInfos,
  useIsSettled,
  useIsLogined,
  useUserInfo,
  useUserAuthInfo,
  useUserLabel,
  subscribeUserAuthInfos,
  refreshUserInfo,
  useLoginStatus,
  getLoginStatus,`
- `BackButton, SideSheetMenu`
- `useSpace`


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
