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

import React from 'react';

import { useNodeTestId } from '@coze-workflow/base';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tooltip, Checkbox as SemiCheckbox } from '@coze-arch/coze-design';

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
