import type { FC, PropsWithChildren } from 'react';

// 本期不需要不支持复布局解析
export const DSLColumnLayout: FC<PropsWithChildren> = ({ children }) => (
  <div className="flex items-center justify-between w-full mb-3 gap-2">
    {children}
  </div>
);
