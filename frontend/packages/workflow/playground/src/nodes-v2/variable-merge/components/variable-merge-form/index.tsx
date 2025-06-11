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
 * 变量聚合表单
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
