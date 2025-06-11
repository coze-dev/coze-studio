import { isFunction } from 'lodash-es';

/**
 * 将 { value: label } 形式的结构体转成Select需要的options Array<{ label, value }>
 *   computedValue：将value值转化一次作为options的value
 *   passItem：判断当前value值是否需要跳过遍历
 */
export default function convertMap2options<Value extends number = number>(
  map: Record<string, unknown>,
  convertOptions: {
    computedValue?: (val: unknown) => Value;
    passItem?: (val: unknown) => boolean;
    /**
     * 由于 i18n 的实现方式问题，写成常量的文案需要惰性加载
     * 因此涉及到 i18n 的 { value: label } 结构一律需要写成 { value: () => label }
     * 该属性启用时，会额外进行一次惰性加载
     * @default false
     * @link 
     */
    i18n?: boolean;
  } = {},
) {
  const res: Array<{ label: string; value: Value }> = [];

  for (const [value, label] of Object.entries(map)) {
    const pass = convertOptions.passItem
      ? convertOptions.passItem(value)
      : false;
    if (pass) {
      continue;
    }
    const computedValue = convertOptions.computedValue
      ? convertOptions.computedValue(value)
      : (value as unknown as Value);

    const finalLabel: string = convertOptions.i18n
      ? isFunction(label)
        ? label()
        : label
      : label;
    res.push({ label: finalLabel, value: computedValue });
  }
  return res;
}
