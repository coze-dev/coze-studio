import React, { useState, useMemo } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozWarningCircleFill } from '@coze/coze-design/icons';
import { Input, Tooltip } from '@coze/coze-design';

import { ErrorCode } from '../constants';

import s from './index.module.less';

export const EditInput = ({
  ref,
  defaultValue,
  loading,
  onBlur,
  onValidate,
}: {
  ref?: React.Ref<HTMLInputElement>;
  /**
   * 默认值
   */
  defaultValue?: string;
  /**
   * loading
   */
  loading: boolean;
  /**
   * 失焦 / 回车后执行的行为
   */
  onBlur?: (input?: string, error?: ErrorCode) => void;
  /**
   * 校验函数，返回 true 标识校验通过
   */
  onValidate?: (input: string) => ErrorCode | undefined;
}) => {
  const [input, setInput] = useState(defaultValue);
  const [error, setError] = useState<ErrorCode | undefined>(undefined);

  const handleCreateSession = () => {
    onBlur?.(input, error);
    setInput('');
  };

  const handleValidateName = (_input: string) => {
    setInput(_input);
    const validateRes = onValidate?.(_input);
    if (validateRes) {
      setError(validateRes);
    } else {
      setError(undefined);
    }
  };

  const renderError = useMemo(() => {
    if (error === ErrorCode.DUPLICATE) {
      return I18n.t('wf_chatflow_109');
    } else if (error === ErrorCode.EXCEED_MAX_LENGTH) {
      return I18n.t('wf_chatflow_116');
    }
  }, [error]);
  return (
    <Input
      ref={ref}
      className={s.input}
      size="small"
      loading={loading}
      autoFocus
      onChange={handleValidateName}
      placeholder={'Please enter'}
      defaultValue={defaultValue}
      error={Boolean(error)}
      suffix={
        error ? (
          <Tooltip content={renderError} position="right">
            <IconCozWarningCircleFill className="coz-fg-hglt-red absolute right-1 text-[13px]" />
          </Tooltip>
        ) : null
      }
      onBlur={handleCreateSession}
      onEnterPress={handleCreateSession}
    />
  );
};
