import { type AbilityKey } from '@coze-agent-ide/tool-config';

import { useEvent } from '../../event/use-event';
import { EventCenterEventName } from '../../../typings/scoped-events';
import { type IToggleContentBlockEventParams } from '../../../typings/event';

interface IUseToolToggleCollapseParams {
  abilityKeyList: AbilityKey[];
  isExpand: boolean;
}

export const useToolToggleCollapse = () => {
  const { emit } = useEvent();

  return ({ abilityKeyList, isExpand }: IUseToolToggleCollapseParams) => {
    if (!abilityKeyList.length) {
      return;
    }

    abilityKeyList.forEach(abilityKey => {
      emit<IToggleContentBlockEventParams>(
        EventCenterEventName.ToggleContentBlock,
        {
          abilityKey,
          isExpand,
        },
      );
    });
  };
};
