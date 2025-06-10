import { VariableChannel } from '@coze-arch/bot-api/memory';

import { type VariableGroup } from '@/store';

import { flatGroupVariableMeta } from '../../../variable-tree/utils';

export const useGetHideKeys = (variableGroup: VariableGroup) => {
  const hideKeys: string[] = [];

  const hideChannel =
    flatGroupVariableMeta([variableGroup]).filter(
      item => (item?.effectiveChannelList?.length ?? 0) > 0,
    ).length <= 0;

  const hideTypeChange = variableGroup.channel === VariableChannel.Custom;

  if (hideChannel) {
    hideKeys.push('channel');
  }

  if (hideTypeChange) {
    hideKeys.push('type');
  }
  return hideKeys;
};
