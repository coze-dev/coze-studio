# OpenCoze

OpenCoze is an open-source monorepo project that implements Coze functionality. This repository contains both frontend and backend components, organized in a clean and maintainable architecture.

## Architecture Overview

```mermaid
graph TB
    subgraph "Application Layer"
        API[API Layer]:::apiStyle
    end

    subgraph "Domain Layer"
        direction TB
        DomainInterface[Domain Interface]:::interfaceStyle
        subgraph "Core Domain"
            Domain[Domain Layer]:::domainStyle
        end
        AntiCorruption[Anti-Corruption Interface]:::interfaceStyle
    end

    subgraph "Infrastructure Layer"
        direction TB
        Contract[Infrastructure Contract Layer]:::contractStyle
        Implementation[Infrastructure Implementation Layer]:::implStyle
    end

    subgraph "External Systems"
        direction LR
        DB[(Database)]:::externalStyle
        Cache[(Cache)]:::externalStyle
        Queue[(Message Queue)]:::externalStyle
    end

    API --> DomainInterface
    DomainInterface --> Domain
    Domain --> AntiCorruption
    AntiCorruption --> Contract
    Implementation --> Contract
    Implementation --> DB
    Implementation --> Cache
    Implementation --> Queue

    classDef interfaceStyle fill:#e1d5e7,stroke:#9673a6,stroke-width:2px,stroke-dasharray: 5 5
    classDef apiStyle fill:#f9f,stroke:#333,stroke-width:2px
    classDef domainStyle fill:#bbf,stroke:#333,stroke-width:2px
    classDef contractStyle fill:#bfb,stroke:#333,stroke-width:2px
    classDef implStyle fill:#fbb,stroke:#333,stroke-width:2px
    classDef externalStyle fill:#ddd,stroke:#333,stroke-width:2px

%% Note: The Infrastructure Contract Layer acts as a bridge between business logic and infrastructure implementations
```

The architecture diagram above illustrates the clean architecture pattern implemented in OpenCoze. Key points:

1. **Dependency Direction**: Domain and API layers only depend on the Infrastructure Contract Layer, never on concrete implementations.
2. **Infrastructure Contract Layer**: Acts as a bridge between business logic and infrastructure implementations through well-defined interfaces.
3. **Clean Separation**: Domain and API layers remain unaware of specific infrastructure implementations, promoting loose coupling.
4. **Flexibility**: Infrastructure implementations can be easily swapped without affecting business logic.

## Repository Structure

```
├── frontend/               # Frontend application
│   ├── src/                # Source code
│   ├── public/             # Public assets
│   └── tests/              # Frontend tests
│
├── backend/                # Backend services
│   ├── idl/                # Interface Definition Language files
│   │   ├── agent/          # Agent service definitions
│   │   ├── user/           # User service definitions
│   │   └── workflow/       # Workflow service definitions
│   │
│   ├── api/                # API handlers and routing
│   │   ├── agent/          # Agent service endpoints
│   │   ├── user/           # User service endpoints
│   │   └── workflow/       # Workflow service endpoints
│   │
│   ├── domain/             # Domain logic layer
│   │   ├── agent/          # Agent domain logic
│   │   │   ├── entity/     # Agent entities
│   │   │   ├── repository/ # Agent repositories
│   │   │   └── service/    # Agent services
│   │   ├── user/           # User domain logic
│   │   │   ├── entity/     # User entities
│   │   │   ├── repository/ # User repositories
│   │   │   └── service/    # User services
│   │   └── workflow/       # Workflow domain logic
│   │       ├── entity/     # Workflow entities
│   │       ├── repository/ # Workflow repositories
│   │       └── service/    # Workflow services
│   │
│   ├── pkg/                # 无外部依赖的工具方法
│   ├── infra-contract/     # Infrastructure abstraction layer
│   │   ├── cache/          # Cache interfaces
│   │   ├── config/         # Configuration interfaces
│   │   ├── database/       # Database interfaces
│   │   ├── messaging/      # Message queue interfaces
│   │   └── model/          # External model interfaces
│   │
│   └── infra/             # Pluggable infra implementation layer
│       ├── cache/          # Cache implementations (Redis, etc.)
│       ├── config/         # Configuration implementations
│       ├── database/       # Database implementations (MySQL, etc.)
│       ├── messaging/      # Message queue implementations
│       └── model/          # External model implementations
```

## Layer Responsibilities

### Frontend
The frontend application is built using modern frontend technologies and follows best practices for web development.

### Backend

1. **IDL Layer (`/backend/idl`)**
   - Contains interface definitions
   - Defines API contracts and data structures

2. **API Layer (`/backend/api`)**
   - Implements HTTP endpoints using Hertz server
   - Handles request/response processing
   - Contains middleware components

3. **Domain Layer (`/backend/domain`)**
   - Contains core business logic
   - Defines domain entities and value objects
   - Implements business rules and workflows

4. **Infrastructure Contract Layer (`/backend/infra-contract`)**
   - Defines interfaces for all external dependencies
   - Acts as a boundary between domain logic and infrastructure
   - Includes contracts for:
     * Storage systems
     * Caching mechanisms
     * Message queues
     * Configuration management
     * External models and services

5. **Infrastructure Implementation Layer (`/backend/infra`)**
   - Implements the interfaces defined in infra-contract
   - Provides concrete implementations for:
     * Database operations
     * Caching mechanisms
     * Message queue operations
     * Configuration management
     * External service integrations

## Infrastructure Contract Layer Design

The Infrastructure Contract Layer (`infra-contract`) serves as a crucial abstraction layer that:

1. Decouples the domain logic from external dependencies
2. Defines clear interfaces for all infrastructure components
3. Enables easy testing through mock implementations
4. Facilitates switching between different implementations
5. Manages all external stateful dependencies including:
   - Storage systems (databases)
   - Caching mechanisms
   - Message queues
   - Configuration management
   - External models and services

This architecture ensures that the core business logic remains clean and independent of specific infrastructure choices, while the infrastructure implementations can be easily swapped or upgraded as needed.

## 后端代码的设计过程
1. 明确开发任务所属的领域划分，根据预期的产品功能，制定领域边界，确定领域的接口抽象
2. 明确该领域抽象有哪些外部依赖，并将这些外部依赖定义到自身的实例化接口中，以此为领域内部逻辑的实现提供外部依赖
    a. 外部依赖只能来自于 infra/contract、corssdomain 两个包内的接口定义
    b. 可以直接使用 pkg 包下的工具方法
3. 实现领域逻辑时，一般需要各种各样的数据模型，在 DAO 处按照领域目录定义和管理自身的模型定义
4. 在 application 层，根据领域对象的实例化方法所呈现出的依赖关系和依赖顺序，实例化实体并传递给领域对象
5. application 组合各种领域对象 和 infra 实现，提供 API 服务
    a. application 封装 API 服务时，除了传输实体的转换之外，不应该存在其他逻辑