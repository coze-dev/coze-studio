import {
  type ShortMemPolicy,
  type ModelInfo,
} from '@coze-arch/bot-api/developer_api';

export const convertFormValueToModelInfo = (
  values: Record<string, unknown>,
): ModelInfo => {
  const { HistoryRound, ContextContentType, ...rest } = values;
  // eslint-disable-next-line @typescript-eslint/naming-convention -- 不适用这个 case
  const ShortMemPolicy: ShortMemPolicy = {};

  if (typeof HistoryRound === 'number') {
    ShortMemPolicy.HistoryRound = HistoryRound;
  }

  if (typeof ContextContentType === 'number') {
    ShortMemPolicy.ContextContentType = ContextContentType;
  }

  return {
    ...rest,
    ShortMemPolicy,
  };
};
