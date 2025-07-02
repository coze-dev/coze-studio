import React, { type FC } from 'react';

import { Tag } from '@coze-arch/coze-design';

import { type MergeGroup } from '../../types';
import { useGroupTypeAlias } from './use-group-type-alias';

interface Props {
  mergeGroup: MergeGroup;
}

export const GroupTypeTag: FC<Props> = ({ mergeGroup }) => {
  const alias = useGroupTypeAlias(mergeGroup);
  return alias ? (
    <Tag size="mini" color="primary" className="shrink-0 font-medium">
      {alias}
    </Tag>
  ) : null;
};
