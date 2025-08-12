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

import { get, set, omit, isEmpty } from 'lodash-es';
import {
  Field,
  ValidateTrigger,
  FieldArray,
  type FieldRenderProps,
  type FieldArrayRenderProps,
  type FormMetaV2,
  type FormRenderProps,
  nanoid,
  type Validate,
} from '@flowgram-adapter/free-layout-editor';
import { PublicScopeProvider } from '@coze-workflow/variable';
import { nodeUtils, ViewVariableType } from '@coze-workflow/nodes';
import {
  BlockInput,
  concatTestId,
  type InputValueDTO,
  type RefExpression,
  type ValueExpression,
  ValueExpressionType,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozPlus, IconCozMinus } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

import { type IModelValue } from '@/typing';
import { WorkflowModelsService } from '@/services';
import { provideNodeOutputVariablesEffect } from '@/nodes-v2/materials/provide-node-output-variables';
import { createProvideNodeBatchVariables } from '@/nodes-v2/materials/provide-node-batch-variable';
import { fireNodeTitleChange } from '@/nodes-v2/materials/fire-node-title-change';
import { createValueExpressionInputValidate } from '@/nodes-v2/materials/create-value-expression-input-validate';
import { ChatHistory } from '@/nodes-v2/llm/chat-history';
import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { ValueExpressionInput } from '@/nodes-v2/components/value-expression-input';
import { Outputs } from '@/nodes-v2/components/outputs';
import { createNodeInputNameValidate } from '@/nodes-v2/components/node-input-name/validate';
import { NodeInputName } from '@/nodes-v2/components/node-input-name';
import { FormItemFeedback } from '@/nodes-v2/components/form-item-feedback';
import { BatchMode } from '@/nodes-v2/components/batch-mode';
import { Batch } from '@/nodes-v2/components/batch/batch';
import { useGetWorkflowMode, useGlobalState } from '@/hooks';
import { FormCard } from '@/form-extensions/components/form-card';
import { ColumnsTitleWithAction } from '@/form-extensions/components/columns-title-with-action';
import { ModelSelect } from '@/components/model-select';

import { nodeMetaValidate } from '../materials/node-meta-validate';
import { SettingOnError } from '../components/setting-on-error';
import NodeMeta from '../components/node-meta';
import { Vision, isVisionInput } from './vision';
import {
  llmOutputTreeMetaValidator,
  llmInputNameValidator,
} from './validators';
import {
  getDefaultLLMParams,
  modelItemToBlockInput,
  reviseLLMParamPair,
} from './utils';
import { UserPrompt } from './user-prompt';
import { type FormData } from './types';
import { SystemPrompt } from './system-prompt';
import { type BoundSkills } from './skills/types';
import {
  formatFcParamOnInit,
  formatFcParamOnSubmit,
} from './skills/data-transformer';
import { Skills } from './skills';
import {
  formatReasoningContentOnInit,
  formatReasoningContentOnSubmit,
  provideReasoningContentEffect,
  sortOutputs,
} from './cot';

import styles from './index.module.less';

/** Default session rounds */
const DEFAULT_CHAT_ROUND = 3;

const Render = ({ form }: FormRenderProps<FormData>) => {
  const readonly = useReadonly();
  const { isChatflow } = useGetWorkflowMode();
  const { isBindDouyin } = useGlobalState();

  return (
    <PublicScopeProvider>
      <>
        <NodeMeta
          deps={['outputs', 'batchMode']}
          outputsPath={'outputs'}
          batchModePath={'batchMode'}
        />
        <Field name={'batchMode'}>
          {({ field }: FieldRenderProps<string>) => (
            <BatchMode
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        </Field>
        <Field name={'model'}>
          {({ field }: FieldRenderProps<IModelValue | undefined>) => (
            <FormCard
              header={I18n.t('workflow_detail_llm_model')}
              tooltip={I18n.t('workflow_detail_llm_prompt_tooltip')}
            >
              <ModelSelect {...field} readonly={readonly} />
            </FormCard>
          )}
        </Field>
        <Batch batchModeName={'batchMode'} name={'batch'} />
        {!isBindDouyin ? (
          <Field name="fcParam">
            {({ field }: FieldRenderProps<BoundSkills | undefined>) => (
              <Skills {...field} />
            )}
          </Field>
        ) : null}
        <FieldArray
          name={'$$input_decorator$$.inputParameters'}
          defaultValue={[
            { name: 'input', input: { type: ValueExpressionType.REF } },
          ]}
        >
          {({
            field,
          }: FieldArrayRenderProps<{
            name: string;
            input: { type: ValueExpressionType };
          }>) => (
            <FormCard
              header={I18n.t('workflow_detail_node_parameter_input')}
              tooltip={I18n.t('workflow_detail_llm_input_tooltip')}
            >
              <div className={styles['columns-title']}>
                <ColumnsTitleWithAction
                  columns={[
                    {
                      title: I18n.t('workflow_detail_variable_input_name'),
                      style: {
                        flex: 2,
                      },
                    },
                    {
                      title: I18n.t('workflow_detail_variable_input_value'),
                      style: {
                        flex: 3,
                      },
                    },
                  ]}
                  readonly={readonly}
                />
              </div>
              {field.map((child, index) =>
                isVisionInput(child.value) ? null : (
                  <div
                    key={child.key}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      paddingBottom: 4,
                      gap: 4,
                    }}
                  >
                    <Field name={`${child.name}.name`}>
                      {({
                        field: childNameField,
                        fieldState: nameFieldState,
                      }: FieldRenderProps<string>) => (
                        <div
                          style={{
                            flex: 2,
                            minWidth: 0,
                          }}
                        >
                          <NodeInputName
                            {...childNameField}
                            input={form.getValueIn<RefExpression>(
                              `${child.name}.input`,
                            )}
                            inputParameters={field.value || []}
                            isError={!!nameFieldState?.errors?.length}
                          />
                          <FormItemFeedback errors={nameFieldState?.errors} />
                        </div>
                      )}
                    </Field>
                    <Field name={`${child.name}.input`}>
                      {({
                        field: childInputField,
                        fieldState: inputFieldState,
                      }: FieldRenderProps<ValueExpression | undefined>) => (
                        <div style={{ flex: 3, minWidth: 0 }}>
                          <ValueExpressionInput
                            {...childInputField}
                            isError={!!inputFieldState?.errors?.length}
                          />
                          <FormItemFeedback errors={inputFieldState?.errors} />
                        </div>
                      )}
                    </Field>
                    {readonly ? (
                      <></>
                    ) : (
                      <div className="leading-none">
                        <IconButton
                          size="small"
                          color="secondary"
                          data-testid={concatTestId(child.name, 'remove')}
                          icon={<IconCozMinus className="text-sm" />}
                          onClick={() => {
                            field.delete(index);
                          }}
                        />
                      </div>
                    )}
                  </div>
                ),
              )}
              {isChatflow ? (
                <Field name={'$$input_decorator$$.chatHistorySetting'}>
                  {({
                    field: enableChatHistoryField,
                  }: FieldRenderProps<{
                    enableChatHistory: boolean;
                    chatHistoryRound: number;
                  }>) => (
                    <ChatHistory
                      {...enableChatHistoryField}
                      style={{ paddingRight: '32px' }}
                      showLine={false}
                    />
                  )}
                </Field>
              ) : null}
              {readonly ? (
                <></>
              ) : (
                <div className={styles['input-add-icon']}>
                  <IconButton
                    className="!block"
                    color="highlight"
                    size="small"
                    icon={<IconCozPlus className="text-sm" />}
                    onClick={() => {
                      field.append({
                        name: '',
                        input: { type: ValueExpressionType.REF },
                      });
                    }}
                  />
                </div>
              )}
            </FormCard>
          )}
        </FieldArray>
        {!isBindDouyin ? <Vision /> : null}
        <Field
          name="$$prompt_decorator$$.systemPrompt"
          deps={['$$input_decorator$$.inputParameters']}
          defaultValue={''}
        >
          {({ field }: FieldRenderProps<string>) => (
            <>
              <SystemPrompt
                {...field}
                placeholder={I18n.t('workflow_detail_llm_sys_prompt_content')}
                fcParam={form.getValueIn('fcParam')}
                inputParameters={form.getValueIn(
                  '$$input_decorator$$.inputParameters',
                )}
              />
            </>
          )}
        </Field>
        <Field
          name="$$prompt_decorator$$.prompt"
          deps={['$$input_decorator$$.inputParameters', 'model']}
          defaultValue={''}
        >
          {({ field, fieldState }: FieldRenderProps<string>) => (
            <>
              <UserPrompt field={field} fieldState={fieldState} />
            </>
          )}
        </Field>
        <Field
          name={'outputs'}
          deps={['batchMode']}
          defaultValue={[{ name: 'output', type: ViewVariableType.String }]}
        >
          {({ field, fieldState }) => (
            <Outputs
              id={'llm-node-output'}
              value={field.value}
              onChange={field.onChange}
              batchMode={form.getValueIn('batchMode')}
              withDescription
              showResponseFormat
              titleTooltip={I18n.t('workflow_detail_llm_output_tooltip')}
              disabledTypes={[]}
              needErrorBody={form.getValueIn(
                'settingOnError.settingOnErrorIsOpen',
              )}
              errors={fieldState?.errors}
              sortValue={sortOutputs}
            />
          )}
        </Field>
        <SettingOnError outputsPath={'outputs'} batchModePath={'batchMode'} />
      </>
    </PublicScopeProvider>
  );
};

const NEW_NODE_DEFAULT_VERSION = '3';

const userPromptFieldKey = '$$prompt_decorator$$.prompt';

export const LLM_FORM_META: FormMetaV2<FormData> = {
  render: props => <Render {...props} />,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    nodeMeta: nodeMetaValidate,
    outputs: llmOutputTreeMetaValidator,
    '$$input_decorator$$.inputParameters.*.name': llmInputNameValidator,
    '$$input_decorator$$.inputParameters.*.input':
      createValueExpressionInputValidate({ required: true }),
    'batch.inputLists.*.name': createNodeInputNameValidate({
      getNames: ({ formValues }) =>
        (get(formValues, 'batch.inputLists') || []).map(item => item.name),
      skipValidate: ({ formValues }) => formValues.batchMode === 'single',
    }),
    [userPromptFieldKey]: (({ value, formValues, context }) => {
      const { playgroundContext } = context;
      const modelType = get(formValues, 'model.modelType');
      const curModel = playgroundContext?.models?.find(
        model => model.model_type === modelType,
      );
      const isUserPromptRequired = curModel?.is_up_required ?? false;
      if (!isUserPromptRequired) {
        return undefined;
      }
      return value?.length
        ? undefined
        : I18n.t('workflow_detail_llm_prompt_error_empty');
    }) as Validate,
  },
  effect: {
    nodeMeta: fireNodeTitleChange,
    batchMode: createProvideNodeBatchVariables('batchMode', 'batch.inputLists'),
    'batch.inputLists': createProvideNodeBatchVariables(
      'batchMode',
      'batch.inputLists',
    ),
    outputs: provideNodeOutputVariablesEffect,
    model: provideReasoningContentEffect,
  },
  // eslint-disable-next-line complexity
  formatOnInit(value, context) {
    const { node, playgroundContext } = context;
    const modelsService = node.getService<WorkflowModelsService>(
      WorkflowModelsService,
    );
    const models = modelsService.getModels();
    let llmParam = get(value, 'inputs.llmParam');

    // When first dragged into the canvas: Parse out the default value from the backend return value.
    if (!llmParam) {
      llmParam = getDefaultLLMParams(models);
    }

    const model: { [k: string]: unknown } = {};

    llmParam.forEach((d: InputValueDTO) => {
      const [k, v] = reviseLLMParamPair(d);
      model[k] = v;
    });

    const { prompt } = model;
    delete model.prompt;
    delete model.systemPrompt;
    delete model.enableChatHistory;

    const inputParameters = get(value, 'inputs.inputParameters');
    const outputs = get(value, 'outputs');
    const isBatch = get(value, 'inputs.batch.batchEnable');

    const initValue = {
      nodeMeta: value?.nodeMeta,
      $$input_decorator$$: {
        inputParameters: !inputParameters
          ? [{ name: 'input', input: { type: ValueExpressionType.REF } }]
          : inputParameters,
        chatHistorySetting: {
          // Whether to open session history
          enableChatHistory:
            get(
              llmParam.find(item => item.name === 'enableChatHistory'),
              'input.value.content',
            ) || false,

          // Number of session rounds, the default is 3 rounds
          chatHistoryRound: Number(
            get(
              llmParam.find(item => item.name === 'chatHistoryRound'),
              'input.value.content',
              DEFAULT_CHAT_ROUND,
            ),
          ),
        },
      },
      outputs: isEmpty(outputs)
        ? [{ name: 'output', type: ViewVariableType.String, key: nanoid() }]
        : formatReasoningContentOnInit({
            modelsService,
            isBatch,
            outputs,
            modelType: model.modelType as number,
          }),

      // The model will re-fill the value according to llmParam, and the previous chatHistoryRound will also be filled at this time.
      // Since a chatHistoryRound will be re-added when submitting, it will be ignored here to avoid problems.
      model: omit(model, ['chatHistoryRound']),
      $$prompt_decorator$$: {
        prompt,
        systemPrompt: get(
          llmParam.find(item => item.name === 'systemPrompt'),
          'input.value.content',
        ),
      },
      batchMode: isBatch ? 'batch' : 'single',
      batch: nodeUtils.batchToVO(get(value, 'inputs.batch'), context),
      fcParam: formatFcParamOnInit(get(value, 'inputs.fcParam')),
    };

    // Get the version information sent by the backend
    const schema = JSON.parse(
      playgroundContext.globalState.info?.schema_json || '{}',
    );
    const curNode = schema?.nodes?.find(_node => _node.id === node.id);
    const versionFromBackend =
      parseInt(curNode?.data?.version) >= parseInt(NEW_NODE_DEFAULT_VERSION)
        ? curNode?.data?.version
        : NEW_NODE_DEFAULT_VERSION;
    // [LLM node revised requirements, new node defaults to 3]
    set(initValue, 'version', versionFromBackend);

    return initValue;
  },
  formatOnSubmit(value, context) {
    const { node, playgroundContext } = context;
    const { globalState } = playgroundContext;

    const models = node
      .getService<WorkflowModelsService>(WorkflowModelsService)
      .getModels();
    const { model } = value;
    const modelMeta = models.find(m => m.model_type === model.modelType);

    const llmParam = modelItemToBlockInput(model, modelMeta);
    const { batchMode } = value;
    const batchDTO = nodeUtils.batchToDTO(value.batch, context);

    const prompt = BlockInput.createString(
      'prompt',
      value.$$prompt_decorator$$.prompt,
    );

    const enableChatHistory = BlockInput.createBoolean(
      'enableChatHistory',
      // The workflow has no session history, it needs to be set to false, and the session flow is checked according to the actual check.
      globalState.isChatflow
        ? Boolean(
            get(
              value,
              '$$input_decorator$$.chatHistorySetting.enableChatHistory',
            ),
          )
        : false,
    );
    const chatHistoryRound = BlockInput.createInteger(
      'chatHistoryRound',
      get(value, '$$input_decorator$$.chatHistorySetting.chatHistoryRound'),
    );
    const systemPrompt = BlockInput.createString(
      'systemPrompt',
      get(value, '$$prompt_decorator$$.systemPrompt'),
    );
    llmParam.push(prompt, enableChatHistory, chatHistoryRound, systemPrompt);
    const isBatch = batchMode === 'batch';
    const formattedValue: Record<string, unknown> = {
      nodeMeta: value.nodeMeta,
      inputs: {
        inputParameters: get(value, '$$input_decorator$$.inputParameters'),
        llmParam,
        fcParam: formatFcParamOnSubmit(value.fcParam),
        batch: isBatch
          ? {
              batchEnable: batchMode === 'batch',
              ...batchDTO,
            }
          : undefined,
      },
      outputs: formatReasoningContentOnSubmit(value.outputs, isBatch),
      /**
       * - "LLM node format optimization" requirement, integrate the output content into the prompt to limit the output format, the backend needs flag distinction logic, version 2
       * - "LLM node revised requirements fallback logic", version 3
       */

      version: NEW_NODE_DEFAULT_VERSION,
    };

    return formattedValue;
  },
};
