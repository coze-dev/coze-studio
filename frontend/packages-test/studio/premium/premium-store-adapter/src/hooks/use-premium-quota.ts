const quota = {
  /** 当前消耗的额度，对应到套餐内每天刷新的 */
  remain: 0,
  total: 0,
  used: 0,
  /** 额外购买的额度，目前只处理国内 */
  extraRemain: 0,
  extraTotal: 0,
  extraUsed: 0,
};
export function usePremiumQuota() {
  return quota;
}
