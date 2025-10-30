# NATS EventBus Integration Guide

## Overview

This document provides a comprehensive guide for integrating NATS as an EventBus in Coze Studio, including architecture design, implementation details, configuration instructions, and usage guidelines.

## Integration Background

### Why Choose NATS?

In Coze Studio's architecture, EventBus plays a critical role in asynchronous message delivery, including workflow execution, Agent communication, data processing pipelines, and other core functions. NATS, as a lightweight and high-performance messaging system, brings the following core advantages to Coze Studio:

1. **Lightweight**: NATS has minimal resource footprint and simple deployment architecture, perfect for cloud-native environments
2. **High Performance**: Provides low-latency, high-throughput messaging that can support Coze Studio's large-scale concurrent Agent execution
3. **Simplicity**: Clean and intuitive API that reduces development and maintenance costs
4. **JetStream Support**: Provides message persistence, replay, and stream processing capabilities through JetStream
5. **Cloud Native**: Native support for Kubernetes, easy to deploy and manage in containerized environments
6. **Security**: Built-in authentication and authorization mechanisms with TLS encryption support

### Comparison with Other MQ Systems

| Feature                | NATS           | NSQ            | Kafka          | RocketMQ       | Pulsar         |
| ---------------------- | -------------- | -------------- | -------------- | -------------- | -------------- |
| **Deployment Complexity** | Very Low   | Low            | Medium         | Medium         | Medium         |
| **Performance**        | Very High      | Medium         | High           | High           | High           |
| **Resource Usage**     | Very Low       | Low            | Medium         | Medium         | Medium         |
| **Message Persistence** | JetStream     | Limited        | Strong         | Strong         | Strong         |
| **Message Ordering**   | Supported      | Weak           | Strong         | Strong         | Strong         |
| **Horizontal Scaling** | Good           | Medium         | Good           | Good           | Excellent      |
| **Operational Complexity** | Very Low  | Low            | High           | Medium         | Medium         |
| **Cloud Native Support** | Excellent    | Medium         | Medium         | Medium         | Good           |

#### NATS Core Advantages

**Lightweight and High Performance**:
- **Memory Usage**: NATS server typically requires only tens of MB to handle millions of messages
- **Startup Speed**: Second-level startup, perfect for microservices and containerized deployments
- **Latency**: Sub-millisecond message latency, suitable for real-time scenarios
- **Throughput**: Single node can handle millions of messages per second

**Simplicity**:
- **Simple Configuration**: Minimal configuration required to run, no complex cluster setup needed
- **Clean API**: Publish/subscribe pattern is simple and intuitive with low learning curve
- **Operations Friendly**: Rich monitoring and debugging tools, easy troubleshooting

**Cloud Native Features**:
- **Kubernetes Integration**: Official Helm Charts and Operators available
- **Service Discovery**: Built-in service discovery mechanism, no external dependencies
- **Elastic Scaling**: Supports dynamic cluster membership changes

## Architecture Design

### Overall Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Coze Studio   │    │   NATS Server   │    │   JetStream     │
│   Application   │    │                 │    │   Storage       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│   Producer      │───▶│   Core NATS     │    │   Streams       │
│   Consumer      │◀───│   JetStream     │◀───│   Consumers     │
│   EventBus      │    │   Clustering    │    │   Key-Value     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Message Flow Patterns

NATS supports two messaging modes in Coze Studio:

1. **Core NATS**: For real-time, lightweight message delivery
   - Publish/Subscribe pattern
   - Request/Response pattern
   - Queue Group pattern

2. **JetStream**: For messages requiring persistence and high reliability
   - Stream storage
   - Message replay
   - Consumer acknowledgment mechanism

## Implementation Details

### Producer Implementation

The Producer is responsible for sending messages to NATS, supporting the following features:

```go
type Producer struct {
    nc     nats.Conn
    js     nats.JetStreamContext
    closed bool
    mu     sync.RWMutex
}

func (p *Producer) SendMessage(ctx context.Context, topic string, message []byte) error {
    // Supports both Core NATS and JetStream modes
    if p.js != nil {
        // JetStream mode: supports message persistence
        _, err := p.js.Publish(topic, message)
        return err
    } else {
        // Core NATS mode: lightweight publishing
        return p.nc.Publish(topic, message)
    }
}
```

### Consumer Implementation

The Consumer is responsible for receiving and processing messages from NATS:

```go
func (c *Consumer) RegisterConsumer(serverURL, topic, group string, handler ConsumerHandler) error {
    // Choose JetStream or Core NATS based on configuration
    if c.useJetStream {
        return c.startJetStreamConsumer(ctx, topic, group, handler)
    } else {
        return c.startCoreConsumer(ctx, topic, group, handler)
    }
}
```

#### JetStream Consumer Features

- **Message Acknowledgment**: Supports manual acknowledgment mechanism to ensure successful message processing
- **Retry Mechanism**: Automatic retry for failed messages with exponential backoff support
- **Sequential Processing**: Single message processing to avoid complexity from batch processing
- **Flow Control**: Precise message flow control to prevent consumer overload

#### Core NATS Consumer Features

- **Queue Groups**: Supports load-balanced message distribution
- **Lightweight**: No persistence overhead, suitable for real-time message processing
- **High Performance**: Extremely low message processing latency

## Configuration Guide

### Environment Variables

Add the following NATS-related configurations in `docker/.env.example`:

```bash
# Backend Event Bus
export COZE_MQ_TYPE="nats"  # Set message queue type to NATS
export MQ_NAME_SERVER="nats:4222"  # NATS server address

# NATS specific configuration
# NATS_SERVER_URL: NATS server connection URL, supports nats:// and tls:// protocols
# For cluster setup, use comma-separated URLs: "nats://nats1:4222,nats://nats2:4222"
# For TLS connection: "tls://nats:4222"
export NATS_SERVER_URL="nats://nats:4222"

# NATS_JWT_TOKEN: JWT token for NATS authentication (leave empty for no auth)
export NATS_JWT_TOKEN=""

# NATS_NKEY_SEED: Path to NATS seed file for NKey authentication (optional)
export NATS_NKEY_SEED=""

# NATS_USERNAME: Username for NATS authentication (optional)
export NATS_USERNAME=""

# NATS_PASSWORD: Password for NATS authentication (optional)
export NATS_PASSWORD=""

# NATS_TOKEN: Token for NATS authentication (optional)
export NATS_TOKEN=""

# NATS_STREAM_REPLICAS: Number of replicas for JetStream streams (default: 1)
export NATS_STREAM_REPLICAS="1"

# NATS_USE_JETSTREAM: Enable JetStream mode for message persistence and reliability (default: false)
export NATS_USE_JETSTREAM="true"
```

### Docker Compose Configuration

NATS service configuration in `docker-compose.yml`:

```yaml
nats:
  image: nats:2.10.24-alpine
  container_name: nats
  restart: unless-stopped
  command:
    - "--jetstream"              # Enable JetStream
    - "--store_dir=/data"        # Data storage directory
    - "--max_memory_store=1GB"   # Memory storage limit
    - "--max_file_store=10GB"    # File storage limit
  ports:
    - "4222:4222"   # Client connection port
    - "8222:8222"   # HTTP monitoring port
    - "6222:6222"   # Cluster communication port
  volumes:
    - ./volumes/nats:/data
  networks:
    - coze-network
  healthcheck:
    test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8222/"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

### Application Configuration

Configure NATS in Coze Studio application through environment variables:

```go
// Read configuration from environment variables
mqType := os.Getenv("COZE_MQ_TYPE")
natsURL := os.Getenv("NATS_SERVER_URL")
jwtToken := os.Getenv("NATS_JWT_TOKEN")
seedFile := os.Getenv("NATS_NKEY_SEED")
streamReplicas := os.Getenv("NATS_STREAM_REPLICAS")

// Create NATS EventBus
if mqType == "nats" {
    config := &nats.Config{
        ServerURL:      natsURL,
        JWTToken:       jwtToken,
        SeedFile:       seedFile,
        StreamReplicas: streamReplicas,
    }
    
    eventBus, err := nats.NewProducer(config)
    if err != nil {
        log.Fatal("Failed to create NATS producer:", err)
    }
}
```

## Deployment Guide

### Docker Deployment

1. **Configure Environment Variables**:
   ```bash
   cp docker/.env.example docker/.env
   # Edit .env file, set COZE_MQ_TYPE="nats"
   ```

2. **Start Services**:
   ```bash
   cd docker
   docker-compose up -d nats
   ```

3. **Verify Deployment**:
   ```bash
   # Check NATS service status
   docker-compose ps nats
   
   # View NATS monitoring interface
   curl http://localhost:8222/varz
   ```

### Kubernetes Deployment

Deploy NATS using the official Helm Chart:

```bash
# Add NATS Helm repository
helm repo add nats https://nats-io.github.io/k8s/helm/charts/

# Install NATS
helm install nats nats/nats --set nats.jetstream.enabled=true
```

### Production Environment Configuration

For production environments, the following configuration optimizations are recommended:

1. **Cluster Deployment**:
   ```yaml
   nats:
     cluster:
       enabled: true
       replicas: 3
   ```

2. **Persistent Storage**:
   ```yaml
   nats:
     jetstream:
       fileStore:
         pvc:
           size: 100Gi
           storageClassName: fast-ssd
   ```

3. **Resource Limits**:
   ```yaml
   nats:
     resources:
       limits:
         cpu: 2000m
         memory: 4Gi
       requests:
         cpu: 500m
         memory: 1Gi
   ```

4. **Security Configuration**:
   ```yaml
   nats:
     auth:
       enabled: true
       token: "your-secure-token"
     tls:
       enabled: true
   ```

## Monitoring and Operations

### Monitoring Metrics

NATS provides rich monitoring metrics accessible through HTTP endpoints:

- **Server Information**: `GET /varz`
- **Connection Information**: `GET /connz`
- **Subscription Information**: `GET /subsz`
- **JetStream Information**: `GET /jsz`

### Key Monitoring Metrics

1. **Performance Metrics**:
   - Message throughput (messages/sec)
   - Message latency (latency)
   - Connection count (connections)

2. **Resource Metrics**:
   - Memory usage (memory usage)
   - CPU utilization (cpu usage)
   - Disk usage (disk usage)

3. **JetStream Metrics**:
   - Stream count (streams)
   - Consumer count (consumers)
   - Storage usage (storage usage)

### Log Management

NATS supports multiple log levels and output formats:

```bash
# Enable debug logging
nats-server --debug

# Log output to file
nats-server --log /var/log/nats.log

# JSON format logging
nats-server --logtime --log_size_limit 100MB
```

## Performance Optimization

### Connection Pool Optimization

```go
// Configure connection options
opts := []nats.Option{
    nats.MaxReconnects(10),
    nats.ReconnectWait(2 * time.Second),
    nats.Timeout(5 * time.Second),
}

nc, err := nats.Connect(serverURL, opts...)
```

### JetStream Optimization

```go
// Configure JetStream options
jsOpts := []nats.JSOpt{
    nats.PublishAsyncMaxPending(1000),
    nats.PublishAsyncErrHandler(func(js nats.JetStream, originalMsg *nats.Msg, err error) {
        log.Printf("Async publish error: %v", err)
    }),
}

js, err := nc.JetStream(jsOpts...)
```

### Consumer Optimization

```go
// Configure consumer options
consumerOpts := []nats.SubOpt{
    nats.Durable("coze-consumer"),
    nats.MaxDeliver(3),
    nats.AckWait(30 * time.Second),
    nats.MaxAckPending(100),
}

sub, err := js.PullSubscribe(topic, "coze-group", consumerOpts...)
```

## Troubleshooting

### Common Issues

1. **Connection Failures**:
   - Check if NATS service is running
   - Verify network connectivity
   - Confirm port configuration is correct

2. **Message Loss**:
   - Check if JetStream is enabled
   - Verify message acknowledgment mechanism
   - Review error logs

3. **Performance Issues**:
   - Monitor resource usage
   - Check for message backlog
   - Optimize consumer configuration

### Debugging Tools

NATS provides rich debugging tools:

```bash
# NATS CLI tools
nats server info
nats stream list
nats consumer list

# Monitor message flow
nats sub "coze.>"
nats pub "coze.test" "hello world"
```

## Best Practices

### Subject Naming Conventions

Recommend using hierarchical subject naming:

```
coze.workflow.{workflow_id}.{event_type}
coze.agent.{agent_id}.{action}
coze.knowledge.{kb_id}.{operation}
```

### Error Handling

Implement comprehensive error handling mechanisms:

```go
func (c *Consumer) handleMessage(msg *nats.Msg) {
    defer func() {
        if r := recover(); r != nil {
            log.Printf("Message processing panic: %v", r)
            msg.Nak() // Reject message, trigger retry
        }
    }()
    
    if err := c.processMessage(msg.Data); err != nil {
        log.Printf("Message processing error: %v", err)
        msg.Nak()
        return
    }
    
    msg.Ack() // Acknowledge successful message processing
}
```

### Resource Management

Properly manage NATS connections and resources:

```go
func (p *Producer) Close() error {
    p.mu.Lock()
    defer p.mu.Unlock()
    
    if p.closed {
        return nil
    }
    
    p.closed = true
    
    if p.nc != nil {
        p.nc.Close()
    }
    
    return nil
}
```

## Summary

NATS as Coze Studio's EventBus solution provides lightweight, high-performance, and easy-to-deploy messaging capabilities. Through JetStream extensions, NATS can also provide enterprise-grade message persistence and stream processing functionality.

Key advantages of choosing NATS:
- **Simplicity**: Low deployment and maintenance costs
- **Performance**: Extremely high message processing performance
- **Cloud Native**: Perfect fit for containerized and Kubernetes environments
- **Reliability**: JetStream provides message persistence and acknowledgment mechanisms
- **Scalability**: Supports cluster deployment and horizontal scaling

NATS is particularly suitable for the following scenarios:
- Inter-service communication in microservice architectures
- Real-time data stream processing
- Message delivery for cloud-native applications
- Low-latency messaging systems
- Resource-constrained deployment environments