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

import { type FC } from 'react';

import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

import { useConditionContext } from './context';

interface ConditionHeaderProps {
  onAdd: () => void;
}

export const ConditionHeader: FC<ConditionHeaderProps> = props => {
  const { readonly, setterPath } = useConditionContext();
  const { concatTestId } = useNodeTestId();

  const { onAdd } = props;
  return (
    <div className="flex justify-between items-center mb-2 cursor-pointer">
      <div className="font-semibold">
        {I18n.t('worklfow_condition_condition_branch', {}, 'Condition branch')}
      </div>
      <IconButton
        size="small"
        disabled={readonly}
        onClick={readonly ? () => null : onAdd}
        color="highlight"
        icon={<IconCozPlus className="text-sm" />}
        data-testid={concatTestId(setterPath, 'branch', 'add')}
      />
    </div>
  );
};
