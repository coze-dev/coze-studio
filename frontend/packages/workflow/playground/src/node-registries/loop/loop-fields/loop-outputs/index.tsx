/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { type FC } from 'react';

import { type InputValueVO } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { LoopOutputsField as LoopOutputsCommonField } from '@/node-registries/common/fields';

import { LoopOutputsSuffix, LoopPath } from '../../constants';
import { formatLoopOutputName } from './format-loop-output-name';

interface LoopOutputsFieldProps {
  name?: string;
  title?: string;
  tooltip?: string;
}

export const LoopOutputsField: FC<LoopOutputsFieldProps> = ({
  name = LoopPath.LoopOutputs,
  title = I18n.t('workflow_loop_output'),
  tooltip = I18n.t('workflow_loop_output_tips'),
}) => (
  <LoopOutputsCommonField
    name={name}
    title={title}
    tooltip={tooltip}
    defaultValue={[{ name: 'output' } as InputValueVO]}
    nameProps={{
      initValidate: true,
      suffix: LoopOutputsSuffix,
      format: formatLoopOutputName,
    }}
  />
);
