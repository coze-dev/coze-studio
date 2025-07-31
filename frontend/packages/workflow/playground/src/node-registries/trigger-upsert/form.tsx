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

import { useMemo, useState } from 'react';

import { useAsyncEffect } from 'ahooks';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { type BotPluginWorkFlowItem } from '@coze-workflow/components';
import {
  ValueExpressionType,
  variableUtils,
  ViewVariableType,
} from '@coze-workflow/variable';
import type { OutputValueVO, VariableMetaDTO } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { TriggerService } from '@/services';
import {
  OutputsField,
  ValueExpressionInputField,
} from '@/node-registries/common/fields';
import {
  CronJobSelect,
  DataTypeTag,
  DynamicForm,
  Notify,
  Timezone,
} from '@/node-registries/common/components';
import { ColumnTitles, Section, useForm, useWatch } from '@/form';

import { withNodeConfigForm } from '../common/hocs';
import { INPUT_PATH } from './constants';
import { TriggerListField } from './components/trigger-list-field';
import { TriggerBindWorkflowField } from './components/trigger-bind-workflow-field';
import { FixedInputParameter } from './components/fixed-input-parameter-field';

export const FormRender = withNodeConfigForm(value => {
  const bindWorkflowId = useWatch<string>({
    name: 'inputs.bindWorkflowId',
  });

  const triggerService = useService<TriggerService>(TriggerService);

  const [bindWorkflowInfo, setBindWorkflowInfo] = useState<{
    workflowInfo?: BotPluginWorkFlowItem;
    workflowParameters?: OutputValueVO[];
  }>({});

  const { dynamicFormMeta } = useMemo(() => {
    const formMeta = triggerService.getTriggerDynamicFormMeta();
    return {
      dynamicFormMeta: formMeta.triggerNodeFormMeta,
    };
  }, []);

  const form = useForm();

  useAsyncEffect(async () => {
    let _workflowParameters: OutputValueVO[] = [];
    let _workflowInfo;
    if (bindWorkflowId) {
      await triggerService.setBindWorkflowInfo(bindWorkflowId);
      _workflowInfo = triggerService.getBindWorkflowInfo(bindWorkflowId);
      _workflowParameters = (
        (_workflowInfo?.inputs ?? []) as OutputValueVO[]
      ).map(d => ({
        ...d,
        type: variableUtils.dtoMetaToViewMeta(d as unknown as VariableMetaDTO)
          .type,
      }));
    }

    setBindWorkflowInfo({
      workflowInfo: _workflowInfo as BotPluginWorkFlowItem,
      workflowParameters: _workflowParameters,
    });

    _workflowParameters.map(d => {
      if (!form.getValueIn(`${INPUT_PATH}.payload.${d.name}`)) {
        form.setValueIn(`${INPUT_PATH}.payload.${d.name}`, {
          type: ValueExpressionType.LITERAL,
        });
      }
    });
  }, [bindWorkflowId]);

  return (
    <>
      <Notify
        isBreakLine
        className="!border-b-0 !m-0 !mt-2.5 rounded-lg"
        text={I18n.t(
          'workflow_user_trigger_banner',
          {},
          '设置以后需要发布到对应渠道才能定时生效',
        )}
      />
      <Section
        title={I18n.t('workflow_trigger_user_create_list', {}, '触发器列表')}
      >
        <TriggerListField name="" bindWorkflowId={bindWorkflowId} />
      </Section>

      <Section title={I18n.t('workflow_detail_node_input', {}, '输入')}>
        <div className="flex flex-col gap-[8px]">
          <FixedInputParameter
            name={`${INPUT_PATH}.fixedInputs`}
            fieldConfig={[
              {
                description: I18n.t(
                  'workflow_trigger_user_create_id_tooltips',
                  {},
                  '触发器的唯一标识，若填写已存在id触发器列表中则为更新触发器信息。',
                ),
                name: 'triggerId',
                label: I18n.t('workflow_trigger_user_create_id', {}, 'id'),
                required: false,
                type: ViewVariableType.String,
              },
              {
                label: I18n.t(
                  'workflow_trigger_user_create_userid',
                  {},
                  'userId',
                ),
                description: I18n.t(
                  'workflow_trigger_user_create_userid_tooltips',
                  {},
                  '用于设置触发器所属用户，可以使用变量-系统变量中的sys_uuid来唯一标识用户',
                ),
                name: 'userId',
                required: true,
                type: ViewVariableType.String,
              },
              {
                label: I18n.t('workflow_trigger_user_create_name', {}, '名称'),
                description: I18n.t(
                  'workflow_trigger_user_create_name_tooltips',
                  {},
                  '触发器名称，可用于标识用途。',
                ),
                name: 'triggerName',
                required: true,
                type: ViewVariableType.String,
              },
            ]}
          />

          <DynamicForm
            name={`${INPUT_PATH}.dynamicInputs`}
            formMeta={dynamicFormMeta}
            components={{
              Timezone,
              CronJobSelect,
            }}
          />

          <TriggerBindWorkflowField
            className="mb-[8px]"
            name={`${INPUT_PATH}.bindWorkflowId`}
            label="绑定工作流"
            layout="vertical"
            tooltip="cronjob"
            required
            selectedWorkflowInfo={bindWorkflowInfo.workflowInfo}
          />

          {bindWorkflowInfo.workflowParameters?.length ? (
            <div className="coz-mg-card p-[8px] rounded-[6px] border border-solid coz-stroke-primary">
              <ColumnTitles
                columns={[
                  {
                    label: I18n.t('workflow_detail_node_parameter_name'),
                    style: { width: 148 },
                  },
                  { label: I18n.t('workflow_detail_end_output_value') },
                ]}
              />

              <div className="flex flex-col gap-[8px]">
                {bindWorkflowInfo.workflowParameters?.map(field => (
                  <ValueExpressionInputField
                    label={field?.name}
                    required={field?.required}
                    tooltip={field?.description}
                    labelExtra={
                      field?.type && <DataTypeTag type={field.type} />
                    }
                    name={`${INPUT_PATH}.payload.${field?.name}`}
                    inputType={field?.type}
                    disabledTypes={ViewVariableType.getComplement([
                      field?.type,
                    ])}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Section>

      <OutputsField
        title={I18n.t('workflow_detail_node_output')}
        tooltip={I18n.t('node_http_response_data')}
        id="triggerUpsert-node-outputs"
        name="outputs"
        topLevelReadonly={true}
        customReadonly
      />
    </>
  );
});
