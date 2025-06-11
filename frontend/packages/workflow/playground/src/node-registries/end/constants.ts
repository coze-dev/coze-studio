import { I18n } from '@coze-arch/i18n';

import { TerminatePlan } from './types';
// 入参路径，试运行等功能依赖该路径提取参数
export const INPUT_PATH = 'inputs.inputParameters';
export const TERMINATE_PLAN_PATH = 'inputs.terminatePlan';
export const ANSWER_CONTENT_PATH = 'inputs.content';
export const STREAMING_OUTPUT_PATH = 'inputs.streamingOutput';
export const defaultTerminalPlanOptions = [
  {
    value: TerminatePlan.ReturnVariables,
    label: I18n.t('workflow_241111_02'),
  },
  {
    value: TerminatePlan.UseAnswerContent,
    label: I18n.t('workflow_241111_03'),
  },
];
