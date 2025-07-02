# @coze-arch/web-context

> Global Context for whole hot studio web app. You should keep using this package instead of call `window.xxx` directly

A centralized context management package that provides global state, event handling, and navigation utilities for Coze Studio web applications. This package helps you avoid direct window object manipulation and provides a structured way to handle global application state.

## Features

- **Global Variables Storage**: Type-safe proxy-based global variable management
- **Event Bus System**: Centralized event handling with buffering capabilities
- **Navigation Utilities**: Safe URL redirection with future validation support
- **Application Constants**: Predefined enums for app sections and error codes
- **Community Helpers**: Specialized utilities for community bot store scenarios

## Get Started

### Installation

```bash
# Add to package.json
"@coze-arch/web-context": "workspace:*"

# Then run
rush update
```

### Basic Usage

```typescript
import {
  globalVars,
  GlobalEventBus,
  redirect,
  BaseEnum,
  SpaceAppEnum,
  COZE_TOKEN_INSUFFICIENT_ERROR_CODE
} from '@coze-arch/web-context';

// Use global variables
globalVars.LAST_EXECUTE_ID = 'some-execution-id';
console.log(globalVars.LAST_EXECUTE_ID);

// Create and use event bus
const eventBus = GlobalEventBus.create('myEventBus');
eventBus.on('dataChanged', (data) => {
  console.log('Data changed:', data);
});
eventBus.emit('dataChanged', { newValue: 'test' });

// Navigate safely
redirect('/new-page');
```

## API Reference

### Global Variables

#### `globalVars`

A proxy-based storage for global variables that provides type-safe access to shared state.

```typescript
import { globalVars } from '@coze-arch/web-context';

// Set a global variable
globalVars.LAST_EXECUTE_ID = 'abc123';
globalVars.MY_CUSTOM_VAR = { key: 'value' };

// Get a global variable
const executeId = globalVars.LAST_EXECUTE_ID; // string
const customVar = globalVars.MY_CUSTOM_VAR; // unknown

// Undefined for unset variables
const unsetVar = globalVars.NONEXISTENT; // undefined
```

**Features:**
- Type-safe access through TypeScript interfaces
- Automatic storage in internal Map
- Returns `undefined` for unset properties
- Support for any serializable value type

### Event Bus

#### `GlobalEventBus.create<T>(key: string)`

Creates or retrieves a singleton event bus instance for the given key.

```typescript
import { GlobalEventBus } from '@coze-arch/web-context';

// Define event types
interface MyEvents {
  userLogin: [userId: string];
  dataUpdate: [data: { id: string; value: unknown }];
  error: [error: Error];
}

// Create event bus
const eventBus = GlobalEventBus.create<MyEvents>('app');

// Subscribe to events
eventBus.on('userLogin', (userId) => {
  console.log(`User ${userId} logged in`);
});

// Emit events
eventBus.emit('userLogin', 'user123');

// Unsubscribe
const handler = (data) => console.log(data);
eventBus.on('dataUpdate', handler);
eventBus.off('dataUpdate', handler);
```

#### Event Bus Control Methods

```typescript
// Stop event processing (events will be buffered)
eventBus.stop();

// Events emitted while stopped are buffered
eventBus.emit('userLogin', 'user456'); // Buffered

// Start processing (flushes buffer)
eventBus.start(); // Now 'user456' login event fires

// Clear buffered events
eventBus.clear();
```

**Key Features:**
- Singleton pattern per key
- Event buffering when stopped
- Type-safe event definitions
- Standard EventEmitter3 API

### Navigation

#### `redirect(href: string)`

Safely redirects to a new URL with potential for future validation logic.

```typescript
import { redirect } from '@coze-arch/web-context';

// Redirect to external URL
redirect('https://example.com');

// Redirect to internal route
redirect('/dashboard');

// Redirect with query parameters
redirect('/search?q=test');
```

### Constants

#### Application Enums

```typescript
import { BaseEnum, SpaceAppEnum } from '@coze-arch/web-context';

// Base application sections
console.log(BaseEnum.Home);        // 'home'
console.log(BaseEnum.Store);       // 'store'
console.log(BaseEnum.Workspace);   // 'space'

// Space-specific applications
console.log(SpaceAppEnum.BOT);      // 'bot'
console.log(SpaceAppEnum.WORKFLOW); // 'workflow'
console.log(SpaceAppEnum.PLUGIN);   // 'plugin'
```

#### Error Codes

```typescript
import { COZE_TOKEN_INSUFFICIENT_ERROR_CODE } from '@coze-arch/web-context';

// Check for token insufficient errors
const isTokenError = COZE_TOKEN_INSUFFICIENT_ERROR_CODE.includes(errorCode);
if (isTokenError) {
  // Handle token insufficient error - stop streaming
}
```

#### Community Constants

```typescript
import {
  defaultConversationKey,
  defaultConversationUniqId
} from '@coze-arch/web-context';

// Use in community bot store scenarios
const conversationId = defaultConversationKey;     // -1
const uniqueId = defaultConversationUniqId;        // Unique string
```

## Development

### Project Structure

```
src/
├── const/           # Application constants
│   ├── app.ts      # Base and space app enums
│   ├── community.ts # Community-specific constants
│   └── custom.ts    # Error codes and custom constants
├── event-bus.ts     # Global event bus implementation
├── global-var.ts    # Global variables storage
├── location.ts      # Navigation utilities
└── index.ts         # Main exports
```

### Running Tests

```bash
# Run tests
rush test --to @coze-arch/web-context

# Run tests with coverage
rush test:cov --to @coze-arch/web-context
```

### Linting

```bash
# Lint the package
rush lint --to @coze-arch/web-context
```

## Dependencies

### Runtime Dependencies

- **eventemitter3** (^5.0.1): High-performance event emitter for the event bus system
- **lodash-es** (^4.17.21): Utility functions (used for `uniqueId` generation)

### Development Dependencies

- **@coze-arch/eslint-config**: Shared ESLint configuration
- **@coze-arch/ts-config**: Shared TypeScript configuration
- **vitest**: Testing framework with coverage support

## Best Practices

1. **Use typed event buses**: Always define event interfaces for better type safety
2. **Avoid direct window access**: Use this package instead of direct `window.xxx` calls
3. **Manage event subscriptions**: Remember to unsubscribe from events to prevent memory leaks
4. **Use singleton pattern**: Create event buses with meaningful keys and reuse them
5. **Handle buffered events**: Consider using `stop()`/`start()` pattern for controlling event flow

## License

Copyright © ByteDance Ltd. All rights reserved.