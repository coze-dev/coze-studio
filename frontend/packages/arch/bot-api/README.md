# @coze-arch/bot-api

> RPC wrapper for bot studio application

## Project Overview

This package provides a comprehensive API client library for the Coze Bot Studio platform. It offers TypeScript-first RPC wrappers for all bot studio services, including developer APIs, playground functionality, knowledge management, workflow orchestration, and more. The package centralizes API interactions and provides type-safe interfaces for seamless integration across the platform.

## Features

- **Comprehensive API Coverage**: Complete wrapper for all bot studio services including:
  - Developer APIs for bot management and development
  - Playground APIs for testing and experimentation
  - Knowledge management and memory systems
  - Workflow and connector APIs
  - Plugin development and marketplace interactions
  - Authentication and permission management
  - Payment and trading functionality
  - Multimedia and resource management

- **TypeScript-First**: Full type safety with auto-generated IDL definitions
- **Modular Architecture**: Import only the APIs you need with tree-shaking support
- **Error Handling**: Built-in error handling with customizable toast notifications
- **Request Interceptors**: Global request/response interceptors for logging and monitoring
- **Axios Integration**: Built on top of axios with custom configuration support

## Get Started

### Installation

Add this package to your `package.json` dependencies and set it to `workspace:*` version:

```json
{
  "dependencies": {
    "@coze-arch/bot-api": "workspace:*"
  }
}
```

Then run:
```bash
rush update
```

### Basic Usage

#### Import Main API Services

```typescript
import {
  DeveloperApi,
  PlaygroundApi,
  KnowledgeApi,
  workflowApi
} from '@coze-arch/bot-api';

// Use developer API
const bots = await DeveloperApi.getBotList({
  page: 1,
  page_size: 20
});

// Use playground API
const result = await PlaygroundApi.chat({
  bot_id: 'bot_123',
  message: 'Hello world'
});
```

#### Import Specific API Modules

```typescript
// Import specific IDL definitions
import { BotInfo } from '@coze-arch/bot-api/developer_api';
import { ChatMessage } from '@coze-arch/bot-api/playground_api';
import { KnowledgeBase } from '@coze-arch/bot-api/knowledge';

// Import specific service implementations
import DeveloperApiService from '@coze-arch/bot-api/developer_api';
import PlaygroundApiService from '@coze-arch/bot-api/playground_api';
```

#### Error Handling

```typescript
import {
  APIErrorEvent,
  handleAPIErrorEvent,
  addGlobalRequestInterceptor
} from '@coze-arch/bot-api';

// Add global error handler
handleAPIErrorEvent((error) => {
  console.error('API Error:', error);
});

// Add request interceptor for authentication
addGlobalRequestInterceptor((config) => {
  config.headers.Authorization = `Bearer ${getAuthToken()}`;
  return config;
});
```

#### Custom Request Configuration

```typescript
import type { BotAPIRequestConfig } from '@coze-arch/bot-api';

// Disable error toast for specific request
const result = await DeveloperApi.getBotInfo(
  { bot_id: 'bot_123' },
  { __disableErrorToast: true } as BotAPIRequestConfig
);
```

## API Reference

### Core Services

#### Developer API (`DeveloperApi`)
- Bot management and configuration
- Agent development and deployment
- Plugin management and publishing

#### Playground API (`PlaygroundApi`)
- Bot testing and conversation simulation
- Chat message handling
- Debug and monitoring capabilities

#### Knowledge API (`KnowledgeApi`)
- Knowledge base management
- Document upload and processing
- Semantic search and retrieval

#### Workflow API (`workflowApi`)
- Workflow definition and execution
- Task orchestration and scheduling
- Integration with external services

### Specialized Services

#### Memory & Context
- `MemoryApi` - Conversation memory management
- `xMemoryApi` - Extended memory functionality
- `webContext` - Web-based context handling

#### Marketplace & Plugins
- `PluginDevelopApi` - Plugin development tools
- `connectorApi` - Third-party integrations
- `marketInteractionApi` - Marketplace interactions

#### Authentication & Permissions
- `permissionAuthzApi` - Authorization management
- `permissionOAuth2Api` - OAuth2 integration
- `patPermissionApi` - Personal access tokens

#### Commerce & Trading
- `tradeApi` - Payment and billing
- `benefitApi` - User benefits and rewards
- `incentiveApi` - Incentive programs

### Configuration Types

```typescript
interface BotAPIRequestConfig extends AxiosRequestConfig {
  __disableErrorToast?: boolean; // Disable automatic error toasts
}
```

## Available Exports

The package provides both high-level service instances and low-level IDL access:

### Service Instances
```typescript
DeveloperApi, PlaygroundApi, ProductApi, NotifyApi,
MemoryApi, KnowledgeApi, cardApi, appBuilderApi,
workflowApi, debuggerApi, tradeApi, benefitApi,
incentiveApi, fulfillApi, hubApi, SocialApi
```

### IDL Types & Services
```typescript
// Access via subpath imports
'@coze-arch/bot-api/developer_api'
'@coze-arch/bot-api/playground_api'
'@coze-arch/bot-api/knowledge'
'@coze-arch/bot-api/workflow_api'
// ... and many more
```

## Development

### Available Scripts

- `npm run build` - Build the package (no-op, source-only package)
- `npm run lint` - Run ESLint
- `npm run test` - Run tests with Vitest
- `npm run test:cov` - Run tests with coverage

### Project Structure

```
src/
├── idl/                    # Auto-generated IDL definitions
│   ├── developer_api.ts    # Developer service types
│   ├── playground_api.ts   # Playground service types
│   └── ...                 # Other service definitions
├── developer-api.ts        # Developer API service implementation
├── playground-api.ts       # Playground API service implementation
├── axios.ts               # Custom axios configuration
└── index.ts               # Main exports
```

## Dependencies

This package depends on:
- `@coze-arch/bot-http` - HTTP client utilities and interceptors
- `@coze-arch/bot-semi` - UI components for error handling
- `@coze-arch/idl` - Interface definition language utilities
- `axios` - HTTP client library
- `query-string` - URL query string utilities

## License

Apache-2.0
