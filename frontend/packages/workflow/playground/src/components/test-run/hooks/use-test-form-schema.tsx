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
 
import React, { useMemo, type ReactNode } from 'react';

import { get } from 'lodash-es';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { GlobalVariableService } from '@coze-workflow/variable';
import { type NodeData, WorkflowNodeData } from '@coze-workflow/nodes';
import { StandardNodeType, WorkflowMode } from '@coze-workflow/base';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { ComponentType, type infra } from '@coze-arch/bot-api/debugger_api';
import { debuggerApi } from '@coze-arch/bot-api';
import { Typography } from '@coze-arch/coze-design';

import { type TestFormField } from '../types';
import {
  BATCH_FIELD_TEMPLATE,
  SETTING_FIELD_TEMPLATE,
  getBotFieldTemplate,
  getConversationTemplate,
  DATASETS_FIELD_TEMPLATE,
  FieldName,
  INPUT_FIELD_TEMPLATE,
  NODE_FIELD_TEMPLATE,
  TestFormType,
} from '../constants';
import { WorkflowRunService, ChatflowService } from '../../../services';
import { useGlobalState, useTestRunReporterService } from '../../../hooks';
import { useTestsetBizCtx } from './use-testset-biz-ctx';
import { useTestFormInitialValueV2 } from './use-test-form-initial-value-v2';
import { useNeedSceneBot } from './use-need-scene-bot';
import { useNeedBot } from './use-need-bot';
import { useGetStartNode } from './use-get-start-node';
import { useGenerateTestFormFieldsMap } from './use-generate-test-form-fields';

interface GenerateTestsetFieldOptions {
  bizCtx: infra.BizCtx;
  startNodeId: string;
  workflowId: string;
  testSetIsTitle?: ReactNode;
}

const generateTestsetField = (
  fields: TestFormField[],
  options: GenerateTestsetFieldOptions,
) => {
  const { startNodeId, workflowId, testSetIsTitle } = options;
  const testsetField: TestFormField = {
    ...DATASETS_FIELD_TEMPLATE,
    children: DATASETS_FIELD_TEMPLATE.children.map(field => {
      if (field.name === FieldName.DatasetsIs && testSetIsTitle) {
        return {
          ...field,
          component: {
            ...field.component,
            props: {
              ...field.component.props,
              title: testSetIsTitle,
            },
          },
        };
      }

      if (field.name === FieldName.DatasetsName) {
        return {
          ...field,
          validator: [
            ...((field as unknown as { validator: unknown[] }).validator || []),
            {
              triggerType: 'onBlur',
              validator: async (value: string) => {
                if (!value) {
                  return true;
                }
                const pattern = /^[\w\s\u4e00-\u9fa5]+$/u;
                if (!pattern.test(value)) {
                  return I18n.t('create_plugin_modal_nameerror_cn');
                }
                try {
                  const { isPass } = await debuggerApi.CheckCaseDuplicate({
                    bizCtx: options.bizCtx,
                    bizComponentSubject: {
                      componentID: startNodeId,
                      componentType: ComponentType.CozeStartNode,
                      parentComponentID: workflowId,
                      parentComponentType: ComponentType.CozeWorkflow,
                    },
                    caseName: value,
                  });
                  return isPass
                    ? true
                    : I18n.t('workflow_testset_name_duplicated');
                } catch (e) {
                  logger.error({
                    error: e,
                    eventName: 'testset_name_validate',
                  });
                  return true;
                }
              },
            },
          ],
        };
      }
      return field;
    }),
  };
  fields.push(testsetField);
};

const TestSetIsTitle = ({ onCreate }: { onCreate?: () => void }) => {
  const { Text } = Typography;

  return (
    <span>
      {I18n.t('workflow_testset_save')}
      <Text
        link
        style={{
          lineHeight: '20px',
        }}
        onClick={e => {
          e.stopPropagation();
          onCreate?.();
        }}
      >
        {I18n.t('workflow_testset_create')}
      </Text>
    </span>
  );
};

interface OptionsType {
  onCreateTestSet?: () => void;
  hideGroupLabel?: boolean;
}

/**
 * 根据节点 formData 推导出 testFormSchema
 * 整个 schema 目前会构造成这种结构：
 * - node[] // 未来会有多个 node，所以 node 需要分维度
 *   // batch 和 input 会到两个分组中，因为 batch 和 input 的 filed.name 是可能重复的
 *   - batch
 *   - input
 *     - string
 *     - number
 *     - ...
 * - bot // 他是独立的只有一个
 * - testset
 *   - is
 *   - name
 *   - description
 */
export const useTestFormSchema = (
  node?: WorkflowNodeEntity,
  options?: OptionsType,
) => {
  const runService = useService<WorkflowRunService>(WorkflowRunService);
  const globalVariableService = useService<GlobalVariableService>(
    GlobalVariableService,
  );
  const { generateInitialValues } = useTestFormInitialValueV2();
  const chatflowService = useService<ChatflowService>(ChatflowService);
  const reporter = useTestRunReporterService();
  const { canTestset } = useGlobalState();

  const { getNode } = useGetStartNode();

  const generateTestFormFieldsMap = useGenerateTestFormFieldsMap();

  const bizCtx = useTestsetBizCtx();

  /** 如果是 start 节点代表是全量运行，否则是单节点运行 */
  const testFormType = useMemo(() => {
    if (!node || node.flowNodeType === StandardNodeType.Start) {
      return TestFormType.Default;
    }
    return TestFormType.Single;
  }, [node, node?.flowNodeType]);

  const { queryNeedBot } = useNeedBot();
  const { needSceneBot, sceneBotSchema } = useNeedSceneBot(
    node?.flowNodeType as StandardNodeType,
  );

  const generate = async () => {
    let current = node;
    if (!current) {
      const startNodeEntity = getNode();
      if (!startNodeEntity) {
        return null;
      }
      current = startNodeEntity;
    }
    const reporterKey = reporter.formSchemaGen.start();
    const nodeDataEntity = current.getData<WorkflowNodeData>(WorkflowNodeData);
    const nodeData = nodeDataEntity.getNodeData<keyof NodeData>();

    const formData = current
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/');
    const nodeTitle = formData?.nodeMeta?.title;

    /** part 计算节点壳子的部分 */
    const nodeField: TestFormField = {
      ...NODE_FIELD_TEMPLATE,
      title: I18n.t('workflow_debug_testonenode_group', {
        nodeTitle,
      }),
      component: {
        ...NODE_FIELD_TEMPLATE.component,
        props: {
          icon: nodeData?.icon || formData?.nodeMeta?.icon,
          hideGroupLabel: options?.hideGroupLabel,
        },
      },
      children: [],
    };

    /** part 计算节点批处理部分 */
    const batchFields = generateTestFormFieldsMap.batch(formData, {
      node: current,
    });
    if (batchFields.length) {
      nodeField.children.push({
        ...BATCH_FIELD_TEMPLATE,
        children: batchFields,
      });
    }

    /** part 计算非 input 的内容 */
    const settingFields = generateTestFormFieldsMap.setting(formData, {
      node: current,
    });
    if (settingFields.length) {
      nodeField.children.push({
        ...SETTING_FIELD_TEMPLATE,
        children: settingFields,
      });
    }

    /** part 计算节点输入 */
    const generateFn =
      generateTestFormFieldsMap[current.flowNodeType as StandardNodeType] ||
      generateTestFormFieldsMap.default;

    const inputFields = await generateFn(formData, {
      node: current,
    });
    if (inputFields.length) {
      nodeField.children.push({
        ...INPUT_FIELD_TEMPLATE,
        children: inputFields,
      });
    }

    const fields: TestFormField[] = [];

    const isNeedBotEnv = await queryNeedBot(testFormType, current);
    const {
      needBot,
      needConversation,
      hasVariableNode,
      hasVariableAssignNode,
      hasDatabaseNode,
      hasLTMNode,
      hasChatHistoryEnabledLLM,
      hasConversationNode,
    } = isNeedBotEnv;

    const isSubflow = current.flowNodeType === StandardNodeType.SubWorkflow;
    const subflowIsChatflow =
      get(nodeData, 'flow_mode') === WorkflowMode.ChatFlow;

    // 逻辑在 testset 中也实现了：packages/workflow/playground/src/components/test-run/chat-flow-test-form-panel/testset-bot-project-select.tsx
    // 会话类节点，子流程（Chatflow）不能选择 Bot，因为Bot不支持多会话
    // LTM 节点不能选择 Project，因为 Project 还没有 LTM 能力
    const needDisableBot =
      hasConversationNode || (isSubflow && subflowIsChatflow);

    const botDisableOptions = {
      disableBot: needDisableBot,
      disableBotTooltip: needDisableBot ? I18n.t('wf_chatflow_141') : '',
      disableProject: hasLTMNode,
      disableProjectTooltip: hasLTMNode ? I18n.t('wf_chatflow_142') : '',
    };

    if (needBot) {
      const botTemplate = getBotFieldTemplate(
        isNeedBotEnv,
        true,
        chatflowService,
      );

      if (botTemplate.children?.[0]) {
        Object.assign(botTemplate.children[0].component, {
          props: {
            hasVariableNode,
            hasVariableAssignNode,
            hasDatabaseNode,
            hasLTMNode,
            hasChatHistoryEnabledLLM,
            ...botDisableOptions,
          },
        });

        // 拉取全局变量
        Object.assign(botTemplate.children[0], {
          events: {
            onFormValueChange: _v => {
              const currentValue = _v.currentTarget?.value || {};

              // 切换时拉取全局变量
              globalVariableService.loadGlobalVariables(
                currentValue.type === 1 ? 'bot' : 'project',
                currentValue.id,
              );
            },
          },
        });
      }

      fields.push(botTemplate);
    }

    if (needConversation) {
      const conversationTemplate = getConversationTemplate(chatflowService);

      if (!needBot) {
        Object.assign(conversationTemplate, {
          visible: true,
        });
        fields.push(conversationTemplate);
      } else if (fields[0]?.children) {
        fields[0].children.push(conversationTemplate);
      }
    }

    if (nodeField.children.length) {
      fields.push(nodeField);
    }

    /**如果是场景工作流，需要提供场景关联的 botID */
    if (needSceneBot) {
      fields.push(sceneBotSchema);
    }

    /** part 计算 表单 testset field */
    /** 如果需要填写入参且是默认模式，则还要显示是否保存到 datasets */
    if (
      canTestset &&
      fields.length &&
      testFormType === TestFormType.Default &&
      !runService.globalState.config.preview
    ) {
      generateTestsetField(fields, {
        bizCtx,
        startNodeId: current.id,
        workflowId: runService.globalState.config.workflowId,
        testSetIsTitle: options?.onCreateTestSet ? (
          <TestSetIsTitle onCreate={options?.onCreateTestSet} />
        ) : undefined,
      });
    }

    const schema = {
      id: current.id,
      type: testFormType,
      fields,
    };

    await generateInitialValues(schema);

    reporter.formSchemaGen.end(reporterKey, {
      node_type: current.flowNodeType as string,
    });

    return schema;
  };

  return { generate };
};
