# @coze-arch/idl

Interface Definition Language (IDL) package providing TypeScript type definitions and API client services for the Coze platform ecosystem.

## Project Overview

`@coze-arch/idl` is a comprehensive package that contains auto-generated TypeScript interfaces, types, and service clients derived from Thrift IDL definitions. It serves as the central type system for the Coze platform, providing strongly-typed API contracts for over 60+ services including bot management, workflow orchestration, plugin systems, evaluation frameworks, and more.

## Features

- **Comprehensive Type Definitions**: Auto-generated TypeScript interfaces for 66+ services
- **Service Clients**: Ready-to-use API client classes with type-safe request/response handling
- **Modular Structure**: Each service is packaged as a separate export for selective importing
- **Strong Type Safety**: Full TypeScript support with detailed interface definitions
- **Auto-Generated**: Maintained through automated code generation from Thrift IDL files
- **Extensive Coverage**: Covers all major Coze platform services:
  - **Bot Services**: Bot management, connector APIs, open APIs
  - **Workflow Services**: Fornax workflow engine, automation, evaluation
  - **Plugin Services**: Plugin development, marketplace, operation APIs
  - **Knowledge Services**: Document processing, retrieval, memory management
  - **Developer Tools**: Debugging, testing, deployment services
  - **Platform Services**: Authentication, permissions, notifications

## Get Started

### Installation

```bash
# Install the package
rush update

# Or using workspace protocol
npm install @coze-arch/idl@workspace:*
```

### Basic Usage

Import specific service types and clients:

```typescript
// Import specific service types
import { SuggestReplyMode } from '@coze-arch/idl';
import { TaskType as CopyTaskType } from '@coze-arch/idl';
import { ModelInfo as BotCommonModelInfo } from '@coze-arch/idl';

// Import service-specific types
import * as AppBuilderAPI from '@coze-arch/idl/app_builder';
import * as FornaxAPI from '@coze-arch/idl/fornax_api';
import * as BotConnectorAPI from '@coze-arch/idl/bot_connector';
```

### Service Client Example

```typescript
import AppBuilderService from '@coze-arch/idl/app_builder';

// Initialize service client
const appBuilder = new AppBuilderService({
  baseURL: 'https://api.coze.com',
  request: async (params, options) => {
    // Your HTTP client implementation
    return fetch(params.url, {
      method: params.method,
      headers: params.headers,
      body: params.data ? JSON.stringify(params.data) : undefined,
    }).then(res => res.json());
  }
});

// Use the service
const response = await appBuilder.GetPackage({
  package_name: 'my-package',
  version_name: '1.0.0'
});
```

### Type Usage Examples

```typescript
import * as BotAPI from '@coze-arch/idl/bot_open_api';

// Use interface types
const botRequest: BotAPI.CreateBotRequest = {
  bot_name: 'My Assistant',
  description: 'AI assistant for customer support',
  model_config: {
    model_id: 'gpt-4',
    temperature: 0.7
  }
};

// Use enum types
const taskType: BotAPI.TaskType = BotAPI.TaskType.ChatCompletion;

// Use response types
async function createBot(request: BotAPI.CreateBotRequest): Promise<BotAPI.CreateBotResponse> {
  // Implementation
}
```

## API Reference

### Available Services

The package exports 66+ service modules. Key services include:

#### Core Bot Services
- `app_builder` - Agent application building and management
- `bot_open_api` - Public bot APIs for external integration
- `bot_connector` - Bot connector management
- `intelligence_api` - Core intelligence and bot runtime services

#### Workflow and Automation
- `fornax_api` / `fornax_api2` - Workflow orchestration engine
- `workflow_api` - Workflow definition and execution
- `automation` - Automated task execution

#### Plugin Ecosystem
- `plugin_develop` - Plugin development tools
- `plugin_operation` - Plugin marketplace operations
- `plugin_impl_api` - Plugin implementation APIs

#### Knowledge Management
- `knowledge` - Knowledge base management
- `memory` - Conversation memory systems
- `xmemory_api` - Extended memory APIs

#### Evaluation and Testing
- `evaluation_api` - Model and bot evaluation
- `evaluation_lite` - Lightweight evaluation tools
- `devops_evaluation` - DevOps integration for evaluation

#### Developer Tools
- `debugger_api` - Debugging and development tools
- `playground_api` - Testing playground services
- `developer_api` - Developer platform APIs

### Service Client Pattern

All service clients follow a consistent pattern:

```typescript
class ServiceName<T> {
  constructor(options?: {
    baseURL?: string | ((path: string) => string);
    request?<R>(params: {
      url: string;
      method: 'GET' | 'DELETE' | 'POST' | 'PUT' | 'PATCH';
      data?: any;
      params?: any;
      headers?: any;
    }, options?: T): Promise<R>;
  });

  // Service methods with typed parameters and responses
  MethodName(req: RequestType, options?: T): Promise<ResponseType>;
}
```

### Re-exported Types

The main index provides convenient re-exports:

```typescript
export { SuggestReplyMode } from './auto-generated/developer_api/namespaces/developer_api';
export { TaskType as CopyTaskType } from './auto-generated/intelligence_api/namespaces/method_struct';
export { ModelInfo as BotCommonModelInfo } from './auto-generated/intelligence_api/namespaces/bot_common';
export { Scene as CreateRoomScene } from './auto-generated/playground_api/namespaces/playground';
```

## Development

### Project Structure

```
src/
├── index.ts                 # Main exports and re-exports
└── auto-generated/          # Generated from Thrift IDL
    ├── app_builder/         # App builder service
    ├── bot_open_api/        # Bot public APIs
    ├── fornax_api/          # Workflow engine
    ├── plugin_develop/      # Plugin development
    └── [60+ other services] # Additional service modules
```

### Build Configuration

The package uses TypeScript project references:

- `tsconfig.build.json` - Build configuration extending `@coze-arch/ts-config`
- `tsconfig.misc.json` - Additional configurations
- Composite builds enabled for incremental compilation

### Code Generation

This package contains auto-generated code from Thrift IDL definitions. The source files are marked with:

```typescript
/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
```

**Important**: Do not manually edit files in the `auto-generated` directory as they will be overwritten during the next generation cycle.

## Dependencies

### Development Dependencies
- `@coze-arch/eslint-config@workspace:*` - Shared ESLint configuration
- `@coze-arch/ts-config@workspace:*` - Shared TypeScript configuration
- `@types/node` - Node.js type definitions

### Runtime Dependencies
This package has no runtime dependencies and is designed to be lightweight with only type definitions and client templates.

## License

Apache-2.0

---

**Note**: This package contains auto-generated code derived from Thrift IDL definitions. The types and interfaces are automatically maintained and should not be manually modified.
