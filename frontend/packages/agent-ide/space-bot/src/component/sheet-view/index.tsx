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

import React, { type ReactNode, type PropsWithChildren } from 'react';

import { BotMode } from '@coze-arch/bot-api/playground_api';

import { SingleSheet, type SingleSheetProps } from './single-sheet';
import { MultipleSheet, type MultipleSheetProps } from './multiple-sheet';
export { SingleSheet, MultipleSheet };

type SheetViewProps = MultipleSheetProps &
  SingleSheetProps & {
    mode: number;
    renderContent?: (headerNode: ReactNode) => ReactNode;
  };

export const SheetView: React.FC<PropsWithChildren<SheetViewProps>> = ({
  mode = 1,
  title,
  titleNode,
  children,
  slideProps,
  containerClassName,
  headerClassName,
  titleClassName,
  renderContent,
}) => {
  if (mode === BotMode.SingleMode || mode === BotMode.WorkflowMode) {
    return (
      <SingleSheet
        containerClassName={containerClassName}
        titleClassName={titleClassName}
        headerClassName={headerClassName}
        title={title}
        titleNode={titleNode}
        renderContent={renderContent}
      >
        {children}
      </SingleSheet>
    );
  }
  return (
    <MultipleSheet
      title={title}
      titleNode={titleNode}
      containerClassName={containerClassName}
      titleClassName={titleClassName}
      headerClassName={headerClassName}
      slideProps={slideProps}
      renderContent={renderContent}
    >
      {children}
    </MultipleSheet>
  );
};
export default SheetView;
