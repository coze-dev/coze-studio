# Pulsar EventBus Integration Guide

## Overview

This document provides a comprehensive guide for integrating Apache Pulsar as an EventBus in Coze Studio, including architecture design, implementation details, configuration instructions, and usage guidelines.

## Integration Background

### Why Choose Pulsar?

In Coze Studio's architecture, EventBus plays a critical role in asynchronous message delivery, including workflow execution, Agent communication, data processing pipelines, and other core functions. As user scale grows and business complexity increases, we need a more powerful and flexible message queue solution.

Pulsar, as a next-generation distributed messaging system, brings the following core advantages to Coze Studio:

1. **High Performance**: Pulsar provides low-latency, high-throughput messaging that can support Coze Studio's large-scale concurrent Agent execution and workflow processing
2. **Multi-tenancy**: Native support for multi-tenant architecture, perfectly matching Coze Studio's multi-user, multi-workspace business model
3. **Persistence**: Supports message persistence storage, ensuring the reliability of Agent execution states and workflow data, preventing task loss due to system restarts
4. **Horizontal Scaling**: Supports separation of compute and storage, easy to scale horizontally, enabling smooth scaling as Coze Studio's user base grows
5. **Message Ordering**: Pulsar provides strong consistency and message ordering guarantees, ensuring that Agent workflow steps execute in the correct sequence, preventing state confusion and data inconsistency
6. **Rich Features**: Supports message deduplication, delayed messages, dead letter queues, and other advanced features, providing stronger reliability guarantees for complex AI workflows

### Comparison with Other MQ Systems

| Feature                | Pulsar         | NSQ            | Kafka          | RocketMQ       |
| ---------------------- | -------------- | -------------- | -------------- | -------------- |
| **Deployment Complexity** | Medium     | Low            | Medium         | Medium         |
| **Performance**        | High           | Medium         | High           | High           |
| **Multi-tenancy**      | Native Support | Not Supported  | Limited        | Limited        |
| **Message Persistence** | Strong        | Limited        | Strong         | Strong         |
| **Message Ordering**   | Strong         | Weak           | Strong         | Strong         |
| **Horizontal Scaling** | Excellent      | Medium         | Good           | Good           |
| **Scaling Speed**      | Fast           | Medium         | Slow           | Medium         |
| **Operational Complexity** | Medium    | Low            | High           | Medium         |
| **Ecosystem**          | Rich           | Simple         | Very Rich      | Rich           |

#### Detailed Comparison of Horizontal Scaling Capabilities

**Pulsar's Scaling Advantages**:
- **Compute-Storage Separation**: Broker (compute) and BookKeeper (storage) scale independently, allowing precise resource adjustment based on business needs
- **Stateless Brokers**: Broker nodes are stateless and can start/stop quickly, enabling second-level scaling
- **Automatic Load Balancing**: Automatic redistribution of Topics and Partitions when new Brokers are added
- **Hot Scaling**: Supports dynamic addition/removal of nodes without service interruption

**Comparison with Other MQ Systems**:
- **Kafka**: Requires manual Partition rebalancing, complex and time-consuming scaling process that may affect business operations
- **RocketMQ**: While supporting dynamic scaling, the coordination mechanism between NameServer and Broker is relatively complex
- **NSQ**: Single-machine architecture limits scaling capabilities, can only improve throughput by increasing Topic count

This excellent scaling capability makes Pulsar particularly suitable for scenarios like Coze Studio with rapid user growth and fluctuating business loads.

## Architecture Design

### Overall Architecture

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

### Core Components

#### 1. Pulsar Producer

**File Location**: `backend/infra/impl/eventbus/pulsar/producer.go`

**Core Functions**:

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

**Features**:
- Supports synchronous and asynchronous sending
- Batch sending for performance optimization
- JWT authentication support
- Graceful shutdown handling

#### 2. Pulsar Consumer

**File Location**: `backend/infra/impl/eventbus/pulsar/consumer.go`

**Core Functions**:

```go
func RegisterConsumer(serviceURL, topic, group string, 
    consumerHandler eventbus.ConsumerHandler, 
    opts ...eventbus.ConsumerOpt) error
```

**Features**:
- Exclusive mode consumption for message ordering
- Automatic retry and error handling
- Context cancellation support
- Message acknowledgment and negative acknowledgment mechanisms

#### 3. EventBus Factory 

**File Location**: `backend/infra/impl/eventbus/eventbus.go`

**Integration Point**:

```go
case consts.MQTypePulsar:
    return pulsar.NewProducer(nameServer, topic, group)
```

## Configuration

### Environment Variables

#### Required Configuration

```bash
# Message queue type
COZE_MQ_TYPE=pulsar

# Pulsar service address
MQ_NAME_SERVER=pulsar://localhost:6650
```

#### Optional Configuration

```bash
# JWT authentication token (if authentication is enabled)
PULSAR_JWT_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9.example_token
```

### Docker Configuration

#### Standalone Pulsar Deployment

```yaml
services:
  pulsar:
    image: apachepulsar/pulsar:3.0.12
    container_name: coze-pulsar
    restart: always
    command: >
      sh -c "bin/pulsar standalone"
    ports:
      - "6650:6650"   # Pulsar service port
      - "8080:8080"   # Pulsar admin port
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
```

#### Production Cluster Deployment

For production environments, it's recommended to use Pulsar cluster deployment to achieve high availability and better performance. Cluster deployment involves configuring multiple components including ZooKeeper, BookKeeper, and Broker, which can be quite complex.

**Production Environment Recommendations**:
- Use Pulsar cluster mode deployment for high availability
- Enable JWT authentication for security
- Configure appropriate resource limits and monitoring

For detailed cluster deployment configuration, please refer to the [Apache Pulsar Official Documentation](https://pulsar.apache.org/docs/4.1.x/deploy-kubernetes/).

## Usage Guide

### 1. Prepare Project

```bash
# Clone the project
git clone https://github.com/coze-dev/coze-studio.git
cd coze-studio
```

### 2. Modify Docker Compose Configuration

Add the Pulsar service to your `docker/docker-compose.yml` file:

```yaml
services:
  # Add Pulsar service
  pulsar:
    image: apachepulsar/pulsar:3.0.12
    container_name: coze-pulsar
    restart: always
    command: >
      sh -c "bin/pulsar standalone"
    ports:
      - "6650:6650"   # Pulsar service port
      - "8080:8080"   # Pulsar admin port
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

  # Other existing services...
```

### 3. Configure Environment Variables

Modify the `.env` file to configure Coze Studio to use Pulsar:

```bash
# Enter docker directory
cd docker

# Copy environment configuration file
cp .env.example .env

# Edit .env file and add the following configuration:
# Message queue type
COZE_MQ_TYPE=pulsar

# Pulsar service address
MQ_NAME_SERVER=pulsar://pulsar:6650

# JWT authentication token (optional, if authentication is enabled)
# PULSAR_JWT_TOKEN=your_jwt_token_here
```

### 4. Start Services

```bash
# Start complete Coze Studio services including Pulsar
docker-compose up -d

# Check service startup status
docker-compose ps
```

### 5. Verify Deployment

```bash
# Check Pulsar container status
docker ps | grep pulsar

# Check Pulsar health status
curl -f http://localhost:8080/admin/v2/clusters

# View Pulsar logs
docker logs coze-pulsar

# Test Pulsar connection
docker exec -it coze-pulsar bin/pulsar-admin clusters list
```

### 6. Access Services

- **Coze Studio**: `http://localhost:3000` (based on actual configuration)
- **Pulsar Admin**: `http://localhost:8080`

Now Coze Studio has successfully integrated Pulsar as the message queue, and all EventBus functionality will be handled through Pulsar.

## Appendix

### A. Production Cluster Deployment

For production environments, it's recommended to use Pulsar cluster deployment to achieve high availability and better performance. Cluster deployment involves configuring multiple components including ZooKeeper, BookKeeper, and Broker, which can be quite complex.

**Production Environment Recommendations**:
- Use Pulsar cluster mode deployment for high availability
- Enable JWT authentication for security
- Configure appropriate resource limits and monitoring

For detailed cluster deployment configuration, please refer to the [Apache Pulsar Official Documentation](https://pulsar.apache.org/docs/4.1.x/deploy-kubernetes/).

### B. Visual Management Tools

For users who need a graphical interface to manage Pulsar clusters, consider using ASP Community Edition. ASP Community Edition is a modern management platform designed specifically for Apache Pulsar, providing an intuitive web interface to manage clusters, tenants, namespaces, topics, and other resources. The platform supports real-time monitoring, performance metrics display, configuration management, and other features that greatly simplify the daily operations of Pulsar clusters.

For more information, please refer to: [ASP Community Edition Documentation](https://ascentstream.com/docs/asp/asp-community/overview)

### C. Integration Features

#### 1. Design Principles

**Architecture Compatibility Design**:
- Strictly follows Coze Studio EventBus interface specifications for seamless integration
- Uses factory pattern for unified management of multiple MQ systems
- Maintains interface consistency with NSQ, Kafka, and RocketMQ implementations

**Performance First**:
- Asynchronous batch sending reduces network overhead
- Connection pooling reduces connection costs
- Message acknowledgment mechanism ensures reliability

**Easy Deployment**:
- Standalone mode for quick startup
- Docker containerized deployment
- Environment variable configuration for flexibility

#### 2. Technical Highlights

**JWT Authentication Support**:
```go
// Automatically detect and configure JWT authentication
if jwtToken := os.Getenv(consts.PulsarJWTToken); jwtToken != "" {
    clientOptions.Authentication = pulsar.NewAuthenticationToken(jwtToken)
    logs.Debugf("Using JWT authentication, token length: %d", len(jwtToken))
}
```

**Batch Sending Optimization**:
```go
// Asynchronous batch sending for improved performance
for _, body := range bodyArr {
    msg := &pulsar.ProducerMessage{Payload: body}
    if option.ShardingKey != nil {
        msg.Key = *option.ShardingKey
    }
    p.producer.SendAsync(ctx, msg, callback)
}
```

**Graceful Shutdown Handling**:
```go
// Listen for system signals and gracefully close resources
safego.Go(context.Background(), func() {
    signal.WaitExit()
    logs.Infof("shutting down pulsar consumer for topic: %s, group: %s", topic, group)
    cancel()
    consumer.Close()
    client.Close()
})
```

### C. Troubleshooting

#### 1. Common Issues

**Connection Issues**:
```bash
# Check Pulsar service status
docker exec -it coze-pulsar bin/pulsar-admin brokers healthcheck

# Check network connectivity
telnet localhost 6650

# View connection configuration
docker exec -it coze-pulsar cat conf/standalone.conf | grep -E "(advertisedAddress|bindAddress)"
```

**Authentication Issues**:
```bash
# Check JWT Token configuration
echo $PULSAR_JWT_TOKEN

# Verify token validity
docker exec -it coze-pulsar bin/pulsar-admin --auth-plugin org.apache.pulsar.client.impl.auth.AuthenticationToken \
  --auth-params token:$PULSAR_JWT_TOKEN \
  clusters list
```

**Performance Issues**:
```bash
# View topic backlog
docker exec -it coze-pulsar bin/pulsar-admin topics stats persistent://public/default/your-topic

# Adjust batch sending parameters
# Batch size and delay can be configured through SendOpt in code
```

#### 2. Log Analysis

```bash
# View Pulsar service logs
docker logs coze-pulsar

# View Pulsar-related information in application logs
tail -f logs/coze-studio.log | grep -i "pulsar\|eventbus"

# Enable verbose logging
# Set rootLogLevel=DEBUG in Pulsar configuration
```

#### 3. Monitoring Metrics

```bash
# Get broker metrics
curl http://localhost:8080/metrics/

# Get specific topic metrics
curl http://localhost:8080/admin/v2/persistent/public/default/your-topic/stats

# Monitor consumption lag
docker exec -it coze-pulsar bin/pulsar-admin topics subscriptions persistent://public/default/your-topic
```

### D. Best Practices

#### 1. Production Environment Configuration

```bash
# Recommended production environment configuration
COZE_MQ_TYPE=pulsar
MQ_NAME_SERVER=pulsar://pulsar-broker-1:6650,pulsar://pulsar-broker-2:6650,pulsar://pulsar-broker-3:6650
PULSAR_JWT_TOKEN=your-production-jwt-token

# Pulsar cluster configuration
# Recommend at least 3 Broker nodes
# Recommend at least 3 BookKeeper nodes
# Recommend at least 3 ZooKeeper nodes
```

#### 2. Performance Tuning

```bash
# Producer configuration optimization
# Batch size: 1000 messages or 1MB
# Send timeout: 30 seconds
# Compression algorithm: LZ4

# Consumer configuration optimization
# Receive queue size: 1000
# Acknowledgment timeout: 30 seconds
# Consumer type: Exclusive (ensures ordering)
```

#### 3. Security Configuration

```bash
# Enable JWT authentication
PULSAR_JWT_TOKEN=your-jwt-token

# Configure Access Control Lists (ACL)
# Configure topic-level permissions through Pulsar Admin tools
```

## Summary

The Apache Pulsar EventBus integration in Coze Studio achieves the following goals:

1. **High Performance**: Supports high-throughput, low-latency messaging
2. **High Reliability**: Message persistence storage with acknowledgment mechanisms
3. **Easy Scaling**: Supports horizontal scaling to accommodate business growth
4. **Easy Operations**: Rich management tools and monitoring metrics
5. **Enterprise-grade**: Multi-tenancy support for enterprise applications

Through this integration, Coze Studio provides users with a high-performance, highly reliable, and easily scalable message queue solution, particularly suitable for scenarios requiring high throughput, low latency, and enterprise-grade features.

## Related Links

- [Apache Pulsar Official Documentation](https://pulsar.apache.org/docs/)
- [Pulsar Go Client Documentation](https://pulsar.apache.org/docs/client-libraries-go/)
- [ASP Community Edition Documentation](https://ascentstream.com/docs/asp/asp-community/overview)
- [Coze Studio Project Repository](https://github.com/coze-dev/coze-studio)
