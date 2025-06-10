export interface ExtErrorInfo {
  code?: number;
  local_message_id?: string;
  reply_id?: string;
  logId?: string;
  rawError?: unknown;
}
export class ChatCoreError extends Error {
  ext: ExtErrorInfo;
  constructor(message: string, ext?: ExtErrorInfo) {
    super(message);
    this.name = 'chatCoreError';
    this.ext = ext || {};
  }

  /**
   * 扁平化错误信息，方便在slardar中筛选错误信息
   */
  flatten = () => {
    const { message, ext } = this;
    return {
      message,
      ...ext,
    };
  };
}
