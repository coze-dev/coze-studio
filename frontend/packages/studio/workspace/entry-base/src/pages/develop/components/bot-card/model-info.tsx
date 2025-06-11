import { type FC } from 'react';

import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import { IconCozWorkflow } from '@coze/coze-design/icons';
import { Typography } from '@coze/coze-design';

export interface ModelInfoProps {
  showWorkflowMode?: boolean;
  name?: string;
}

const ModelInfo: FC<ModelInfoProps> = ({ showWorkflowMode, name }) => (
  <Typography.Text
    className="text-[12px] leading-[16px] coz-fg-dim"
    ellipsis={{ showTooltip: { opts: { theme: 'dark' } }, rows: 1 }}
  >
    {showWorkflowMode ? (
      <div className="flex items-center">
        <IconCozWorkflow className="mr-[2px]" />
        {I18n.t('Workflow Mode' as I18nKeysNoOptionsType)}
      </div>
    ) : (
      name
    )}
  </Typography.Text>
);

export default ModelInfo;
