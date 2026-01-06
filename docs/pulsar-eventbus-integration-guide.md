# Pulsar EventBus 集成指南

## 概述

本文档详细介绍了 Apache Pulsar 作为 EventBus 在 Coze Studio 中的集成适配情况，包括架构设计、实现细节、配置说明和使用指南。

## 集成背景

### 为什么选择 Pulsar？

在 Coze Studio 的架构中，EventBus 承担着关键的异步消息传递任务，包括工作流执行、Agent 通信、数据处理管道等核心功能。随着用户规模的增长和业务复杂度的提升，我们需要一个更加强大和灵活的消息队列解决方案。

Pulsar 作为新一代的分布式消息系统，为 Coze Studio 带来了以下核心优势：

1. **高性能**: Pulsar 提供低延迟、高吞吐量的消息传递，能够支撑 Coze Studio 大规模并发的 Agent 执行和工作流处理
2. **多租户**: 原生支持多租户架构，完美契合 Coze Studio 多用户、多工作空间的业务模式
3. **持久化**: 支持消息持久化存储，确保 Agent 执行状态和工作流数据的可靠性，避免因系统重启导致的任务丢失
4. **水平扩展**: 支持计算和存储分离，易于水平扩展，能够随着 Coze Studio 用户增长而平滑扩容
5. **顺序性保障**: Pulsar 提供强一致性的消息顺序保证，确保 Agent 工作流中的步骤按正确顺序执行，避免状态混乱和数据不一致
6. **丰富特性**: 支持消息去重、延迟消息、死信队列等高级特性，为复杂的 AI 工作流提供更强的可靠性保障

### 与其他 MQ 的对比

| 特性                   | Pulsar         | NSQ            | Kafka          | RocketMQ       |
| ---------------------- | -------------- | -------------- | -------------- | -------------- |
| **部署复杂度**   | 中等           | 低             | 中等           | 中等           |
| **性能**         | 高             | 中等           | 高             | 高             |
| **多租户支持**   | 原生支持       | 不支持         | 有限支持       | 有限支持       |
| **消息持久化**   | 强             | 有限           | 强             | 强             |
| **顺序性保障**   | 强             | 弱             | 强             | 强             |
| **水平扩展性**   | 优秀           | 中等           | 良好           | 良好           |
| **扩缩容速度**   | 快速           | 中等           | 慢             | 中等           |
| **运维复杂度**   | 中等           | 低             | 高             | 中等           |
| **生态系统**     | 丰富           | 简单           | 非常丰富       | 丰富           |

#### 水平扩展能力详细对比

**Pulsar 的扩展优势**：
- **计算存储分离**：Broker（计算）和 BookKeeper（存储）独立扩展，可以根据业务需求精确调整资源
- **无状态 Broker**：Broker 节点无状态，可以快速启动和停止，实现秒级扩缩容
- **自动负载均衡**：新增 Broker 后自动进行 Topic 和 Partition 的负载重分配
- **热扩容**：支持在不停服的情况下动态增减节点，对业务无影响

**与其他 MQ 的对比**：
- **Kafka**：需要手动进行 Partition 重分配，扩容过程复杂且耗时，可能影响业务
- **RocketMQ**：虽然支持动态扩容，但 NameServer 和 Broker 的协调机制相对复杂
- **NSQ**：单机架构限制了扩展能力，只能通过增加 Topic 数量来提升吞吐量

这种优秀的扩展能力使得 Pulsar 特别适合 Coze Studio 这种用户增长快速、业务负载波动大的场景。

## 架构设计

### 整体架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Coze Studio   │    │  Pulsar         │    │   EventBus      │
│   Application   │───▶│   Client        │───▶│   Manager       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Apache Pulsar  │
                       │   Cluster       │
                       └─────────────────┘
```

### 核心组件

#### 1. Pulsar Producer

**文件位置**: `backend/infra/impl/eventbus/pulsar/producer.go`

**核心功能**:

```go
type Producer interface {
    Send(ctx context.Context, body []byte, opts ...SendOpt) error
    BatchSend(ctx context.Context, bodyArr [][]byte, opts ...SendOpt) error
}

type producerImpl struct {
    topic    string
    client   pulsar.Client
    producer pulsar.Producer
}
```

**特性**:
- 支持同步和异步发送
- 批量发送优化性能
- JWT 认证支持
- 优雅关闭处理

#### 2. Pulsar Consumer

**文件位置**: `backend/infra/impl/eventbus/pulsar/consumer.go`

**核心功能**:

```go
func RegisterConsumer(serviceURL, topic, group string, 
    consumerHandler eventbus.ConsumerHandler, 
    opts ...eventbus.ConsumerOpt) error
```

**特性**:
- 独占模式消费，保证消息顺序
- 自动重试和错误处理
- 上下文取消支持
- 消息确认和否认机制

#### 3. EventBus 工厂

**文件位置**: `backend/infra/impl/eventbus/eventbus.go`

**集成点**:

```go
case consts.MQTypePulsar:
    return pulsar.NewProducer(nameServer, topic, group)
```

## 使用指南

### 1. 准备项目

```bash
# 克隆项目
git clone https://github.com/coze-dev/coze-studio.git
cd coze-studio
```

### 2. 修改 Docker Compose 配置

在 `docker/docker-compose.yml` 文件中添加 Pulsar 服务：

```yaml
services:
  # 添加 Pulsar 服务
  pulsar:
    image: apachepulsar/pulsar:3.0.12
    container_name: coze-pulsar
    restart: always
    command: >
      sh -c "bin/pulsar standalone"
    ports:
      - "6650:6650"   # Pulsar 服务端口
      - "8080:8080"   # Pulsar 管理端口
    volumes:
      - ./data/pulsar:/pulsar/data
    networks:
      - coze-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/admin/v2/clusters"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s

  # 其他现有服务...
```

### 3. 配置环境变量

修改 `.env` 文件，配置 Coze Studio 使用 Pulsar：

```bash
# 进入 docker 目录
cd docker

# 复制环境配置文件
cp .env.example .env

# 编辑 .env 文件，添加以下配置：
# 消息队列类型
COZE_MQ_TYPE=pulsar

# Pulsar 服务地址
MQ_NAME_SERVER=pulsar://pulsar:6650

# JWT 认证 Token（可选，如果启用了认证）
# PULSAR_JWT_TOKEN=your_jwt_token_here
```

### 4. 启动服务

```bash
# 启动包含 Pulsar 的完整 Coze Studio 服务
docker-compose up -d

# 查看服务启动状态
docker-compose ps
```

### 5. 验证部署

```bash
# 检查 Pulsar 容器状态
docker ps | grep pulsar

# 检查 Pulsar 健康状态
curl -f http://localhost:8080/admin/v2/clusters

# 查看 Pulsar 日志
docker logs coze-pulsar

# 测试 Pulsar 连接
docker exec -it coze-pulsar bin/pulsar-admin clusters list
```

### 6. 访问服务

- **Coze Studio**: `http://localhost:3000`（根据实际配置）
- **Pulsar Admin**: `http://localhost:8080`

现在 Coze Studio 已经成功集成 Pulsar 作为消息队列，所有的事件总线功能都将通过 Pulsar 处理。

## 附录

### A. 生产环境集群部署

生产环境推荐使用 Pulsar 集群部署以获得高可用性和更好的性能。集群部署涉及 ZooKeeper、BookKeeper 和 Broker 等多个组件的配置，配置较为复杂。

**生产环境建议**：
- 使用 Pulsar 集群模式部署，确保高可用性
- 开启 JWT 认证，保障系统安全
- 配置适当的资源限制和监控

详细的集群部署配置请参考 [Apache Pulsar 官方文档](https://pulsar.apache.org/docs/4.1.x/deploy-kubernetes/)。

### B. 可视化管理工具

对于需要图形化界面管理 Pulsar 集群的用户，可以考虑使用 ASP 社区版。ASP 社区版是一个专为 Apache Pulsar 设计的现代化管理平台，提供了直观的 Web 界面来管理集群、租户、命名空间、主题等资源。该平台支持实时监控、性能指标展示、配置管理等功能，大大简化了 Pulsar 集群的日常运维工作。

更多信息请参考：[ASP 社区版文档](https://ascentstream.com/docs/asp/asp-community/overview)

### C. 适配特点

#### 1. 设计原则

**架构兼容性设计**：
- 严格遵循 Coze Studio EventBus 接口规范，确保与现有系统无缝集成
- 采用工厂模式实现多种 MQ 的统一管理
- 保持与 NSQ、Kafka、RocketMQ 实现的接口一致性

**性能优先**：
- 异步批量发送减少网络开销
- 连接池复用降低连接成本
- 消息确认机制保证可靠性

**易于部署**：
- 单机模式快速启动
- Docker 容器化部署
- 环境变量配置，灵活易用

#### 2. 技术亮点

**JWT 认证支持**：
```go
// 自动检测和配置 JWT 认证
if jwtToken := os.Getenv(consts.PulsarJWTToken); jwtToken != "" {
    clientOptions.Authentication = pulsar.NewAuthenticationToken(jwtToken)
    logs.Debugf("Using JWT authentication, token length: %d", len(jwtToken))
}
```

**批量发送优化**：
```go
// 异步批量发送提高性能
for _, body := range bodyArr {
    msg := &pulsar.ProducerMessage{Payload: body}
    if option.ShardingKey != nil {
        msg.Key = *option.ShardingKey
    }
    p.producer.SendAsync(ctx, msg, callback)
}
```

**优雅关闭处理**：
```go
// 监听系统信号，优雅关闭资源
safego.Go(context.Background(), func() {
    signal.WaitExit()
    logs.Infof("shutting down pulsar consumer for topic: %s, group: %s", topic, group)
    cancel()
    consumer.Close()
    client.Close()
})
```

### C. 故障排查

#### 1. 常见问题

**连接问题**：
```bash
# 检查 Pulsar 服务状态
docker exec -it coze-pulsar bin/pulsar-admin brokers healthcheck

# 检查网络连通性
telnet localhost 6650

# 查看连接配置
docker exec -it coze-pulsar cat conf/standalone.conf | grep -E "(advertisedAddress|bindAddress)"
```

**认证问题**：
```bash
# 检查 JWT Token 配置
echo $PULSAR_JWT_TOKEN

# 验证 Token 有效性
docker exec -it coze-pulsar bin/pulsar-admin --auth-plugin org.apache.pulsar.client.impl.auth.AuthenticationToken \
  --auth-params token:$PULSAR_JWT_TOKEN \
  clusters list
```

**性能问题**：
```bash
# 查看 Topic 积压情况
docker exec -it coze-pulsar bin/pulsar-admin topics stats persistent://public/default/your-topic

# 调整批量发送参数
# 在代码中可以通过 SendOpt 配置批量大小和延迟
```

#### 2. 日志分析

```bash
# 查看 Pulsar 服务日志
docker logs coze-pulsar

# 查看应用日志中的 Pulsar 相关信息
tail -f logs/coze-studio.log | grep -i "pulsar\|eventbus"

# 启用详细日志
# 在 Pulsar 配置中设置 rootLogLevel=DEBUG
```

#### 3. 监控指标

```bash
# 获取 Broker 指标
curl http://localhost:8080/metrics/

# 获取特定 Topic 指标
curl http://localhost:8080/admin/v2/persistent/public/default/your-topic/stats

# 监控消费延迟
docker exec -it coze-pulsar bin/pulsar-admin topics subscriptions persistent://public/default/your-topic
```

### D. 最佳实践

#### 1. 生产环境配置

```bash
# 推荐的生产环境配置
COZE_MQ_TYPE=pulsar
MQ_NAME_SERVER=pulsar://pulsar-broker-1:6650,pulsar://pulsar-broker-2:6650,pulsar://pulsar-broker-3:6650
PULSAR_JWT_TOKEN=your-production-jwt-token

# Pulsar 集群配置
# 建议至少 3 个 Broker 节点
# 建议至少 3 个BookKeeper 节点
# 建议至少 3 个 ZooKeeper 节点
```

#### 2. 性能调优

```bash
# Producer 配置优化
# 批量发送大小：1000 条消息或 1MB
# 发送超时：30 秒
# 压缩算法：LZ4

# Consumer 配置优化
# 接收队列大小：1000
# 确认超时：30 秒
# 消费者类型：Exclusive（保证顺序）
```

#### 3. 安全配置

```bash
# 启用 JWT 认证
PULSAR_JWT_TOKEN=your-jwt-token

# 配置访问控制列表（ACL）
# 通过 Pulsar Admin 工具配置 Topic 级别的权限
```

## 总结

Apache Pulsar 在 Coze Studio 中的 EventBus 集成实现了以下目标：

1. **高性能**: 支持高吞吐量、低延迟的消息传递
2. **高可靠**: 消息持久化存储，支持消息确认机制
3. **易扩展**: 支持水平扩展，适应业务增长
4. **易运维**: 丰富的管理工具和监控指标
5. **企业级**: 多租户支持，适合企业级应用场景

通过这次集成，Coze Studio 为用户提供了一个高性能、高可靠、易扩展的消息队列解决方案，特别适合需要高吞吐量、低延迟、企业级特性的场景。

## 相关链接

- [Apache Pulsar 官方文档](https://pulsar.apache.org/docs/)
- [Pulsar Go Client 文档](https://pulsar.apache.org/docs/client-libraries-go/)
- [ASP 社区版文档](https://ascentstream.com/docs/asp/asp-community/overview)
- [Coze Studio 项目地址](https://github.com/coze-dev/coze-studio)
