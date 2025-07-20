# @coze-arch/bot-http

> Global HTTP client and error handling utilities for Bot Studio web applications

## Project Overview

This package provides a centralized HTTP client solution for the entire Bot Studio web application ecosystem. It offers a pre-configured axios instance with global interceptors, comprehensive error handling, event-driven API error management, and standardized response processing. This package ensures consistent HTTP behavior across all Bot Studio services while providing robust error reporting and handling capabilities.

## Features

- **Pre-configured Axios Instance**: Ready-to-use HTTP client with Bot Studio optimizations
- **Global Interceptors**: Request/response interceptors for authentication, logging, and error handling
- **Event-driven Error Management**: Centralized API error event system with custom handlers
- **Structured Error Types**: Type-safe API error definitions with detailed error information
- **Authentication Integration**: Built-in support for unauthorized request handling and redirects
- **Error Reporting**: Automatic error reporting with categorized event tracking
- **Response Processing**: Standardized response data extraction and error transformation

## Get Started

### Installation

Add this package to your `package.json` dependencies and set it to `workspace:*` version:

```json
{
  "dependencies": {
    "@coze-arch/bot-http": "workspace:*"
  }
}
```

Then run:
```bash
rush update
```

### Basic Usage

#### Using the Axios Instance

```typescript
import { axiosInstance } from '@coze-arch/bot-http';

// Make HTTP requests
const response = await axiosInstance.get('/api/users');
const userData = await axiosInstance.post('/api/users', { name: 'John' });

// The instance is pre-configured with interceptors and error handling
```

#### Error Handling

```typescript
import {
  APIErrorEvent,
  handleAPIErrorEvent,
  isApiError,
  ApiError
} from '@coze-arch/bot-http';

// Register global error handler
handleAPIErrorEvent((error: APIErrorEvent) => {
  console.error('API Error occurred:', error);
  // Handle error globally (show toast, redirect, etc.)
});

// Check if error is an API error
try {
  await axiosInstance.get('/api/data');
} catch (error) {
  if (isApiError(error)) {
    console.log('API Error Code:', error.code);
    console.log('API Error Message:', error.msg);
  }
}
```

#### Global Interceptors

```typescript
import {
  addGlobalRequestInterceptor,
  addGlobalResponseInterceptor,
  removeGlobalRequestInterceptor
} from '@coze-arch/bot-http';

// Add request interceptor for authentication
const requestInterceptor = addGlobalRequestInterceptor((config) => {
  config.headers.Authorization = `Bearer ${getToken()}`;
  return config;
});

// Add response interceptor for data processing
addGlobalResponseInterceptor((response) => {
  // Process response data
  return response;
});

// Remove interceptor when no longer needed
removeGlobalRequestInterceptor(requestInterceptor);
```

#### Error Event Management

```typescript
import {
  emitAPIErrorEvent,
  startAPIErrorEvent,
  stopAPIErrorEvent,
  clearAPIErrorEvent
} from '@coze-arch/bot-http';

// Manually emit API error event
emitAPIErrorEvent({
  code: '500',
  msg: 'Internal server error',
  type: 'custom'
});

// Control error event handling
stopAPIErrorEvent();  // Temporarily disable error events
startAPIErrorEvent(); // Re-enable error events
clearAPIErrorEvent(); // Clear all error handlers
```

## API Reference

### Core Components

#### `axiosInstance`
Pre-configured axios instance with global interceptors and error handling.

```typescript
import { axiosInstance } from '@coze-arch/bot-http';
// Use like regular axios instance
```

#### `ApiError`
Extended error class for API-specific errors.

```typescript
class ApiError extends AxiosError {
  code: string;           // Error code
  msg: string;           // Error message
  hasShowedError: boolean; // Whether error has been displayed
  type: string;          // Error type
  raw?: any;            // Raw error data
}
```

### Error Management

#### Error Event Functions
```typescript
// Register error handler
handleAPIErrorEvent(handler: (error: APIErrorEvent) => void): void

// Remove error handler
removeAPIErrorEvent(handler: (error: APIErrorEvent) => void): void

// Control error events
startAPIErrorEvent(): void
stopAPIErrorEvent(): void
clearAPIErrorEvent(): void

// Emit custom error
emitAPIErrorEvent(error: APIErrorEvent): void
```

#### Error Checking
```typescript
// Check if error is API error
isApiError(error: any): error is ApiError
```

### Interceptor Management

#### Request Interceptors
```typescript
// Add request interceptor
addGlobalRequestInterceptor(
  interceptor: (config: AxiosRequestConfig) => AxiosRequestConfig
): number

// Remove request interceptor
removeGlobalRequestInterceptor(interceptorId: number): void
```

#### Response Interceptors
```typescript
// Add response interceptor
addGlobalResponseInterceptor(
  interceptor: (response: AxiosResponse) => AxiosResponse
): void
```

### Error Codes

Built-in error code constants:

```typescript
enum ErrorCodes {
  NOT_LOGIN = 700012006,
  COUNTRY_RESTRICTED = 700012015,
  COZE_TOKEN_INSUFFICIENT = 702082020,
  COZE_TOKEN_INSUFFICIENT_WORKFLOW = 702095072,
}
```

## Advanced Usage

### Custom Error Handling

```typescript
import { axiosInstance, ApiError } from '@coze-arch/bot-http';

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error instanceof ApiError) {
      // Handle specific API errors
      switch (error.code) {
        case '401':
          // Redirect to login
          break;
        case '403':
          // Show permission error
          break;
        default:
          // Generic error handling
      }
    }
    return Promise.reject(error);
  }
);
```

### Integration with Web Context

The package automatically integrates with `@coze-arch/web-context` for handling redirects and navigation in unauthorized scenarios.

## Development

### Available Scripts

- `npm run build` - Build the package (no-op, source-only package)
- `npm run lint` - Run ESLint
- `npm run test` - Run tests with Vitest
- `npm run test:cov` - Run tests with coverage

### Project Structure

```
src/
├── axios.ts           # Axios instance configuration and interceptors
├── api-error.ts       # API error classes and utilities
├── eventbus.ts        # Error event management system
└── index.ts          # Main exports
```

## Dependencies

This package depends on:
- `@coze-arch/logger` - Logging utilities for error reporting
- `axios` - HTTP client library

## License

Apache-2.0
