/**
 * 承接所有 sdk 的 slardar 自定义事件
 */
export enum SlardarEvents {
  // 拉取历史异常
  MESSAGE_FETCH_HISTORY_ERROR = 'message_fetch_history_error',
  // 清空上下文异常
  MESSAGE_CLEAR_CONTEXT_ERROR = 'message_clear_context_error',
  // 清空历史异常
  MESSAGE_CLEAR_HISTORY_ERROR = 'message_clear_history_error',
  // 删除消息异常
  MESSAGE_DELETE_ERROR = 'message_delete_error',
  // 打断消息
  MESSAGE_INTERRUPT_ERROR = 'message_interrupt_error',
  // 点赞/点踩消息
  MESSAGE_REPORT_ERROR = 'message_report_error',
  // 语音转文字
  CHAT_ASR_ERROR = 'chat_asr_error',
}
