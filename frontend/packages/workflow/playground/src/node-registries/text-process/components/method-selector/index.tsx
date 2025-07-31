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

import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { SelectField } from '@/form';

import { STRING_METHOD_OPTIONS, StringMethod } from '../../constants';

export const MethodSelectorSetter = ({ name }: { name: string }) => {
  const readonly = useReadonly();
  const { getNodeSetterId } = useNodeTestId();

  return (
    <div className="flex justify-between align-items">
      <div className="font-semibold text-[12px] leading-[24px]">
        {I18n.t('workflow_stringprocess_node_method')}
      </div>

      <div>
        <SelectField
          name={name}
          readonly={readonly}
          defaultValue={StringMethod.Concat}
          optionList={STRING_METHOD_OPTIONS}
          data-testid={getNodeSetterId('text-method-select')}
        />
      </div>
    </div>
  );
};
