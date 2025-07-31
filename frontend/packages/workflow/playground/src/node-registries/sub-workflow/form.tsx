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

import { useShallow } from 'zustand/react/shallow';
import {
  type FormRenderProps,
  useWatch,
} from '@flowgram-adapter/free-layout-editor';
import { I18n } from '@coze-arch/i18n';

import { Batch } from '@/nodes-v2/components/batch/batch';
import { NodeConfigForm } from '@/node-registries/common/components';

import {
  OutputsField,
  BatchModeField,
  SettingOnError,
  InputsKVField,
} from '../common/fields';
import { type SubWorkflowNodeFormData } from './types';
import { useSubWorkflowNodeStore } from './hooks/use-subworkflow-node-service';
import { BATCH_MODE_PATH, INPUT_PATH } from './constants';
import { SubWorkflowLink } from './components';

export const FormRender = ({
  form,
}: FormRenderProps<SubWorkflowNodeFormData>) => {
  const { loading, getSubWorkflow } = useSubWorkflowNodeStore(
    useShallow(s => ({
      loading: s.loading,
      getSubWorkflow: s.getData,
    })),
  );

  const identifier = {
    workflowId: form?.initialValues?.inputs?.workflowId ?? '',
    workflowVersion: form?.initialValues?.inputs?.workflowVersion ?? '',
  };

  const workflowDetail = getSubWorkflow(identifier);
  const inputsDef = workflowDetail?.inputs ?? [];

  const batchMode = useWatch<string>(BATCH_MODE_PATH);

  if (loading) {
    return null;
  }

  return (
    <NodeConfigForm
      extraOperation={
        <SubWorkflowLink
          workflowDetail={workflowDetail}
          identifier={identifier}
        />
      }
    >
      <BatchModeField name={BATCH_MODE_PATH} />

      <Batch batchModeName={BATCH_MODE_PATH} name={'inputs.batch'} />

      <InputsKVField
        name={INPUT_PATH}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        inputsDef={inputsDef as any}
        hasFeedback={false}
      />

      <OutputsField
        title={I18n.t('workflow_detail_node_output')}
        tooltip={I18n.t('node_http_response_data')}
        id="subWorkflow-node-outputs"
        name="outputs"
        batchMode={batchMode}
        topLevelReadonly={true}
        customReadonly
      />

      <SettingOnError name="settingOnError" batchModePath={BATCH_MODE_PATH} />

      <div className="text-[12px] coz-fg-dim hidden">
        Powered by Flow Engine V2
      </div>
    </NodeConfigForm>
  );
};
