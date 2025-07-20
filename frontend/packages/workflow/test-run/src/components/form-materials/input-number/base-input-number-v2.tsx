/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
import { useRef, useMemo, useEffect } from 'react';

import cls from 'classnames';
import BigNumber, { type BigNumber as IBigNumber } from 'bignumber.js';
import {
  IconCozArrowDown,
  IconCozArrowUp,
} from '@coze-arch/coze-design/icons';
import { Input, type InputProps } from '@coze-arch/coze-design';

import css from './base-input-number-v2.module.less';

export interface InputNumberV2Props {
  value?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  validateStatus?: InputProps['validateStatus'];
  disabled?: boolean;
  'data-testid'?: string;
  onChange?: (v?: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  /** 整型 */
  int?: boolean;
}

/** 是否是合法的数字字符串 */
function isValidNumber(str: string) {
  try {
    const value = new BigNumber(str);
    return !value.isNaN();
  } catch {
    return false;
  }
}

function normalizeNumber(str?: string) {
  if (!str || !isValidNumber(str)) {
    return;
  }
  return new BigNumber(str);
}

export const InputNumberV2Adapter: React.FC<InputNumberV2Props> = ({
  int,
  onChange,
  onBlur,
  ...props
}) => {
  const isShowButtons = useMemo(() => !props.disabled, [props.disabled]);
  const verifiedRef = useRef<undefined | IBigNumber>(
    normalizeNumber(props.value),
  );

  const fixed = (num: IBigNumber, innerInt?: boolean) =>
    innerInt ? num.toFixed(0, BigNumber.ROUND_DOWN) : num.toFixed();

  const handleBlur = () => {
    if (props.value === '' || props.value === undefined) {
      /** 失焦时若值为空，则同时清空验证值 */
      verifiedRef.current = undefined;
      if (props.value === '') {
        // 如果是空字符串需要主动转换为 undefined
        onChange?.(undefined);
      }
    } else {
      /** 失焦时若值不为空，则需要验证值的合法性 */
      /**
       * 1. 若值本身合法，则对值做格式化
       * 2. 若值不合法，则采纳最近一次的合法值
       * 3. 若都没有，则返回 undefined
       */
      let next: undefined | string;
      const nextBig = normalizeNumber(props.value) || verifiedRef.current;
      if (nextBig) {
        next = fixed(nextBig, int);
      }
      if (next !== props.value) {
        onChange?.(next);
      }
    }
    onBlur?.();
  };

  const handlePlus = () => {
    let next = '1';
    if (verifiedRef.current) {
      const nextNum = verifiedRef.current.plus('1');
      next = fixed(nextNum, int);
    }
    onChange?.(next);
  };

  const handleMinus = () => {
    let next = '0';
    if (verifiedRef.current) {
      const nextNum = verifiedRef.current.minus('1');
      next = fixed(nextNum, int);
    }
    onChange?.(next);
  };

  /** 当值发生变化，需要把值同步到合法数字 */
  useEffect(() => {
    if (props.value === '' || props.value === undefined) {
      verifiedRef.current = undefined;
    }
    const next = normalizeNumber(props.value);
    if (next) {
      verifiedRef.current = normalizeNumber(props.value);
    }
  }, [props.value]);

  return (
    <Input
      onChange={onChange}
      onBlur={handleBlur}
      suffix={
        <div className={css.buttons}>
          <div className={cls(css.button, css.up)} onClick={handlePlus}>
            <IconCozArrowUp />
          </div>
          <div className={cls(css.button, css.down)} onClick={handleMinus}>
            <IconCozArrowDown />
          </div>
        </div>
      }
      hideSuffix={!isShowButtons}
      {...props}
    />
  );
};
