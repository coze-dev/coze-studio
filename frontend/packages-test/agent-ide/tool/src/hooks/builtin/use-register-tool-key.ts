import { useShallow } from 'zustand/react/shallow';

import { type IRegisteredToolKeyConfig } from '../../store/tool-area';
import { useAbilityAreaContext } from '../../context/ability-area-context';

/**
 * 用于内部注册Tool使用
 */
export const useRegisterToolKey = () => {
  const {
    store: { useToolAreaStore },
  } = useAbilityAreaContext();
  const appendIntoRegisteredToolKeyConfigList = useToolAreaStore(
    useShallow(state => state.appendIntoRegisteredToolKeyConfigList),
  );

  return (params: IRegisteredToolKeyConfig) => {
    appendIntoRegisteredToolKeyConfigList(params);
  };
};

export const useRegisteredToolKeyConfigList = () => {
  const {
    store: { useToolAreaStore },
  } = useAbilityAreaContext();

  const registeredToolKeyConfigList = useToolAreaStore(
    useShallow(state => state.registeredToolKeyConfigList),
  );

  return registeredToolKeyConfigList;
};
