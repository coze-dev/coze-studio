# @coze-arch/logger

A comprehensive logging and error reporting library for the Coze architecture ecosystem, providing unified console logging, Slardar integration, React error boundaries, and performance tracing capabilities.

## Features

- **Unified Logging Interface**: Centralized logging with support for multiple log levels (info, success, warning, error, fatal)
- **Console & Remote Reporting**: Dual output support for both console debugging and remote telemetry
- **Slardar Integration**: Built-in support for Slardar error tracking and event reporting
- **React Error Boundaries**: Ready-to-use error boundary components with automatic error reporting
- **Performance Tracing**: Duration tracking for multi-step operations and workflows
- **Context-Aware Logging**: Namespace and scope-based log organization
- **TypeScript Support**: Full TypeScript definitions and type safety
- **Pending Queue System**: Queues logs when reporter is not initialized, executes when ready
- **Console Control**: Configurable console output for different environments

## Get Started

### Installation

```bash
# Add to your Rush.js workspace
rush add -p @coze-arch/logger --dev

# Update dependencies
rush update
```

### Basic Usage

#### Console Logging

```typescript
import { logger } from '@coze-arch/logger';

// Simple string messages
logger.info('Operation completed successfully');
logger.warning('This is a warning message');
logger.error({ message: 'Something went wrong', error: new Error('Details') });

// With context and metadata
logger.info({
  message: 'User action completed',
  namespace: 'user-management',
  scope: 'profile-update',
  meta: {
    userId: '12345',
    action: 'profile_update',
    duration: 150
  }
});
```

#### Remote Reporting

```typescript
import { reporter } from '@coze-arch/logger';

// Initialize with Slardar instance
const slardarInstance = getSlardarInstance();
reporter.init(slardarInstance);

// Log custom events
reporter.event({
  eventName: 'user_action',
  namespace: 'analytics',
  meta: {
    action: 'button_click',
    component: 'header'
  }
});

// Report errors
reporter.error({
  message: 'API request failed',
  error: new Error('Network timeout'),
  namespace: 'api',
  scope: 'user-service'
});
```

## API Reference

### Logger

The main logger instance for console output and basic logging.

```typescript
import { logger, Logger } from '@coze-arch/logger';

// Create custom logger with preset context
const apiLogger = logger.createLoggerWith({
  ctx: {
    namespace: 'api',
    scope: 'user-service'
  }
});

// Available log levels
logger.info(message | options);
logger.success(message | options);
logger.warning(message | options);
logger.error(options); // requires error object
logger.fatal(options); // requires error object

// Setup configuration
logger.setup({ 'no-console': true }); // Disable console output
```

### Reporter

Handles remote logging and event reporting with Slardar integration.

```typescript
import { reporter, Reporter } from '@coze-arch/logger';

// Initialize reporter
reporter.init(slardarInstance);

// Create reporter with preset context
const moduleReporter = reporter.createReporterWithPreset({
  namespace: 'auth',
  scope: 'login',
  meta: { version: '1.0.0' }
});

// Custom logs
reporter.info({ message: 'Info log', meta: { key: 'value' } });
reporter.warning({ message: 'Warning log' });
reporter.error({ message: 'Error log', error: new Error() });

// Custom events
reporter.event({ eventName: 'user_login' });
reporter.successEvent({ eventName: 'operation_complete' });
reporter.errorEvent({ eventName: 'login_failed', error: new Error() });
```

### Performance Tracing

Track duration across multiple steps in a workflow.

```typescript
import { reporter } from '@coze-arch/logger';

// Create tracer for a specific event
const { trace } = reporter.tracer({ eventName: 'api_request' });

// Track steps with automatic duration calculation
trace('start');
// ... some operation
trace('validation_complete');
// ... more operations
trace('request_sent');
// ... final operations
trace('success', {
  meta: { responseSize: 1024 }
});

// Handle errors in tracing
trace('error', {
  error: new Error('Request failed'),
  meta: { statusCode: 500 }
});
```

### Error Boundary

React component for catching and reporting JavaScript errors.

```typescript
import { ErrorBoundary } from '@coze-arch/logger';

function App() {
  return (
    <ErrorBoundary
      errorBoundaryName="main-app"
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.log('Error caught:', error);
      }}
      onReset={() => {
        // Reset app state
      }}
    >
      <YourAppComponents />
    </ErrorBoundary>
  );
}

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div>
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}
```

### Error Boundary Hooks

```typescript
import { useErrorBoundary, useErrorHandler } from '@coze-arch/logger';

function ComponentWithErrorHandling() {
  const { showBoundary } = useErrorBoundary();
  const handleError = useErrorHandler();
  
  const handleAsyncOperation = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      // Report to error boundary
      showBoundary(error);
      // Or handle manually
      handleError(error);
    }
  };
}
```

### Logger Context

Provide logger instances through React context.

```typescript
import { LoggerContext, useLogger } from '@coze-arch/logger';

// Provider
function App() {
  const logger = new Logger({
    ctx: { namespace: 'app' }
  });
  
  return (
    <LoggerContext.Provider value={logger}>
      <YourComponents />
    </LoggerContext.Provider>
  );
}

// Consumer
function Component() {
  const logger = useLogger();
  
  logger.info('Component mounted');
}
```

### Types and Interfaces

```typescript
import type {
  LogLevel,
  CommonLogOptions,
  CustomLog,
  CustomErrorLog,
  CustomEvent,
  ErrorEvent,
  LoggerCommonProperties
} from '@coze-arch/logger';

// Log levels
enum LogLevel {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  FATAL = 'fatal'
}

// Common log options interface
interface CommonLogOptions {
  namespace?: string;
  scope?: string;
  level?: LogLevel;
  action?: LogAction[];
  message?: string;
  eventName?: string;
  meta?: Record<string, unknown>;
  error?: Error;
}
```

## Development

### Running Tests

```bash
# Run all tests
rush test

# Run tests with coverage
rush test:cov

# Run tests for this package only
cd packages/arch/logger
rushx test
```

### Linting

```bash
# Lint the package
rushx lint

# Auto-fix linting issues
rushx lint --fix
```

### Building

```bash
# Build the package
rushx build

# Type checking
rushx ts-check
```

## Dependencies

### Production Dependencies

- **@coze-studio/slardar-interface**: Slardar integration interface
- **@coze-arch/bot-env**: Environment configuration utilities
- **@coze-arch/bot-typings**: Shared type definitions
- **lodash-es**: Utility functions library
- **react**: React library for error boundary components
- **react-error-boundary**: React error boundary utilities

### Development Dependencies

- **@coze-arch/eslint-config**: Shared ESLint configuration
- **@coze-arch/ts-config**: Shared TypeScript configuration
- **@coze-arch/vitest-config**: Shared Vitest configuration
- **@types/lodash-es**: TypeScript definitions for lodash-es
- **@types/react**: TypeScript definitions for React
- **vitest**: Testing framework

## License

This package is part of the Coze architecture ecosystem and follows the project's licensing terms.