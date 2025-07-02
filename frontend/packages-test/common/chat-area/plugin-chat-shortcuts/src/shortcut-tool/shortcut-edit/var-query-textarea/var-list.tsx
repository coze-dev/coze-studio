import { type PropsWithChildren, type FC } from 'react';

export const InputTypeTag: FC<PropsWithChildren> = ({ children }) => (
  <span className="coz-mg-secondary-hovered rounded-[4px] h-[16px] text-[12px] coz-fg-primary px-[5px] leading-[16px]">
    {children}
  </span>
);

export const VarListItem: FC<PropsWithChildren> = ({ children }) => (
  <div className="flex justify-between items-center px-[4px] text-[14px] font-normal coz-fg-primary">
    {children}
  </div>
);
