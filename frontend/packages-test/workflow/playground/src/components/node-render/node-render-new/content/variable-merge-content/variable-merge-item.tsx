import React, { type FC } from 'react';

import classnames from 'classnames';

import { VariableTagList } from '../../fields/variable-tag-list';
import { type VariableMergeGroup } from './types';

interface VariableMergeItemProps {
  mergeGroup: VariableMergeGroup;
  index: number;
}

/**
 * 变量合并项
 */
export const VariableMergeItem: FC<VariableMergeItemProps> = ({
  mergeGroup,
  index,
}) => {
  const cls = index !== 0 ? 'mt-[6px]' : '';
  return (
    <>
      <div
        className={classnames(
          'w-[69px] h-5 leading-5 truncate coz-fg-dim font-medium text-xs pr-0.5',
          cls,
        )}
      >
        {mergeGroup.name}
      </div>
      <div className={classnames('space-y-2', cls)}>
        {mergeGroup.type ? <VariableTagList value={[mergeGroup]} /> : null}
        <VariableTagList value={mergeGroup.variableTags} maxTagWidth={120} />
      </div>
    </>
  );
};
