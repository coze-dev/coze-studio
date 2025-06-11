import React from 'react';

import { StandardNodeType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';

import { type ErrorFormPropsV2 } from '../../types';
import { FormCard } from '../../../form-card';
import { useExpand } from './use-exapand';
import { ErrorFormContent } from './content';

export const ErrorFormCard: React.FC<ErrorFormPropsV2> = ({
  isOpen = false,
  onSwitchChange,
  json,
  onJSONChange,
  readonly,
  errorMsg,
  defaultValue,
  noPadding,
  ...props
}) => {
  let tooltip = I18n.t(
    'workflow_250421_03',
    undefined,
    '可设置异常处理,包括超时、重试、异常处理方式。',
  );
  const node = useCurrentEntity();
  if (node.flowNodeType === StandardNodeType.LLM) {
    tooltip += I18n.t(
      'workflow_250416_03',
      undefined,
      '在开启流式输出的情况下，一旦开始接受数据即便出错，也无法重试和跳转异常分支。',
    );
  }
  const expand = useExpand(props.value);

  return (
    <FormCard
      header={I18n.t('workflow_250416_01')}
      tooltip={tooltip}
      noPadding={noPadding}
      defaultExpand={expand}
      testId="setting-on-error"
    >
      <ErrorFormContent
        isOpen={isOpen}
        onSwitchChange={onSwitchChange}
        json={json}
        onJSONChange={onJSONChange}
        readonly={readonly}
        errorMsg={errorMsg}
        defaultValue={defaultValue}
        noPadding={noPadding}
        {...props}
      />
    </FormCard>
  );
};
