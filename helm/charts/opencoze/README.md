### 修改 values.yaml 文件

1. 修改各个服务的 storageClassName 字段为对应存储类名称。
```yaml
storageClassName: your-storageClass
```

2. 修改环境变量。

```yaml
env:
    OPENAI_EMBEDDING_BASE_URL: "https://ark.cn-beijing.volces.com/api/v3/embeddings"
    OPENAI_EMBEDDING_MODEL: "doubao-embedding-large"
    OPENAI_EMBEDDING_API_KEY: "your-api-key"
    OPENAI_EMBEDDING_BY_AZURE: "false"
    OPENAI_EMBEDDING_DIMS: "1024"
    ...
    BUILTIN_CM_OPENAI_BASE_URL: "https://ark.cn-beijing.volces.com/api/v3/chat/completions"
    BUILTIN_CM_OPENAI_API_KEY: "your-api-key"
    BUILTIN_CM_OPENAI_BY_AZURE: "false"
    BUILTIN_CM_OPENAI_MODEL: "doubao-seed-1-6"
```

### 部署

```bash
cd helm/charts/opencoze
helm install opencoze --namespace opencoze --create-namespace .
```