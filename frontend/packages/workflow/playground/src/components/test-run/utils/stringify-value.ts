import { isBoolean, isNumber } from 'lodash-es';

// 将表单值转换为testrun接口协议格式
const stringifyValue = (
  values: object,
  stringifyKeys?: string[],
): Record<string, string> | undefined => {
  if (!values) {
    return undefined;
  }
  return Object.entries(values).reduce<Record<string, string>>(
    (buf, [k, v]) => {
      if (isBoolean(v) || isNumber(v)) {
        buf[k] = String(v);
      } else if (stringifyKeys?.includes(k)) {
        buf[k] = JSON.stringify(v);
      } else {
        buf[k] = v as string;
      }
      return buf;
    },
    {},
  );
};

// 保证传入的默认值都是string类型；目前表单中的值都是string类型，可以简单这么处理，后续可能需要多默认值类型进行校验
const stringifyDefaultValue = (value: object) => {
  if (!value) {
    return undefined;
  }
  return Object.keys(value).reduce((acc, key) => {
    const val = value[key];
    // bool 需要特殊处理
    if (typeof val === 'string' || isBoolean(val)) {
      acc[key] = val;
    } else {
      acc[key] = JSON.stringify(value[key]);
    }
    return acc;
  }, {});
};

export { stringifyValue, stringifyDefaultValue };
