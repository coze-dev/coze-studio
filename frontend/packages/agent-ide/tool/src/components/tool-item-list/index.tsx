import { type FC, type PropsWithChildren } from 'react';

export const ToolItemList: FC<PropsWithChildren> = ({ children }) => (
  <div className="grid grid-flow-row gap-y-[4px]">{children}</div>
);
