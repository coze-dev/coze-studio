import { useState, type PropsWithChildren } from 'react';

import classNames from 'classnames';
import { IconCozArrowRight } from '@coze-arch/coze-design/icons';
import { Collapsible, Typography } from '@coze-arch/coze-design';

export interface CollapsePanelProps extends PropsWithChildren {
  header: React.ReactNode;
  keepDOM?: boolean;
}

/**
 * 用 Collapsible 封装的更符合 UI 设计的折叠面板
 */
export function CollapsePanel({
  header,
  keepDOM,
  children,
}: CollapsePanelProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-[4px]">
      <div
        className={classNames(
          'h-[40px] flex items-center gap-[4px] shrink-0 rounded',
          'cursor-pointer hover:coz-mg-secondary-hovered active:coz-mg-secondary-pressed',
        )}
        onClick={() => setOpen(!open)}
      >
        <IconCozArrowRight
          className={classNames('coz-fg-secondary text-[14px] m-[4px]', {
            'rotate-90': open,
          })}
        />
        <Typography.Text fontSize="14px" weight={400}>
          {header}
        </Typography.Text>
      </div>
      <Collapsible
        className="ml-[26px] [&>div]:pt-[4px]"
        isOpen={open}
        keepDOM={keepDOM}
      >
        {children}
      </Collapsible>
    </div>
  );
}
