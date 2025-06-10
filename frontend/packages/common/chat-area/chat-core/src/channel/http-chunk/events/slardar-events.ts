/**
 * http chunk 的 slardar 自定义事件
 */
export enum SlardarEvents {
  // 调用 controller.abort 的代码发生的报错 不在预期之内
  HTTP_CHUNK_UNEXPECTED_ABORT_ERROR = 'http_chunk_unexpected_abort_error',
}
