import { type VariableItem, VariableKeyErrType } from '../types/skill';

export function uniqMemoryList(
  list: VariableItem[],
  sysVariables: VariableItem[] = [],
) {
  return list.map(i => {
    const res = { ...i };
    if (
      list.filter(j => j.key === i.key).length === 1 &&
      sysVariables.filter(v => v.key === i.key)?.length === 0
    ) {
      res.errType = VariableKeyErrType.KEY_CHECK_PASS;
    } else {
      res.errType = VariableKeyErrType.KEY_NAME_USED;
    }
    if (!i.key) {
      res.errType = VariableKeyErrType.KEY_IS_NULL;
    }
    return res;
  });
}
