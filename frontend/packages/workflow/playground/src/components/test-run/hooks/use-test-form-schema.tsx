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
 * Derive testFormSchema from node formData
 * The entire schema is currently constructed as follows:
 * - node []//There will be multiple nodes in the future, so nodes need to be divided into dimensionsdes in the future, so nodes need to be divided into dimensions
 *   //batch and input will be in two groups, because the filed.name of batch and input may be duplicatedame of batch and input may be duplicated
 *   - batch
 *   - input
 *     - string
 *     - number
 *     - ...
 * - bot//he is independent only oneependent and there is only one
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

  /** If it is a start node, it means it is running in full, otherwise it is running on a single node. */
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

    /** Part of the computing node shell */
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

    /** Part Compute Node Batch Part */
    const batchFields = generateTestFormFieldsMap.batch(formData, {
      node: current,
    });
    if (batchFields.length) {
      nodeField.children.push({
        ...BATCH_FIELD_TEMPLATE,
        children: batchFields,
      });
    }

    /** Part of computing non-input content */
    const settingFields = generateTestFormFieldsMap.setting(formData, {
      node: current,
    });
    if (settingFields.length) {
      nodeField.children.push({
        ...SETTING_FIELD_TEMPLATE,
        children: settingFields,
      });
    }

    /** Parts Compute Node Input */
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

    // The logic is also implemented in the testset: packages/workflow/playground/src/components/test-run/chat-flow-test-form-panel/testset-bot-project-select
    // Session class nodes, subflows (Chatflow) cannot select Bot because Bot does not support multi-session
    // The LTM node cannot select Project because Project does not yet have LTM capabilities
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

        // Pull global variable
        Object.assign(botTemplate.children[0], {
          events: {
            onFormValueChange: _v => {
              const currentValue = _v.currentTarget?.value || {};

              // Pull global variable when switching
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

    /**If it is a scene workflow, you need to provide the botID associated with the scene. */
    if (needSceneBot) {
      fields.push(sceneBotSchema);
    }

    /** Parts calculation, form testset field */
    /** If you need to fill in imported parameters and it is the default mode, also show whether to save to datasets */
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
