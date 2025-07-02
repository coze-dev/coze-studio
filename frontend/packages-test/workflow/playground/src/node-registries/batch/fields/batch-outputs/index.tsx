/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { type FC } from 'react';

import { type InputValueVO } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { LoopOutputsField } from '@/node-registries/common/fields';

import { BatchOutputsSuffix, BatchPath } from '../../constants';

interface BatchOutputsFieldProps {
  name?: string;
  title?: string;
  tooltip?: string;
}

export const BatchOutputsField: FC<BatchOutputsFieldProps> = ({
  name = BatchPath.Outputs,
  title = I18n.t('workflow_batch_outputs'),
  tooltip = I18n.t('workflow_batch_outputs_tooltips'),
}) => (
  <LoopOutputsField
    name={name}
    title={title}
    tooltip={tooltip}
    defaultValue={[{ name: 'output' } as InputValueVO]}
    nameProps={{
      initValidate: true,
      suffix: BatchOutputsSuffix,
    }}
  />
);
