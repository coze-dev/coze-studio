CREATE DATABASE IF NOT EXISTS `default`;
CREATE TABLE IF NOT EXISTS spans_index (
                             span_id        String Codec(ZSTD(1)), -- span id:        [8]byte
                             trace_id       String Codec(ZSTD(1)), -- trace id:       [16]byte
                             parent_span_id String Codec(ZSTD(1)), -- parent span id: [8]byte
                             name           String Codec(ZSTD(1)), -- name
                             kind           Int8   Codec(ZSTD(1)), -- kind: https://github.com/open-telemetry/opentelemetry-proto/blob/30d237e1ff3ab7aa50e0922b5bebdd93505090af/opentelemetry/proto/trace/v1/trace.proto#L101-L129
                             status_code    Int64  Codec(ZSTD(1)), -- 状态码
                             status_msg     String Codec(ZSTD(1)), -- 状态信息
                             log_id    String Codec(ZSTD(1)), -- log_id
                             space_id  Int64  Codec(ZSTD(1)), -- space_id
                             type      Int32  Codec(ZSTD(1)), -- span 节点类型，和 idl enum 对应
                             user_id   Int64  CODEC(ZSTD(1)), -- user id
                             entity_id Int64  Codec(ZSTD(1)), -- 写入实体 id，对应 agent / knowledge id
                             env       String Codec(ZSTD(1)), -- 环境，开发 / 线上
                             version   String Codec(ZSTD(1)), -- 版本
                             input     String Codec(ZSTD(1)), -- 输入，需要展示和全文搜索过滤，单独提取出来

                             start_time_ms UInt64 CODEC(ZSTD(1)), -- 开始时间，单位毫秒
                             INDEX idx(trace_id) TYPE minmax granularity 8192
)
    ENGINE = MergeTree()
ORDER BY (space_id, entity_id, start_time_ms)
PARTITION BY toDate(start_time_ms / 1000)
TTL toDate(start_time_ms / 1000) + INTERVAL 7 DAY
SETTINGS ttl_only_drop_parts = 1,
         storage_policy = 'default';
CREATE TABLE IF NOT EXISTS spans_data (
                            span_id        String Codec(ZSTD(1)), -- span id:        [8]byte
                            trace_id       String Codec(ZSTD(1)), -- trace id:       [16]byte
                            parent_span_id String Codec(ZSTD(1)), -- parent span id: [8]byte
                            name           String Codec(ZSTD(1)), -- name
                            kind           Int8   Codec(ZSTD(1)), -- kind: https://github.com/open-telemetry/opentelemetry-proto/blob/30d237e1ff3ab7aa50e0922b5bebdd93505090af/opentelemetry/proto/trace/v1/trace.proto#L101-L129
                            status_code    Int64  Codec(ZSTD(1)), -- 状态码
                            status_msg     String Codec(ZSTD(1)), -- 状态信息
                            resource_attributes Map(String, String) CODEC(ZSTD(1)), -- 元信息
                            start_time_ms UInt64 CODEC(ZSTD(1)),                    -- 开始时间，单位毫秒
                            end_time_ms   UInt64 CODEC(ZSTD(1)),                    -- 结束时间，单位毫秒
                            log_id         String Codec(ZSTD(1)),                   -- log_id

                            attr_keys Array(LowCardinality(String)) Codec(ZSTD(1)), -- 其他 attr keys
                            attr_values Array(String) Codec(ZSTD(1)),               -- 其他 attr values
                            INDEX idx_log_id log_id TYPE bloom_filter GRANULARITY 1024
)

    ENGINE = MergeTree()
ORDER BY (trace_id, span_id)
PARTITION BY toDate(start_time_ms / 1000)
TTL toDate(start_time_ms / 1000) + INTERVAL 7 DAY
SETTINGS ttl_only_drop_parts = 1,
         index_granularity = 2048,
         storage_policy = 'default';