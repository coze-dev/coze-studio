/**
 * @deprecated 非常非常坏，尽快换为 typeSafeJsonParse
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const safeJSONParse: (v: any, emptyValue?: any) => any = (
  v,
  emptyValue,
) => {
  try {
    const json = JSON.parse(v);
    return json;
  } catch (e) {
    return emptyValue ?? void 0;
  }
};
