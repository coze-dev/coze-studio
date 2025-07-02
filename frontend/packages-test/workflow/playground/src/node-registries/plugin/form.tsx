import { useShallow } from 'zustand/react/shallow';
import { I18n } from '@coze-arch/i18n';
import { type FormRenderProps } from '@flowgram-adapter/free-layout-editor';

import { Batch } from '@/nodes-v2/components/batch/batch';
import { NodeConfigForm } from '@/node-registries/common/components';
import { useWatch } from '@/form';

import { InputsKVField, OutputsField, BatchModeField } from '../common/fields';
import { getApiNodeIdentifier } from './utils';
import type { ApiNodeFormData } from './types';
import { usePluginNodeServiceStore } from './hooks/use-plugin-node-service';
import { BATCH_MODE_PATH, INPUT_PARAMS_PATH } from './constants';
import { ViewExample } from './components/view-example';
import { PluginLink } from './components/plugin-link';

export const FormRender = ({ form }: FormRenderProps<ApiNodeFormData>) => {
  const { loading, getApiNodeDetail } = usePluginNodeServiceStore(
    useShallow(s => ({
      loading: s.loading,
      getApiNodeDetail: s.getData,
    })),
  );

  const indentifier = getApiNodeIdentifier(
    form.initialValues?.inputs?.apiParam || [],
  );

  const apiDetail = getApiNodeDetail(indentifier);
  const inputsDef = apiDetail?.inputs ?? [];

  const batchMode = useWatch<string>(BATCH_MODE_PATH);

  if (loading) {
    return null;
  }

  return (
    <NodeConfigForm
      extraOperation={<PluginLink identifier={indentifier} />}
      batchModePath={BATCH_MODE_PATH}
    >
      <BatchModeField name={BATCH_MODE_PATH} />

      <Batch batchModeName={BATCH_MODE_PATH} name={'inputs.batch'} />

      <InputsKVField
        name={INPUT_PARAMS_PATH}
        inputsDef={inputsDef}
        hasFeedback={false}
      />

      <div className="relative node-v2-outputs">
        <OutputsField
          title={I18n.t('workflow_detail_node_output')}
          tooltip={I18n.t('node_http_response_data')}
          id="plugin-node-outputs"
          name="outputs"
          batchMode={batchMode}
          topLevelReadonly={true}
          customReadonly
        />

        <ViewExample
          inputs={inputsDef}
          debugExample={apiDetail?.debug_example}
        />
      </div>
    </NodeConfigForm>
  );
};
