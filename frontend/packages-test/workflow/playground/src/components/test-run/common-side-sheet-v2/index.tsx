import { useMemo } from 'react';

import { SideSheet } from '@coze-arch/coze-design';

import { useTestFormState } from '@/hooks';
import { WORKFLOW_PLAYGROUND_CONTENT_ID } from '@/constants';

import { SheetKeys } from './sheet-keys';

interface CommonSideSheetV2Props {
  /** 唯一 key */
  sheetKey: SheetKeys;
  width?: number;
}

const CommonSideSheetV2: React.FC<
  React.PropsWithChildren<CommonSideSheetV2Props>
> = ({ sheetKey, width, children }) => {
  const { commonSheetKey } = useTestFormState();

  const visible = useMemo(
    () => sheetKey === commonSheetKey,
    [sheetKey, commonSheetKey],
  );

  return (
    <SideSheet
      visible={visible}
      width={width}
      closable={false}
      mask={false}
      headerStyle={{
        display: 'none',
      }}
      bodyStyle={{
        padding: 0,
      }}
      style={{
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
      }}
      getPopupContainer={() =>
        document.querySelector(`#${WORKFLOW_PLAYGROUND_CONTENT_ID}`) ||
        document.body
      }
    >
      <div
        className="m-2 rounded-lg bg-foreground-white flex overflow-hidden"
        style={{
          height: 'calc(100% - 16px)',
          boxShadow: '0 6px 8px 0 #1d1c230f',
        }}
      >
        {children}
      </div>
    </SideSheet>
  );
};

export { CommonSideSheetV2, SheetKeys };
export { CommonSideSheetHeaderV2 } from './sheet-header';
