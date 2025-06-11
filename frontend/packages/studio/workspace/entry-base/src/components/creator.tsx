import { type FC } from 'react';

import { Avatar } from '@coze/coze-design';

export interface CreatorProps {
  avatar?: string;
  name?: string;
  extra?: string;
}

export const Creator: FC<CreatorProps> = ({ avatar, name, extra }) => (
  <div className="flex items-center gap-x-[4px] h-[16px] coz-fg-secondary text-[12px] leading-16px">
    <Avatar className="w-[16px] h-[16px] flex-shrink-0" src={avatar} />
    <div className="text-nowrap">{name}</div>
    <div className="w-3px h-3px rounded-full bg-[var(--coz-fg-secondary)]" />
    <div className="text-ellipsis whitespace-nowrap overflow-hidden">
      {extra}
    </div>
  </div>
);
