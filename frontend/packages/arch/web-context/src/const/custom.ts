// extract from apps/bot/src/constant/custom.ts

const enum CozeTokenInsufficientErrorCode {
  WORKFLOW = '702095072',
  BOT = '702082020',
}
/**
 * Coze Token不足错误码
 * 当出现该错误码的时候，需要额外进行停止拉流操作
 */
export const COZE_TOKEN_INSUFFICIENT_ERROR_CODE = [
  CozeTokenInsufficientErrorCode.BOT,
  CozeTokenInsufficientErrorCode.WORKFLOW,
];
