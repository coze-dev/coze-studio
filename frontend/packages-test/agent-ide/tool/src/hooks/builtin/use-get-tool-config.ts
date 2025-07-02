import { type AbilityKey } from '@coze-agent-ide/tool-config';

import { useAbilityAreaContext } from '../../context/ability-area-context';

export const useGetToolConfig = () => {
  const {
    store: { useToolAreaStore },
  } = useAbilityAreaContext();

  const registeredToolKeyConfigList = useToolAreaStore(
    state => state.registeredToolKeyConfigList,
  );

  return (abilityKey?: AbilityKey) =>
    registeredToolKeyConfigList.find(
      toolConfig => toolConfig.toolKey === abilityKey,
    );
};
