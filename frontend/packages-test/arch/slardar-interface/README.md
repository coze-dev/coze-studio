# @coze-studio/slardar-interface

> TypeScript interface definitions for Slardar monitoring and error reporting

## Overview

`@coze-studio/slardar-interface` provides standardized TypeScript interface definitions for integrating with Slardar monitoring services. This package serves as a contract layer that defines the structure and behavior of Slardar instances used throughout the Coze Studio ecosystem.

## Features

- ✨ **Type Safety** - Complete TypeScript interface definitions for Slardar functionality
- 🔧 **Event Management** - Strongly typed event handling with overloaded methods
- 📊 **Error Tracking** - Comprehensive error capturing with React support
- 📈 **Metrics & Logging** - Structured event and log reporting interfaces
- ⚙️ **Configuration** - Flexible configuration management
- 🎯 **Event System** - Event listener registration and management

## Get Started

### Installation

Since this is a workspace package, add it to your `package.json`:

```json
{
  "dependencies": {
    "@coze-studio/slardar-interface": "workspace:*"
  }
}
```

Then run:

```bash
rush update
```

### Basic Usage

```typescript
import type { Slardar, SlardarConfig, SlardarInstance } from '@coze-studio/slardar-interface';

// Implementing a Slardar instance
class MySlardarImplementation implements Slardar {
  // Implementation details...
}

// Using as a constraint
function useSlardar(slardar: SlardarInstance) {
  // Configure the instance
  slardar.config({ sessionId: 'user-session-123' });

  // Send events
  slardar('sendEvent', {
    name: 'user_action',
    metrics: { duration: 150 },
    categories: { page: 'dashboard' }
  });
}
```

## API Reference

### Interfaces

#### `SlardarConfig`

Configuration options for Slardar instance:

```typescript
interface SlardarConfig {
  sessionId?: string;
  [key: string]: unknown;
}
```

#### `Slardar`

Main Slardar interface with overloaded methods for different event types:

```typescript
interface Slardar {
  // Generic event method
  (event: string, params?: Record<string, unknown>): void;

  // Error capturing
  (
    event: 'captureException',
    error?: Error,
    meta?: Record<string, string>,
    reactInfo?: { version: string; componentStack: string }
  ): void;

  // Event reporting
  (
    event: 'sendEvent',
    params: {
      name: string;
      metrics: Record<string, number>;
      categories: Record<string, string>;
    }
  ): void;

  // Log reporting
  (
    event: 'sendLog',
    params: {
      level: string;
      content: string;
      extra: Record<string, string | number>;
    }
  ): void;

  // Context management
  (event: 'context.set', key: string, value: string): void;

  // Configuration
  config: (() => SlardarConfig) & ((options: Partial<SlardarConfig>) => void);

  // Event listeners
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback: (...args: unknown[]) => void) => void;
}
```

### Event Types

#### Error Capturing

```typescript
slardar('captureException', new Error('Something went wrong'), {
  userId: '12345',
  context: 'checkout'
}, {
  version: '18.2.0',
  componentStack: 'CheckoutForm > PaymentSection'
});
```

#### Event Tracking

```typescript
slardar('sendEvent', {
  name: 'button_click',
  metrics: {
    loadTime: 250,
    clickCount: 1
  },
  categories: {
    component: 'nav-button',
    section: 'header'
  }
});
```

#### Logging

```typescript
slardar('sendLog', {
  level: 'info',
  content: 'User performed action',
  extra: {
    userId: 'user123',
    timestamp: Date.now()
  }
});
```

#### Context Management

```typescript
slardar('context.set', 'userId', 'user-12345');
slardar('context.set', 'environment', 'production');
```

### Configuration Management

```typescript
// Get current config
const currentConfig = slardar.config();

// Update config
slardar.config({
  sessionId: 'new-session-id',
  customField: 'value'
});
```

### Event Listeners

```typescript
// Register event listener
const handleError = (error: Error) => {
  console.log('Error captured:', error);
};

slardar.on('error', handleError);

// Remove event listener
slardar.off('error', handleError);
```

## Development

### Project Structure

```
src/
├── index.ts          # Main interface definitions
```

### Building

This package uses a no-op build process since it only contains TypeScript interfaces:

```bash
npm run build  # exits with code 0
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Dependencies

### Runtime Dependencies

None - this package only provides TypeScript interface definitions.

### Development Dependencies

- `@coze-arch/eslint-config` - Shared ESLint configuration
- `@coze-arch/ts-config` - Shared TypeScript configuration
- `@coze-arch/vitest-config` - Shared Vitest configuration
- `@types/node` - Node.js type definitions
- `@vitest/coverage-v8` - Coverage reporting
- `vitest` - Testing framework

## Related Packages

- `@coze-studio/slardar-adapter` - Adapter implementation using these interfaces
- `@coze-studio/default-slardar` - Default Slardar implementation

## License

Apache-2.0

---

> This package is part of the Coze Studio monorepo and provides foundational type definitions for Slardar monitoring integration.
