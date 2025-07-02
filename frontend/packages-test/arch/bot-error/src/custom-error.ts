export class CustomError extends Error {
  constructor(
    public eventName: string,
    public msg: string,
    public ext?: {
      customGlobalErrorConfig?: {
        title?: string;
        subtitle?: string;
      };
    },
  ) {
    super(msg);
    this.name = 'CustomError';
    this.ext = ext;
  }
}
// sladar beforeSend捕获到的错误需要通过.name判断错误类型
export const isCustomError = (error: unknown): error is CustomError =>
  error instanceof CustomError ||
  (error as CustomError)?.name === 'CustomError';
