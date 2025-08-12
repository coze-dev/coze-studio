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

/* eslint-disable max-lines-per-function */
import md5 from 'md5';
import { get, pick } from 'lodash-es';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { useService } from '@flowgram-adapter/free-layout-editor';
import {
  getSortedInputParameters,
  roleInformationKeyword,
  WorkflowNodeData,
  WorkflowNodesService,
} from '@coze-workflow/nodes';
import { StandardNodeType } from '@coze-workflow/base/types';
import {
  isPresetStartParams,
  WorkflowMode,
  CONVERSATION_NAME,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { AuthType, BodyType } from '@/node-registries/http/setters/constants';
import { OptionType } from '@/constants/question-settings';

import { generateUpdateTriggerFields } from '../utils/generate-update-trigger-fields';
import {
  type GenerateFn,
  type GenerateAsyncFn,
} from '../utils/generate-test-form-fields';
import {
  generateField,
  startNodeOldType2VariableType,
  generateArrayInputParameters,
  generateObjectInputParameters,
  generateExpressionString,
  generateObjectInputParametersRequired,
} from '../utils/generate-test-form-fields';
import { generateInputJsonSchema } from '../utils/generate-input-json-schema';
import { generateImageflowGenerateTestFormFields } from '../utils/generate-imageflow-generate-test-form-fields';
import {
  generateDatabaseCreateTestRunFormFields,
  generateDatabaseDeleteTestRunFormFields,
  generateDatabaseQueryTestRunFormFields,
  generateDatabaseUpdateTestRunFormFields,
} from '../utils/generate-crud-nodes-test-run-form-fields';
import { type TestFormField } from '../types';
import { COMMON_FIELD } from '../constants';
import { useGetWorkflowMode, useGlobalState } from '../../../hooks';
import { useGetSceneFlowRoleListSchema } from './use-get-scene-flow-role-list-schema';
type GenerateTestFormFieldsMap = {
  [key in StandardNodeType]?: GenerateFn | GenerateAsyncFn;
} & {
  default: GenerateFn;
  batch: GenerateFn;
  setting: GenerateFn;
};

export const useGenerateTestFormFieldsMap = () => {
  const { isSceneFlow } = useGetWorkflowMode();
  const { isChatflow } = useGlobalState();

  const nodesService = useService<WorkflowNodesService>(WorkflowNodesService);

  const getSceneFlowRoleListSchema = useGetSceneFlowRoleListSchema();
  const generateTestFormFieldsMap: GenerateTestFormFieldsMap = {
    [StandardNodeType.Start]: (formData, context) => {
      let inputParameters = formData?.outputs || [];

      if (isChatflow) {
        inputParameters = inputParameters.filter(
          param => !isPresetStartParams(param.name),
        );
      }

      const { node } = context;

      const inputFields = inputParameters.filter(input => {
        if (input.isPreset && !input.enabled) {
          return false;
        }
        return true;
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sortedInputFields = getSortedInputParameters(inputFields) as any;

      return (
        sortedInputFields
          .map(input => {
            if (input.name === roleInformationKeyword && isSceneFlow) {
              return getSceneFlowRoleListSchema();
            } else {
              const workflowVariable =
                node.context.variableService.getWorkflowVariableByKeyPath(
                  [node.id, input.name],
                  context,
                );
              if (!workflowVariable) {
                return null;
              }

              const jsonSchema = generateInputJsonSchema(
                workflowVariable.dtoMeta,
              );

              return {
                name: input.name,
                title: input.name,
                // Default values for variable configurations are written directly into the schema, rather than injected after the form is initialized
                initialValue: input.defaultValue,
                ...generateField(
                  startNodeOldType2VariableType(input.type),
                  input.required,
                  input.description,
                  jsonSchema,
                ),
              };
            }
          })
          .filter(Boolean)
          // Put the perfect scene player information (i.e. role_information) at the end
          .sort((a, b) => {
            if (a.name === roleInformationKeyword && isSceneFlow) {
              return 1;
            } else if (b.name === roleInformationKeyword && isSceneFlow) {
              return -1;
            } else {
              return 0;
            }
          })
      );
    },

    [StandardNodeType.Variable]: (formData, context) => {
      const inputParameter = formData?.inputParameters;
      if (!inputParameter) {
        return [];
      }
      return generateArrayInputParameters(inputParameter, context);
    },
    [StandardNodeType.VariableAssign]: (formData, context) => {
      const inputParameters =
        formData?.$$input_decorator$$?.inputParameters?.map(e => ({
          input: e?.right,
          name: e?.left?.content?.keyPath?.[1],
        }));

      return generateArrayInputParameters(inputParameters, context);
    },
    [StandardNodeType.SubWorkflow]: (formData, context) => {
      const inputDefs = formData?.inputs?.inputDefs;
      if (!inputDefs || !Array.isArray(inputDefs)) {
        return [];
      }

      const nodeData = context.node.getData<WorkflowNodeData>(WorkflowNodeData);
      const detail = nodeData.getNodeData<StandardNodeType.SubWorkflow>();
      const _isChatflow = detail?.flow_mode === WorkflowMode.ChatFlow;

      const inputData = formData?.inputs?.inputParameters || {};
      const inputParameters = inputDefs
        // CONVERSATION_NAME parameters in chatflow do not need to be extracted, and a dedicated session selection component is required
        .filter(i => (_isChatflow ? i.name !== CONVERSATION_NAME : true))
        .map(i => ({
          input: inputData[i.name],
          name: i.name,
          required: i.required,
        }));
      return generateArrayInputParameters(inputParameters, context);
    },
    [StandardNodeType.Api]: (formData, context) => {
      const { node } = context;

      const nodeData = node.getData<WorkflowNodeData>(WorkflowNodeData);

      const detail = nodeData.getNodeData<StandardNodeType.Api>();

      const inputs = detail?.inputs;
      if (!inputs || !Array.isArray(inputs)) {
        return [];
      }
      const inputData = formData?.inputs?.inputParameters || {};
      const inputParameters = inputs.map(i => ({
        input: inputData[i.name],
        name: i.name,
        required: i.required,
      }));
      return generateArrayInputParameters(inputParameters, context);
    },
    [StandardNodeType.Dataset]: (formData, context) =>
      generateObjectInputParametersRequired(
        formData?.inputs?.inputParameters,
        context,
        () => true,
      ),
    [StandardNodeType.DatasetWrite]: (formData, context) =>
      generateObjectInputParametersRequired(
        formData?.inputs?.inputParameters,
        context,
        () => true,
      ),
    [StandardNodeType.Question]: (formData, context) => {
      const inputFields = generateArrayInputParameters(
        formData?.inputParameters,
        context,
      );
      const anwserType = get(formData, 'questionParams.answer_type');
      const optionType = get(formData, 'questionParams.option_type');
      if (anwserType !== 'option' || optionType !== OptionType.Dynamic) {
        return inputFields;
      }
      const dynamicOption = get(formData, 'questionParams.dynamic_option');
      const dynamicField = generateObjectInputParameters(
        {
          dynamic_option: dynamicOption,
        },
        context,
      );
      return [...inputFields, ...dynamicField];
    },
    [StandardNodeType.Http]: (formData, context) => {
      const urlFormFields = generateExpressionString(
        formData.inputs?.apiInfo?.url,
        {
          ...context,
          labelPrefix: I18n.t('node_http_api'),
          namePrefix: '__apiInfo_url_',
        },
        nodesService,
      );
      // The name field is the key submitted to the backend
      const paramsFormFields = generateArrayInputParameters(
        formData?.inputs?.params,
        context,
      ).map(i => ({
        ...i,
        name: `__params_${md5(i.name as string)}`,
        title: `${I18n.t('node_http_request_params')}-${i.name}`,
      }));

      const headersFormFields = generateArrayInputParameters(
        formData?.inputs?.headers,
        context,
      ).map(i => ({
        ...i,
        name: `__headers_${md5(i.name as string)}`,
        title: `${I18n.t('node_http_headers')}-${i.name}`,
      }));

      let authFormFields: TestFormField[] = [];
      const isAuthOpen = formData.inputs.auth?.authOpen;
      if (isAuthOpen) {
        const authType = formData.inputs.auth?.authType;
        const authDataPathMap = {
          [AuthType.BasicAuth]: 'auth.authData.basicAuthData',
          [AuthType.Bearer]: 'auth.authData.bearerTokenData',
          [AuthType.Custom]: 'auth.authData.customData.data',
        };
        authFormFields = generateArrayInputParameters(
          get(formData.inputs, authDataPathMap[authType]),
          context,
        );
        if (authFormFields.length) {
          const pathStr = authDataPathMap[authType].split('.').join('_');
          authFormFields = authFormFields.map(i => ({
            ...i,
            name: `__${pathStr}_${i.name}`,
            title: `${I18n.t('node_http_auth')}-${i.name}`,
          }));
        }
      }

      let bodyFormFields: TestFormField[] = [];
      const bodyType = formData.inputs.body?.bodyType;
      const bodyDataPathMap = {
        [BodyType.Binary]: 'body.bodyData.binary',
        [BodyType.FormData]: 'body.bodyData.formData',
        [BodyType.FormUrlEncoded]: 'body.bodyData.formURLEncoded',
        [BodyType.Json]: 'body.bodyData.json',
        [BodyType.RawText]: 'body.bodyData.rawText',
      };
      const dataPath = bodyDataPathMap?.[bodyType];
      if (
        bodyType === BodyType.FormUrlEncoded ||
        bodyType === BodyType.FormData
      ) {
        bodyFormFields = generateArrayInputParameters(
          get(formData.inputs, dataPath),
          context,
        ).map(i => {
          const prefixName =
            bodyType === BodyType.FormUrlEncoded
              ? 'formUrlEncoded'
              : 'formData';

          const pathStr = dataPath.split('.').join('_');
          return {
            ...i,
            name: `__${pathStr}_${md5(i.name as string)}`,
            title: `${prefixName}-${i.name}`,
          };
        });
      } else if (bodyType === BodyType.Json || bodyType === BodyType.RawText) {
        bodyFormFields = generateExpressionString(
          get(formData.inputs, dataPath),
          {
            ...context,
            labelPrefix: I18n.t('node_http_body'),
            namePrefix: `__${dataPath.replaceAll('.', '_')}_`,
          },
          nodesService,
        );
      } else if (bodyType === BodyType.Binary) {
        bodyFormFields = generateObjectInputParameters(
          get(formData.inputs, dataPath),
          context,
        ).map(i => ({
          ...i,
          name: `__${dataPath.replaceAll('.', '_')}_fileURL`,
          title: `${I18n.t('node_http_body')}-${I18n.t(
            'node_http_body_binary',
          )}`,
        }));
      }

      return [
        ...urlFormFields,
        ...paramsFormFields,
        ...headersFormFields,
        ...authFormFields,
        ...bodyFormFields,
      ];
    },
    [StandardNodeType.Loop]: (formData, context) => [
      ...generateArrayInputParameters(
        formData?.inputs?.inputParameters,
        context,
      ),
      ...generateArrayInputParameters(
        formData?.inputs?.variableParameters,
        context,
      ),
    ],
    [StandardNodeType.Batch]: (formData, context) => [
      ...generateArrayInputParameters(
        formData?.inputs?.inputParameters,
        context,
      ),
    ],
    [StandardNodeType.LLM]: (formData, context) =>
      generateArrayInputParameters(
        formData?.$$input_decorator$$?.inputParameters,
        context,
      ),
    [StandardNodeType.LTM]: (formData, context) =>
      generateArrayInputParameters(formData?.inputs.inputParameters, context),
    [StandardNodeType.Intent]: (formData, context) =>
      generateArrayInputParameters(formData?.inputs.inputParameters, context),
    [StandardNodeType.SceneChat]: (formData, context) => {
      const normalInputParameters = formData?.inputParameters.filter(
        item => item.name !== roleInformationKeyword && isSceneFlow,
      );

      const inputFields = generateArrayInputParameters(
        normalInputParameters,
        context,
      );
      const roleListSchema = getSceneFlowRoleListSchema();
      if (roleListSchema) {
        inputFields.push(roleListSchema);
      }

      return inputFields;
    },
    [StandardNodeType.SceneVariable]: (formData, context) => {
      const inputParameter =
        formData?.mode === 'set' ? formData?.set?.input : formData?.get?.input;
      if (!inputParameter) {
        return [];
      }
      return generateArrayInputParameters([inputParameter], context);
    },
    [StandardNodeType.ImageCanvas]: (formData, context) => [
      ...generateArrayInputParameters(
        formData?.inputs?.inputParameters,
        context,
      ),
    ],
    [StandardNodeType.ImageGenerate]: generateImageflowGenerateTestFormFields,
    [StandardNodeType.Database]: (formData, context) =>
      generateArrayInputParameters(formData?.inputParameters, context),
    [StandardNodeType.TriggerDelete]: (formData, context) =>
      generateObjectInputParametersRequired(
        formData?.inputs?.inputParameters,
        context,
        key => key === 'userId',
      ),
    [StandardNodeType.TriggerRead]: (formData, context) =>
      generateObjectInputParametersRequired(
        formData?.inputs?.inputParameters,
        context,
        key => key === 'userId',
      ),
    [StandardNodeType.TriggerUpsert]: generateUpdateTriggerFields,
    [StandardNodeType.DatabaseCreate]: generateDatabaseCreateTestRunFormFields,
    [StandardNodeType.DatabaseDelete]: generateDatabaseDeleteTestRunFormFields,
    [StandardNodeType.DatabaseQuery]: generateDatabaseQueryTestRunFormFields,
    [StandardNodeType.DatabaseUpdate]: generateDatabaseUpdateTestRunFormFields,

    default: (formData, context) =>
      generateArrayInputParameters(formData?.inputParameters, context),

    // default: (formData, context) => {
    //   const { node } = context;
    //   const registry = node.getNodeRegistry();
    //   //Part of the path needs to be processed, for example, some parts start with a backslash and need to be removed
    //   const inputParametersPath =
    //     registry?.meta?.inputParametersPath ?? 'inputParameters';

    //   return generateArrayInputParameters(
    //     get(formData, inputParametersPath),
    //     context,
    //   );
    // },
    batch: (_, context) => {
      const { node } = context;
      const path = node.getNodeMeta()?.batchPath;
      if (!path) {
        return [];
      }

      const batchModePath = [
        StandardNodeType.SubWorkflow,
        StandardNodeType.Api,
      ].includes(node.flowNodeType as StandardNodeType)
        ? '/inputs/batchMode'
        : '/batchMode';
      const batchMode = node
        .getData(FlowNodeFormData)
        .formModel.getFormItemValueByPath(batchModePath);
      if (batchMode !== 'batch') {
        return [];
      }
      const batchData = node
        .getData(FlowNodeFormData)
        .formModel.getFormItemValueByPath(path);
      return generateArrayInputParameters(batchData?.inputLists, context).map(
        i => {
          /** Batch needs to be tagged. */
          if (i.decorator.type === 'FormItem') {
            const decorator = {
              ...i?.decorator,
              ...COMMON_FIELD.decorator,
              props: {
                ...i?.decorator?.props,
                tag: [
                  i?.decorator?.props?.tag,
                  I18n.t('workflow_detail_node_batch'),
                ]
                  .filter(Boolean)
                  .join(' - '),
              },
            };
            return {
              ...i,
              decorator,
            };
          }
          return i;
        },
      );
    },
    setting: (_, context) => {
      const { node } = context;
      if (node.flowNodeType === StandardNodeType.Batch) {
        const batchData = node
          .getData(FlowNodeFormData)
          .formModel.getFormItemValueByPath('/inputs');
        return generateObjectInputParameters(
          pick(batchData, ['batchSize', 'concurrentSize']),
          context,
        );
      } else if (node.flowNodeType === StandardNodeType.Loop) {
        const data = node
          .getData(FlowNodeFormData)
          .formModel.getFormItemValueByPath('/inputs');
        if (data.loopType === 'count') {
          return generateObjectInputParameters(
            pick(data, 'loopCount'),
            context,
          );
        }
      }
      return [];
    },
  };
  return generateTestFormFieldsMap;
};
