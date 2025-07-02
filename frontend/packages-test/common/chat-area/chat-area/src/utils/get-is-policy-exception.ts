const policyExceptionCodeList = [
  /** 风控拦截 */
  '700012014',
];

/**
 * 临时为 chat area init 区分是否为风控策略异常
 * 后续需要在 chatCore 配置异常抛出的拦截器
 */
export const getIsPolicyException = (error: Error) => {
  /**
   * 目前外部 chat area init 方法都走了业务封装的 xxxAPI 异常后抛出的错误为 APIError 形状为
   * constructor(
   *  public code: string,
   *  public msg: string | undefined,
   * )
   */
  if ('code' in error) {
    return policyExceptionCodeList.includes(String(error.code));
  }
  return false;
};
