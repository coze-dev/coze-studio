# OceanBase Vector Database Integration Guide

## Overview

This document provides a comprehensive guide to the integration of OceanBase vector database in Coze Studio, including architectural design, implementation details, configuration instructions, and usage guidelines.

## Integration Background

### Why Choose OceanBase?

1. **Transaction Support**: OceanBase provides complete ACID transaction support, ensuring data consistency
2. **Simple Deployment**: Compared to specialized vector databases like Milvus, OceanBase deployment is simpler
3. **MySQL Compatibility**: Compatible with MySQL protocol, low learning curve
4. **Vector Extensions**: Native support for vector data types and indexing
5. **Operations Friendly**: Low operational costs, suitable for small to medium-scale applications

### Comparison with Milvus

| Feature                         | OceanBase            | Milvus                      |
| ------------------------------- | -------------------- | --------------------------- |
| **Deployment Complexity** | Low (Single Machine) | High (Requires etcd, MinIO) |
| **Transaction Support**   | Full ACID            | Limited                     |
| **Vector Search Speed**   | Medium               | Faster                      |
| **Storage Efficiency**    | Medium               | Higher                      |
| **Operational Cost**      | Low                  | High                        |
| **Learning Curve**        | Gentle               | Steep                       |

## Architectural Design

### Overall Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Coze Studio   │    │  OceanBase      │    │   Vector Store  │
│   Application   │───▶│   Client        │───▶│   Manager       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  OceanBase      │
                       │   Database      │
                       └─────────────────┘
```

### Core Components

#### 1. OceanBase Client (`backend/infra/impl/oceanbase/`)

**Main Files**:

- `oceanbase.go` - Delegation client, providing backward-compatible interface
- `oceanbase_official.go` - Core implementation, based on official documentation
- `types.go` - Type definitions

**Core Functions**:

```go
type OceanBaseClient interface {
    CreateCollection(ctx context.Context, collectionName string) error
    InsertVectors(ctx context.Context, collectionName string, vectors []VectorResult) error
    SearchVectors(ctx context.Context, collectionName string, queryVector []float64, topK int) ([]VectorResult, error)
    DeleteVector(ctx context.Context, collectionName string, vectorID string) error
    InitDatabase(ctx context.Context) error
    DropCollection(ctx context.Context, collectionName string) error
}
```

#### 2. Search Store Manager (`backend/infra/impl/document/searchstore/oceanbase/`)

**Main Files**:

- `oceanbase_manager.go` - Manager implementation
- `oceanbase_searchstore.go` - Search store implementation
- `factory.go` - Factory pattern creation
- `consts.go` - Constant definitions
- `convert.go` - Data conversion
- `register.go` - Registration functions

**Core Functions**:

```go
type Manager interface {
    Create(ctx context.Context, collectionName string) (SearchStore, error)
    Get(ctx context.Context, collectionName string) (SearchStore, error)
    Delete(ctx context.Context, collectionName string) error
}
```

#### 3. Application Layer Integration (`backend/application/base/appinfra/`)

**File**: `app_infra.go`

**Integration Point**:

```go
case "oceanbase":
    // Build DSN
    dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
        user, password, host, port, database)

    // Create client
    client, err := oceanbaseClient.NewOceanBaseClient(dsn)

    // Initialize database
    if err := client.InitDatabase(ctx); err != nil {
        return nil, fmt.Errorf("init oceanbase database failed, err=%w", err)
    }
```

## Configuration Instructions

### Environment Variable Configuration

#### Required Configuration

```bash
# Vector store type
VECTOR_STORE_TYPE=oceanbase

# OceanBase connection configuration
OCEANBASE_HOST=localhost
OCEANBASE_PORT=2881
OCEANBASE_USER=root
OCEANBASE_PASSWORD=coze123
OCEANBASE_DATABASE=test
```

#### Optional Configuration

```bash
# Performance optimization configuration
OCEANBASE_VECTOR_MEMORY_LIMIT_PERCENTAGE=30
OCEANBASE_BATCH_SIZE=100
OCEANBASE_MAX_OPEN_CONNS=100
OCEANBASE_MAX_IDLE_CONNS=10

# Cache configuration
OCEANBASE_ENABLE_CACHE=true
OCEANBASE_CACHE_TTL=300

# Monitoring configuration
OCEANBASE_ENABLE_METRICS=true
OCEANBASE_ENABLE_SLOW_QUERY_LOG=true

# Retry configuration
OCEANBASE_MAX_RETRIES=3
OCEANBASE_RETRY_DELAY=1
OCEANBASE_CONN_TIMEOUT=30
```

### Docker Configuration

#### docker-compose-oceanbase.yml

```yaml
oceanbase:
  image: oceanbase/oceanbase-ce:latest
  container_name: coze-oceanbase
  environment:
    MODE: SLIM
    OB_DATAFILE_SIZE: 1G
    OB_SYS_PASSWORD: ${OCEANBASE_PASSWORD:-coze123}
    OB_TENANT_PASSWORD: ${OCEANBASE_PASSWORD:-coze123}
  ports:
    - '2881:2881'
  volumes:
    - ./data/oceanbase/ob:/root/ob
    - ./data/oceanbase/cluster:/root/.obd/cluster
  deploy:
    resources:
      limits:
        memory: 4G
      reservations:
        memory: 2G
```

## Usage Guide

### 1. Quick Start

```bash
# Clone the project
git clone https://github.com/coze-dev/coze-studio.git
cd coze-studio

# Setup OceanBase environment
make oceanbase_env

# Start OceanBase debug environment
make oceanbase_debug
```

### 2. Verify Deployment

```bash
# Check container status
docker ps | grep oceanbase

# Test connection
mysql -h localhost -P 2881 -u root -p -e "SELECT 1;"

# View databases
mysql -h localhost -P 2881 -u root -p -e "SHOW DATABASES;"
```

### 3. Create Knowledge Base

In the Coze Studio interface:

1. Enter knowledge base management
2. Select OceanBase as vector storage
3. Upload documents for vectorization
4. Test vector retrieval functionality

### 4. Performance Monitoring

```bash
# View container resource usage
docker stats coze-oceanbase

# View slow query logs
docker logs coze-oceanbase | grep "slow query"

# View connection count
mysql -h localhost -P 2881 -u root -p -e "SHOW PROCESSLIST;"
```

## Integration Features

### 1. Design Principles

#### Architecture Compatibility Design

- Strictly follow Coze Studio core architectural design principles, ensuring seamless integration of OceanBase adaptation layer with existing systems
- Adopt delegation pattern (Delegation Pattern) to achieve backward compatibility, ensuring stability and consistency of existing interfaces
- Maintain complete compatibility with existing vector storage interfaces, ensuring smooth system migration and upgrade

#### Performance First

- Use HNSW index to achieve efficient approximate nearest neighbor search
- Batch operations reduce database interaction frequency
- Connection pool management optimizes resource usage

#### Easy Deployment

- Single machine deployment, no complex cluster configuration required
- Docker one-click deployment
- Environment variable configuration, flexible and easy to use

### 2. Technical Highlights

#### Delegation Pattern Design

```go
type OceanBaseClient struct {
    official *OceanBaseOfficialClient
}

func (c *OceanBaseClient) CreateCollection(ctx context.Context, collectionName string) error {
    return c.official.CreateCollection(ctx, collectionName)
}
```

#### Intelligent Configuration Management

```go
func DefaultConfig() *Config {
    return &Config{
        Host:     getEnv("OCEANBASE_HOST", "localhost"),
        Port:     getEnvAsInt("OCEANBASE_PORT", 2881),
        User:     getEnv("OCEANBASE_USER", "root"),
        Password: getEnv("OCEANBASE_PASSWORD", ""),
        Database: getEnv("OCEANBASE_DATABASE", "test"),
        // ... other configurations
    }
}
```

#### Error Handling Optimization

```go
func (c *OceanBaseOfficialClient) setVectorParameters() error {
    params := map[string]string{
        "ob_vector_memory_limit_percentage": "30",
        "ob_query_timeout":                  "86400000000",
        "max_allowed_packet":                "1073741824",
    }

    for param, value := range params {
        if err := c.db.Exec(fmt.Sprintf("SET GLOBAL %s = %s", param, value)).Error; err != nil {
            log.Printf("Warning: Failed to set %s: %v", param, err)
        }
    }
    return nil
}
```

## Troubleshooting

### 1. Common Issues

#### Connection Issues

```bash
# Check container status
docker ps | grep oceanbase

# Check port mapping
docker port coze-oceanbase

# Test connection
mysql -h localhost -P 2881 -u root -p -e "SELECT 1;"
```

#### Vector Index Issues

```sql
-- Check index status
SHOW INDEX FROM test_vectors;

-- Rebuild index
DROP INDEX idx_test_embedding ON test_vectors;
CREATE VECTOR INDEX idx_test_embedding ON test_vectors(embedding)
WITH (distance=cosine, type=hnsw, lib=vsag, m=16, ef_construction=200, ef_search=64);
```

#### Performance Issues

```sql
-- Adjust memory limit
SET GLOBAL ob_vector_memory_limit_percentage = 50;

-- View slow queries
SHOW VARIABLES LIKE 'slow_query_log';
```

### 2. Log Analysis

```bash
# View OceanBase logs
docker logs coze-oceanbase

# View application logs
tail -f logs/coze-studio.log | grep -i "oceanbase\|vector"
```

## Summary

The integration of OceanBase vector database in Coze Studio has achieved the following goals:

1. **Complete Functionality**: Supports complete vector storage and retrieval functionality
2. **Good Performance**: Achieves efficient vector search through HNSW indexing
3. **Simple Deployment**: Single machine deployment, no complex configuration required
4. **Operations Friendly**: Low operational costs, easy monitoring and management
5. **Strong Scalability**: Supports horizontal and vertical scaling

Through this integration, Coze Studio provides users with a simple, efficient, and reliable vector database solution, particularly suitable for scenarios requiring transaction support, simple deployment, and low operational costs.

## Related Links

- [OceanBase Official Documentation](https://www.oceanbase.com/docs)
- [Coze Studio Project Repository](https://github.com/coze-dev/coze-studio)
