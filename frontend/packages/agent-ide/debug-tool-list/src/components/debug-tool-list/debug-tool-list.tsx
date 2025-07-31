/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
