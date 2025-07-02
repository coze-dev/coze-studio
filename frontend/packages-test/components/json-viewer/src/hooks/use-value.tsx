import { useMemo } from 'react';

import { isBoolean, isNull, isNumber, isObject, isString } from 'lodash-es';

import { isBigNumber, bigNumbertoString } from '../utils/big-number';
import { generateStrAvoidEscape } from '../utils';
import { type Field } from '../types';
import { LogValueStyleType } from '../constants';
import { LongStrValue, MAX_LENGTH } from '../components/long-str-value';

export const useValue = (value: Field['value']) => {
  const v = useMemo(() => {
    if (isNull(value)) {
      return {
        value: 'null',
        type: LogValueStyleType.Default,
      };
    } else if (isObject(value)) {
      // 大数字返回数字类型，值用字符串
      if (isBigNumber(value)) {
        return {
          value: bigNumbertoString(value),
          type: LogValueStyleType.Number,
        };
      }

      return {
        value: '',
        type: LogValueStyleType.Default,
      };
    } else if (isBoolean(value)) {
      return {
        value: value.toString(),
        type: LogValueStyleType.Boolean,
      };
    } else if (isString(value)) {
      if (value === '') {
        return {
          value: '""',
          type: LogValueStyleType.Default,
        };
      }
      if (value.length > MAX_LENGTH) {
        return {
          value: <LongStrValue str={value} />,
          type: LogValueStyleType.Default,
        };
      }
      return {
        value: generateStrAvoidEscape(value),
        // value: generateStr2Link(value, avoidEscape), 先取消做 link 解析
        type: LogValueStyleType.Default,
      };
    } else if (isNumber(value)) {
      return {
        value,
        type: LogValueStyleType.Number,
      };
    }
    return {
      value,
      type: LogValueStyleType.Default,
    };
  }, [value]);
  return v;
};
