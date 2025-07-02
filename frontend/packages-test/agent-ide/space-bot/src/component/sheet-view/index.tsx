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
