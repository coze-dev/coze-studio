import React, {
  type CSSProperties,
  type FC,
  type PropsWithChildren,
  useState,
} from 'react';

import classNames from 'classnames';
import { OverflowList } from '@blueprintjs/core';

import { ToolPaneContextProvider } from './debug-tool-list-context';

import s from './index.module.less';

interface DebugToolListProps {
  className?: string;
  style?: CSSProperties;
  showBackground: boolean;
}

export const DebugToolList: FC<PropsWithChildren<DebugToolListProps>> = ({
  className,
  style,
  children,
  showBackground,
}): JSX.Element => {
  const [dragModalFocusItemKey, setDragModalFocusItemKey] =
    useState<string>('');

  const panes = React.Children.map(
    children,
    (child: React.ReactNode) => child,
  )?.filter(Boolean);

  return (
    <div
      className={classNames(s['debug-tool-list'], className)}
      style={style}
      data-testid="bot-detail.debug-tool-list"
    >
      <OverflowList
        className={s['tool-overflow-list']}
        items={panes}
        overflowRenderer={() => null}
        visibleItemRenderer={(child: React.ReactNode, index) => (
          <ToolPaneContextProvider
            key={index}
            value={{
              hideTitle: true,
              focusItemKey: dragModalFocusItemKey,
              focusDragModal: itemKey => setDragModalFocusItemKey(itemKey),
              showBackground,
            }}
          >
            {child}
          </ToolPaneContextProvider>
        )}
        collapseFrom="end"
      />
    </div>
  );
};
