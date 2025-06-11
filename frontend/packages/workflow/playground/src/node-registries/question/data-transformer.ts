import { get } from 'lodash-es';
import { variableUtils } from '@coze-workflow/variable';
import { getDefaultLLMParams, formatModelData } from '@coze-workflow/nodes';

import { OptionType } from '@/constants/question-settings';

import {
  DEFAULT_USE_RESPONSE,
  DEFAULT_USER_RESPONSE_PARAM_NAME,
  DEFAULT_EXTRACT_OUTPUT,
  DEFAULT_ANSWER_OPTION_OUTPUT,
  DEFAULT_OUTPUT_NAMES,
} from './constants';

export function transformOnInit(value, context) {
  const { playgroundContext } = context;
  const { variableService } = playgroundContext;
  const { models } = playgroundContext;
  const { inputs = {}, outputs = DEFAULT_USE_RESPONSE, nodeMeta } = value || {};

  const {
    inputParameters = [],
    answer_type = 'text',
    dynamic_option,
    option_type = OptionType.Static,
    extra_output,
    question,
    options,
    limit = 3,
  } = inputs;

  const isAnswerTypeOption = answer_type === 'option';

  const userOutput = (outputs || []).filter(
    item => item.name === DEFAULT_USER_RESPONSE_PARAM_NAME,
  );

  const extractOutput = (outputs || []).filter(item =>
    isAnswerTypeOption
      ? !DEFAULT_OUTPUT_NAMES.includes(item.name)
      : item.name !== DEFAULT_USER_RESPONSE_PARAM_NAME,
  );

  let llmParam = get(value, 'inputs.llmParam');
  // 初次拖入画布时：从后端返回值里，解析出来默认值。
  if (!llmParam) {
    llmParam = getDefaultLLMParams(models);
  }

  return {
    llmParam,
    nodeMeta,
    questionOutputs: {
      limit,
      extra_output: isAnswerTypeOption ? false : extra_output,
      userOutput: userOutput.length > 0 ? userOutput : DEFAULT_USE_RESPONSE,
      extractOutput:
        extractOutput.length > 0 ? extractOutput : DEFAULT_EXTRACT_OUTPUT,
      optionOutput: DEFAULT_ANSWER_OPTION_OUTPUT,
    },
    outputs,
    inputParameters: inputParameters ?? [],
    questionParams: {
      answer_type,
      question,
      options,
      option_type,
      dynamic_option: variableUtils.valueExpressionToVO(
        dynamic_option,
        variableService,
      ),
    },
  };
}

export function transformOnSubmit(value, context) {
  const { playgroundContext, node } = context;
  const { variableService } = playgroundContext;

  const { models } = playgroundContext;

  const {
    llmParam,
    nodeMeta,
    inputParameters,
    questionOutputs,
    outputs,
    questionParams,
  } = value;

  const { limit, extra_output } = questionOutputs;

  const { question, answer_type, options, dynamic_option, option_type } =
    questionParams;

  const modelMeta = models.find(m => m.model_type === llmParam?.modelType);

  return {
    inputs: {
      llmParam: {
        ...formatModelData(llmParam, modelMeta),
        systemPrompt: llmParam?.systemPrompt ?? '',
      },
      inputParameters: inputParameters ?? [],
      extra_output,
      answer_type,
      option_type,
      dynamic_option: !dynamic_option
        ? null
        : variableUtils.valueExpressionToDTO(dynamic_option, variableService, {
            node,
          }),
      question,
      options,
      limit,
    },
    nodeMeta,
    outputs,
  };
}
