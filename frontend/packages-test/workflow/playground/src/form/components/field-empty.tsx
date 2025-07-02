import { type PropsWithChildren } from 'react';

import { IconCozEmpty } from '@coze-arch/coze-design/icons';

export interface FieldEmptyProps {
  text?: string;
  isEmpty?: boolean;
}

export function FieldEmpty({
  text = '',
  isEmpty = false,
  children,
}: PropsWithChildren<FieldEmptyProps>) {
  return (
    <>
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-[95px]">
          <IconCozEmpty className="mb-[4px] w-[32px] h-[32px] coz-fg-dim" />
          <div className="text-center text-[12px] leading-[16px] coz-fg-dim">
            {text}
          </div>
        </div>
      ) : (
        children
      )}
    </>
  );
}
