export enum ReportEventNames {
  /**
   * 通用异常错误
   */
  ChunkLoadError = 'chunk_load_error', // webpack chunk load 失败
  Unhandledrejection = 'unhandledrejection', // 异步错误兜底
  GlobalErrorBoundary = 'global_error_boundary', // 全局的errorBoundary 错误
  NotInstanceError = 'notInstanceError',
  CustomErrorReport = 'custom_error_report', // 统一上报的custom error
}

/**
 *  获取已经明确的错误
 * 
 * 1、CustomError: 业务方 throw new CustomError(ReportEventNames.xxx, 'xxx')
 * 2、AxiosError: 状态码非 2xx;
 * 3、ApiError:  状态码 2xx & 业务code ！== 0
 * 4、ChunkLoadError: webpack chunk load 失败
 * 5、notInstanceError,不继承 Error 的错误，目前 case（semi 表单校验 ）
 */
export type CertainErrorName =
  | 'CustomError'
  | 'AxiosError'
  | 'ApiError'
  | 'ChunkLoadError'
  | 'notInstanceError';
