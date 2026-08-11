# Qdrant vector store

Coze Studio can use [Qdrant](https://qdrant.tech/) as the vector store for knowledge-base retrieval.

Run Qdrant as a separate service. Then configure the gRPC endpoint. The standard gRPC port is `6334`.

```bash
export VECTOR_STORE_TYPE="qdrant"
export QDRANT_ADDR="127.0.0.1:6334"
export QDRANT_API_KEY=""
export QDRANT_USE_TLS="false"
export QDRANT_BATCH_SIZE="64"
```

For Qdrant Cloud, use the cluster hostname, API key, and TLS:

```bash
export VECTOR_STORE_TYPE="qdrant"
export QDRANT_ADDR="your-cluster.example.cloud.qdrant.io:6334"
export QDRANT_API_KEY="your-api-key"
export QDRANT_USE_TLS="true"
```

`QDRANT_ADDR` must contain a `host:port` pair. Do not add an `http://` or `https://` prefix.

For Docker Compose, use `host.docker.internal:6334` to connect to Qdrant on the host.

The Helm chart does not install Qdrant. Set `cozeServer.env.QDRANT_ADDR` to your Qdrant gRPC endpoint.

The selected embedding model sets the collection dimensions. Coze Studio checks the schema before it writes to an existing collection.

If an embedding model changes its dimensions, create the affected knowledge base again. Then index its documents again.

If the embedding service supplies dense and sparse vectors, Coze Studio creates both vector types. It combines the results with reciprocal rank fusion.

A dense-only embedding service uses nearest-neighbor search.
