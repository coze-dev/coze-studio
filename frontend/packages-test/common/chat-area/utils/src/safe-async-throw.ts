/**
 * 非线上环境阻塞；构建后仅做异常输出和异步抛出错误
 */
export const safeAsyncThrow = (e: string) => {
  const err = new Error(`[chat-area] ${e}`);
  if (IS_DEV_MODE || IS_BOE) {
    throw err;
  }

  setTimeout(() => {
    throw err;
  });
};
