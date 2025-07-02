# @coze-studio/bot-audit-base

> Audit base package for bot content validation and error handling

## Project Overview

This package provides foundational components and interfaces for bot content auditing within the Coze Studio platform. It includes UI components for displaying audit error messages and TypeScript interfaces for audit functionality integration.

## Features

- **AuditErrorMessage Component**: Pre-styled React component for displaying audit failure messages with customizable documentation links
- **Type Definitions**: Comprehensive TypeScript interfaces for bot audit hooks and functions
- **Internationalization Support**: Built-in i18n support for error messages
- **Storybook Integration**: Component documentation and testing environment

## Get Started

### Installation

Add this package to your `package.json` dependencies and set it to `workspace:*` version:

```json
{
  "dependencies": {
    "@coze-studio/bot-audit-base": "workspace:*"
  }
}
```

Then run:
```bash
rush update
```

### Basic Usage

#### Using the AuditErrorMessage Component

```tsx
import { AuditErrorMessage } from '@coze-studio/bot-audit-base';

function MyComponent() {
  return (
    <AuditErrorMessage
      link="/docs/custom-guidelines"
    />
  );
}
```

#### Implementing Audit Functionality

```tsx
import type { UseBotInfoAuditorHook, BotInfoAuditFunc } from '@coze-studio/bot-audit-base';

// Example hook implementation
const useBotAuditor: UseBotInfoAuditorHook = () => {
  const [pass, setPass] = useState(false);

  const check: BotInfoAuditFunc = async (params) => {
    // Your audit logic here
    const result = await performAudit(params);
    setPass(result.success);
    return result;
  };

  const reset = () => setPass(false);

  return { check, pass, setPass, reset };
};
```

## API Reference

### Components

#### `AuditErrorMessage`

Displays standardized audit error messages with documentation links.

**Props:**
- `link` (optional): Custom documentation link URL. Defaults to `/docs/guides/content_principles`

### Types

#### `UseBotInfoAuditorHook`

Hook interface for bot audit functionality.

**Returns:**
- `check`: Function to perform audit checks
- `pass`: Boolean indicating audit status
- `setPass`: State setter for audit status
- `reset`: Function to reset audit state

#### `BotInfoAuditFunc`

Function type for audit operations.

**Parameters:**
- `params`: `BotAuditInfo` - Audit parameters
**Returns:** `Promise<BotInfoAuditData>` - Audit result data

## Development

### Available Scripts

- `npm run dev` - Start Storybook development server
- `npm run build` - Build the package
- `npm run lint` - Run ESLint
- `npm run test` - Run tests with Vitest

### Project Structure

```
src/
├── components/
│   └── audit-error-message/    # AuditErrorMessage component
├── interfaces/                 # TypeScript type definitions
└── index.ts                   # Main export file
```

## Dependencies

This package depends on:
- `@coze-arch/bot-api` - Bot API types and interfaces
- `@coze-arch/i18n` - Internationalization utilities
- `classnames` - CSS class utility

## License

Apache-2.0
