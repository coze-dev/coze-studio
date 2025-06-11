import { type FC } from 'react';

import { IconHandle } from '@douyinfe/semi-icons';

import {
  type ConditionBranchProps,
  ConditionBranch,
} from '../condition-branch';

type DraggableConditionBranchPreviewProps = Pick<
  ConditionBranchProps,
  'priority' | 'prefixName' | 'portId' | 'branch'
> & {
  index: number;
};

export const DraggableConditionBranchPreview: FC<
  DraggableConditionBranchPreviewProps
> = props => (
  <div className="opacity-100 z-50">
    <ConditionBranch
      {...props}
      titleIcon={
        <IconHandle className="cursor-move pr-1" style={{ color: '#aaa' }} />
      }
    />
  </div>
);
