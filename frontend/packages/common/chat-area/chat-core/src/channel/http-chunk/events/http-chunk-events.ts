export enum HttpChunkEvents {
  // 收到消息
  MESSAGE_RECEIVED = 'http_chunk_message_received',
  // 收到消息异常
  MESSAGE_RECEIVED_INVALID = 'http_chunk_message_received_invalid',
  // 整体拉流超时
  TOTAL_FETCH_TIMEOUT = 'http_chunk_total_fetch_timeout',
  // 包间超时
  BETWEEN_CHUNK_TIMEOUT = 'http_chunk_between_chunk_timeout',
  // 开始 fetch
  FETCH_START = 'http_chunk_fetch_start',
  // fetch 请求成功
  FETCH_SUCCESS = 'http_chunk_fetch_success',
  // fetch 请求异常
  FETCH_ERROR = 'http_chunk_fetch_error',
  // 无效的消息格式
  INVALID_MESSAGE = 'http_chunk_invalid_message',
  // 拉流开始
  READ_STREAM_START = 'http_chunk_read_stream_start',
  // 拉流异常
  READ_STREAM_ERROR = 'http_chunk_read_stream_error',
  // 从 fetch 到 read stream 完整成功
  ALL_SUCCESS = 'http_chunk_all_success',
}
