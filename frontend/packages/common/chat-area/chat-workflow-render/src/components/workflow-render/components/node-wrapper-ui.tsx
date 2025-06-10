import { type PropsWithChildren } from 'react';

export const NodeWrapperUI: React.FC<PropsWithChildren> = ({ children }) => (
  <div className="overflow-hidden w-full min-w-[282px] max-w-[546px]">
    {children}
  </div>
);
