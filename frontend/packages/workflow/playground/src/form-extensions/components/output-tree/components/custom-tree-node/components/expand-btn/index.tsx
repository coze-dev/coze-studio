import React from 'react';

import { IconCozExpand, IconCozMinimize } from '@coze/coze-design/icons';
import { IconButton } from '@coze/coze-design';
export const ExpandBtn = ({
  onClick,
  expand,
}: {
  onClick?: () => void;
  expand?: boolean;
}) => (
  <div className="flex flex-row items-center self-stretch h-[24px]">
    <IconButton
      className="!block"
      size="small"
      color={expand ? 'highlight' : 'secondary'}
      onClick={() => onClick?.()}
      icon={
        expand ? (
          <IconCozMinimize className="text-sm" />
        ) : (
          <IconCozExpand className="text-sm" />
        )
      }
    />
  </div>
);
