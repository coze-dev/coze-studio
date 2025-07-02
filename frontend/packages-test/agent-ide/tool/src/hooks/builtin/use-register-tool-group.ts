import { useShallow } from 'zustand/react/shallow';

import { type IRegisteredToolGroupConfig } from '../../store/tool-area';
import { useAbilityAreaContext } from '../../context/ability-area-context';

export const useRegisterToolGroup = () => {
  const {
    store: { useToolAreaStore },
  } = useAbilityAreaContext();
  const appendIntoRegisteredToolGroupList = useToolAreaStore(
    useShallow(state => state.appendIntoRegisteredToolGroupList),
  );

  return (params: IRegisteredToolGroupConfig) => {
    appendIntoRegisteredToolGroupList(params);
  };
};

export const useRegisteredToolGroupList = () => {
  const {
    store: { useToolAreaStore },
  } = useAbilityAreaContext();

  const registeredToolGroupList = useToolAreaStore(
    useShallow(state => state.registeredToolGroupList),
  );

  return registeredToolGroupList;
};
