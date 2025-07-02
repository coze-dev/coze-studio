import { VariableMergeItem } from './variable-merge-item';
import { useVariableMergeVariableTags } from './use-variable-merge-variable-tags';

/**
 * 合并变量节点内容
 */
export function VariableMergeContent() {
  const mergeGroups = useVariableMergeVariableTags();

  return (
    <>
      {mergeGroups.map((mergeGroup, index) => (
        <VariableMergeItem
          mergeGroup={mergeGroup}
          key={mergeGroup.name}
          index={index}
        />
      ))}
    </>
  );
}
