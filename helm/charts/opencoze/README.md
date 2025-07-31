### Modify values.yaml file

1. Modify the storageClassName field of each service to the corresponding storage class name.
```yaml
storageClassName: your-storageClass
```

2. Modify environment variables.

```yaml
env:
    MQ_NAME_SERVER: "http://opencoze-rocketmq-namesrv:9876"
    MINIO_ENDPOINT: "opencoze-minio:9000"
    MINIO_API_HOST: "http://opencoze-minio:9000"
    USE_MINIO_PROXY: "false"
    ...
    ARK_EMBEDDING_AK: "your_api_key"
    ARK_EMBEDDING_MODEL: "doubao-embedding-large"
    ARK_EMBEDDING_BASE_URL: "https://ark.cn-beijing.volces.com/api/v3/embeddings"
    ...
    BUILTIN_CM_ARK_API_KEY: "your_api_key"
    BUILTIN_CM_ARK_MODEL: "doubao-seed-1-6"
    BUILTIN_CM_ARK_BASE_URL: "https://ark.cn-beijing.volces.com/api/v3/chat/completions"
```

### Deployment

```bash
cd helm/charts/opencoze
helm install opencoze --namespace opencoze --create-namespace .
```