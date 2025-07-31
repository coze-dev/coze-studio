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

import { type DatabaseCondition, useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';

import { useFieldArray } from '@/form';

export function ConditionAddButton() {
  const { append, readonly } = useFieldArray<DatabaseCondition>();
  const { getNodeSetterId } = useNodeTestId();

  return (
    <Button
      disabled={readonly}
      className="mt-[4px]"
      onClick={() =>
        append({ left: undefined, operator: undefined, right: undefined })
      }
      icon={<IconCozPlus />}
      size="small"
      color="highlight"
      data-testid={getNodeSetterId('condition-add-button')}
    >
      {I18n.t('workflow_add_condition')}
    </Button>
  );
}
