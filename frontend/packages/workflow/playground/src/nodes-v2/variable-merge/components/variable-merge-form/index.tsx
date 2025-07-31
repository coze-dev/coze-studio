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

import {
  Field,
  type FormRenderProps,
} from '@flowgram-adapter/free-layout-editor';
import { PublicScopeProvider } from '@coze-workflow/variable';
import { I18n } from '@coze-arch/i18n';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { Outputs } from '@/nodes-v2/components/outputs';
import NodeMeta from '@/nodes-v2/components/node-meta';

import { MergeStrategyField } from '../merge-strategy-field';
import { MergeGroupsField } from '../merge-groups-field';
import { type VariableMergeFormData } from '../../types';

/**
 * variable aggregation form
 * @param param0
 * @returns
 */
export const VariableMergeForm = ({
  form,
}: FormRenderProps<VariableMergeFormData>) => {
  const readonly = useReadonly();

  return (
    <PublicScopeProvider>
      <>
        <NodeMeta />

        <div>
          <MergeStrategyField readonly={readonly} />
          <MergeGroupsField readonly={readonly} />
        </div>

        <Field name={'outputs'} deps={['inputs.mergeGroups']} defaultValue={[]}>
          {({ field, fieldState }) => (
            <Outputs
              id={'llm-node-output'}
              readonly={true}
              value={field.value}
              titleTooltip={I18n.t('workflow_var_merge_output_tooltips')}
              errors={fieldState?.errors}
            />
          )}
        </Field>
      </>
    </PublicScopeProvider>
  );
};
