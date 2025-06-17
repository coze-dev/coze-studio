# @coze-arch/foundation-sdk

SDK for interaction between the foundation and the business.

## Overview

This package is part of the Coze Studio monorepo and provides architecture functionality. It includes api.

## Getting Started

### Installation

Add this package to your `package.json`:

```json
{
  "dependencies": {
    "@coze-arch/foundation-sdk": "workspace:*"
  }
}
```

Then run:

```bash
rush update
```

### Usage

```typescript
import { /* exported functions/components */ } from '@coze-arch/foundation-sdk';

// Example usage
// TODO: Add specific usage examples
```

## Features

- Api

## API Reference

### Exports

- `type OAuth2RedirectConfig,
  type OAuth2StateType,
  type UserInfo,
  type UserConnectItem,
  type ThemeType,
  type LoginStatus,
  type BackButtonProps,
  type NavBtnProps,`
- `declare function useCurrentTheme(): ThemeType;`
- `declare function logoutOnly(): Promise<void>;`
- `declare function uploadAvatar(file: File): Promise< web_uri: string >;`
- `declare function refreshUserInfo(): Promise<void>;`
- `declare function getLoginStatus(): LoginStatus;`
- `declare function getIsSettled(): boolean;`
- `declare function getIsLogined(): boolean;`
- `declare function getUserInfo(): UserInfo | null;`
- `declare function getUserAuthInfos(): Promise<void>;`

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
