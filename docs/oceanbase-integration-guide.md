# OceanBase 向量数据库集成指南

## 概述

本文档详细介绍了 OceanBase 向量数据库在 Coze Studio 中的集成适配情况，包括架构设计、实现细节、配置说明和使用指南。

## 集成背景

### 为什么选择 OceanBase？

1. **事务支持**: OceanBase 提供完整的 ACID 事务支持，确保数据一致性
2. **部署简单**: 相比 Milvus 等专用向量数据库，OceanBase 部署更简单
3. **MySQL 兼容**: 兼容 MySQL 协议，学习成本低
4. **向量扩展**: 原生支持向量数据类型和索引
5. **运维友好**: 运维成本低，适合中小规模应用

### 与 Milvus 的对比

| 特性                   | OceanBase      | Milvus                 |
| ---------------------- | -------------- | ---------------------- |
| **部署复杂度**   | 低（单机部署） | 高（需要 etcd、MinIO） |
| **事务支持**     | 完整 ACID      | 有限                   |
| **向量检索速度** | 中等           | 更快                   |
| **存储效率**     | 中等           | 更高                   |
| **运维成本**     | 低             | 高                     |
| **学习曲线**     | 平缓           | 陡峭                   |

## 架构设计

### 整体架构

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

### 核心组件

#### 1. OceanBase Client (`backend/infra/impl/oceanbase/`)

**主要文件**:

- `oceanbase.go` - 委托客户端，提供向后兼容接口
- `oceanbase_official.go` - 核心实现，基于官方文档
- `types.go` - 类型定义

**核心功能**:

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

**主要文件**:

- `oceanbase_manager.go` - 管理器实现
- `oceanbase_searchstore.go` - 搜索存储实现
- `factory.go` - 工厂模式创建
- `consts.go` - 常量定义
- `convert.go` - 数据转换
- `register.go` - 注册函数

**核心功能**:

```go
type Manager interface {
    Create(ctx context.Context, collectionName string) (SearchStore, error)
    Get(ctx context.Context, collectionName string) (SearchStore, error)
    Delete(ctx context.Context, collectionName string) error
}
```

#### 3. 应用层集成 (`backend/application/base/appinfra/`)

**文件**: `app_infra.go`

**集成点**:

```go
case "oceanbase":
    // 构建 DSN
    dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
        user, password, host, port, database)

    // 创建客户端
    client, err := oceanbaseClient.NewOceanBaseClient(dsn)

    // 初始化数据库
    if err := client.InitDatabase(ctx); err != nil {
        return nil, fmt.Errorf("init oceanbase database failed, err=%w", err)
    }
```



## 配置说明

### 环境变量配置

#### 必需配置

```bash
# 向量存储类型
VECTOR_STORE_TYPE=oceanbase

# OceanBase 连接配置
OCEANBASE_HOST=localhost
OCEANBASE_PORT=2881
OCEANBASE_USER=root
OCEANBASE_PASSWORD=coze123
OCEANBASE_DATABASE=test
```

#### 可选配置

```bash
# 性能优化配置
OCEANBASE_VECTOR_MEMORY_LIMIT_PERCENTAGE=30
OCEANBASE_BATCH_SIZE=100
OCEANBASE_MAX_OPEN_CONNS=100
OCEANBASE_MAX_IDLE_CONNS=10

# 缓存配置
OCEANBASE_ENABLE_CACHE=true
OCEANBASE_CACHE_TTL=300

# 监控配置
OCEANBASE_ENABLE_METRICS=true
OCEANBASE_ENABLE_SLOW_QUERY_LOG=true

# 重试配置
OCEANBASE_MAX_RETRIES=3
OCEANBASE_RETRY_DELAY=1
OCEANBASE_CONN_TIMEOUT=30
```

### Docker 配置

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

## 使用指南

### 1. 快速启动

```bash
# 克隆项目
git clone https://github.com/coze-dev/coze-studio.git
cd coze-studio

# 设置 OceanBase 环境文件
make oceanbase_env

# 启动 OceanBase 调试环境
make oceanbase_debug
```

### 2. 验证部署

```bash
# 检查容器状态
docker ps | grep oceanbase

# 测试连接
mysql -h localhost -P 2881 -u root -p -e "SELECT 1;"

# 查看数据库
mysql -h localhost -P 2881 -u root -p -e "SHOW DATABASES;"
```

### 3. 创建知识库

在 Coze Studio 界面中：

1. 进入知识库管理
2. 选择 OceanBase 作为向量存储
3. 上传文档进行向量化
4. 测试向量检索功能

### 4. 性能监控

```bash
# 查看容器资源使用
docker stats coze-oceanbase

# 查看慢查询日志
docker logs coze-oceanbase | grep "slow query"

# 查看连接数
mysql -h localhost -P 2881 -u root -p -e "SHOW PROCESSLIST;"
```

## 适配特点

### 1. 设计原则

#### 架构兼容性设计

- 严格遵循 Coze Studio 核心架构设计原则，确保 OceanBase 适配层与现有系统无缝集成
- 采用委托模式（Delegation Pattern）实现向后兼容，保证现有接口的稳定性和一致性
- 保持与现有向量存储接口的完全兼容，确保系统平滑迁移和升级

#### 性能优先

- 使用 HNSW 索引实现高效的近似最近邻搜索
- 批量操作减少数据库交互次数
- 连接池管理优化资源使用

#### 易于部署

- 单机部署，无需复杂的集群配置
- Docker 一键部署
- 环境变量配置，灵活易用

### 2. 技术亮点

#### 委托模式设计

```go
type OceanBaseClient struct {
    official *OceanBaseOfficialClient
}

func (c *OceanBaseClient) CreateCollection(ctx context.Context, collectionName string) error {
    return c.official.CreateCollection(ctx, collectionName)
}
```

#### 智能配置管理

```go
func DefaultConfig() *Config {
    return &Config{
        Host:     getEnv("OCEANBASE_HOST", "localhost"),
        Port:     getEnvAsInt("OCEANBASE_PORT", 2881),
        User:     getEnv("OCEANBASE_USER", "root"),
        Password: getEnv("OCEANBASE_PASSWORD", ""),
        Database: getEnv("OCEANBASE_DATABASE", "test"),
        // ... 其他配置
    }
}
```

#### 错误处理优化

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

## 故障排查

### 1. 常见问题

#### 连接问题

```bash
# 检查容器状态
docker ps | grep oceanbase

# 检查端口映射
docker port coze-oceanbase

# 测试连接
mysql -h localhost -P 2881 -u root -p -e "SELECT 1;"
```

#### 向量索引问题

```sql
-- 检查索引状态
SHOW INDEX FROM test_vectors;

-- 重建索引
DROP INDEX idx_test_embedding ON test_vectors;
CREATE VECTOR INDEX idx_test_embedding ON test_vectors(embedding)
WITH (distance=cosine, type=hnsw, lib=vsag, m=16, ef_construction=200, ef_search=64);
```

#### 性能问题

```sql
-- 调整内存限制
SET GLOBAL ob_vector_memory_limit_percentage = 50;

-- 查看慢查询
SHOW VARIABLES LIKE 'slow_query_log';
```

### 2. 日志分析

```bash
# 查看 OceanBase 日志
docker logs coze-oceanbase

# 查看应用日志
tail -f logs/coze-studio.log | grep -i "oceanbase\|vector"
```

## 总结

OceanBase 向量数据库在 Coze Studio 中的集成实现了以下目标：

1. **功能完整**: 支持完整的向量存储和检索功能
2. **性能良好**: 通过 HNSW 索引实现高效的向量搜索
3. **部署简单**: 单机部署，无需复杂配置
4. **运维友好**: 低运维成本，易于监控和管理
5. **扩展性强**: 支持水平扩展和垂直扩展

通过这次集成，Coze Studio 为用户提供了一个简单、高效、可靠的向量数据库解决方案，特别适合需要事务支持、部署简单、运维成本低的场景。

## 相关链接

- [OceanBase 官方文档](https://www.oceanbase.com/docs)
- [Coze Studio 项目地址](https://github.com/coze-dev/coze-studio)
