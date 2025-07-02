/* eslint-disable @typescript-eslint/no-magic-numbers */
import { useEffect, useState, type FC } from 'react';

import { useTimeoutConfig } from '@coze-workflow/nodes';
import { logger } from '@coze-arch/logger';
import { Input } from '@coze-arch/coze-design';

import { type SettingOnErrorItemProps } from '../../types';

// 毫秒转秒（智能去除末尾零）
const msToSeconds = (ms: number) => {
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
  });
  return formatter.format(ms / 1000);
};

/**
 * 超时
 */
export const Timeout: FC<SettingOnErrorItemProps<number>> = ({
  value,
  onChange,
  readonly,
}) => {
  const timeoutConfig = useTimeoutConfig();
  const [inputValue, setInputValue] = useState('');

  // 后端毫秒转前端秒显示
  useEffect(() => {
    const seconds = msToSeconds(value ?? timeoutConfig.default);
    setInputValue(seconds);
  }, [timeoutConfig.default, value]);

  // 处理输入变化
  const handleChange = (v: string | number) => {
    const rawValue = String(v);
    // 限制输入格式：允许数字和小数点，最多三位小数
    if (/^\d*\.?\d{0,3}$/.test(rawValue)) {
      setInputValue(rawValue);
    }
  };

  // 提交时转换为毫秒
  const handleBlur = () => {
    try {
      let ms = Math.round(Number(inputValue) * 1000);
      if (inputValue === '') {
        ms = timeoutConfig.default;
      }

      if (ms < timeoutConfig.min) {
        ms = timeoutConfig.min;
      }

      if (ms > timeoutConfig.max) {
        ms = timeoutConfig.max;
      }

      onChange?.(ms);

      // 回显标准化值
      const seconds = msToSeconds(ms);
      setInputValue(seconds);
    } catch (err) {
      logger.error(err);
    }
  };

  if (timeoutConfig.disabled) {
    return <div>-</div>;
  }

  return (
    <Input
      size="small"
      data-testid="setting-on-error-timeout"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={readonly}
      suffix="s"
    />
  );
};
