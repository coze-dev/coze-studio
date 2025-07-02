/**
 * 可调节宽度的节点侧拉窗
 */
import { type FC } from 'react';

import { type ResizableProps, Resizable } from 're-resizable';

import { useResizable } from './use-resizable';

interface ResizableSidePanelProps extends ResizableProps {
  bypass?: boolean;
}

export const ResizableSidePanel: FC<ResizableSidePanelProps> = ({
  children,
  bypass,
  ...props
}) => {
  const resizable = useResizable();

  if (bypass) {
    return <>{children}</>;
  }

  return <Resizable {...{ ...resizable, ...props }}>{children}</Resizable>;
};
