import React from 'react';

import { useNodeTestId } from '@coze-workflow/base';
import { IconCozInfoCircle } from '@coze/coze-design/icons';
import { Tooltip, Checkbox as SemiCheckbox } from '@coze/coze-design';

export const Checkbox = props => {
  const { value, onChange, context, options, readonly } = props;
  const { text, itemTooltip } = options;
  const { getNodeSetterId } = useNodeTestId();

  return (
    <div className="flex items-center">
      <SemiCheckbox
        onChange={e => onChange(e.target.checked)}
        checked={!!value}
        data-testid={getNodeSetterId(context.meta.name)}
        disabled={readonly}
      >
        {text}
      </SemiCheckbox>

      {!!itemTooltip && (
        <Tooltip content={itemTooltip}>
          <IconCozInfoCircle className="text-[#A7A9B0] text-sm ml-1" />
        </Tooltip>
      )}
    </div>
  );
};
