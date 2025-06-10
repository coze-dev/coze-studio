import { useAbilityConfigContext } from '../../context/ability-config-context';

/**
 * 用户内部获取ToolKey使用
 */
export const useAbilityConfig = () => {
  const { abilityKey, scope } = useAbilityConfigContext();

  return { abilityKey, scope };
};
