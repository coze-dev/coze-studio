/* eslint-disable @coze-arch/no-deep-relative-import */
/**
 * BizIDE 侧拉面板
 */

import React, { type FC, type PropsWithChildren } from 'react';

import { useBizIDEState } from '../../../../hooks/use-biz-ide-state';
import { SingletonInnerSideSheet } from '../../../../components/workflow-inner-side-sheet';

interface BizIDEPanelProps {
  id: string;
}

const MIN_WORKFLOW_WIDTH = 1000;
const SIDESHEET_WIDTH_RATIO = 0.66;
const SIDESHEET_DEFAULT_WIDTH = 850;

export const calcIDESideSheetWidth = () => {
  const windowWidth = window.innerWidth;
  const twoThreeWidth = windowWidth * SIDESHEET_WIDTH_RATIO;

  if (windowWidth < MIN_WORKFLOW_WIDTH) {
    return twoThreeWidth;
  } else {
    if (twoThreeWidth < SIDESHEET_DEFAULT_WIDTH) {
      return SIDESHEET_DEFAULT_WIDTH;
    } else {
      return twoThreeWidth;
    }
  }
};

export const BizIDEPanel: FC<PropsWithChildren<BizIDEPanelProps>> = props => {
  const { id, children } = props;
  const { closeConfirm } = useBizIDEState();

  return (
    <SingletonInnerSideSheet
      sideSheetId={id}
      sideSheetProps={{
        className: 'workflow-inner-side-sheet',
        width: calcIDESideSheetWidth(),
        style: {
          position: 'relative',
          overflow: 'auto',
        },
        bodyStyle: {
          padding: 0,
        },
        headerStyle: {
          display: 'none',
        },
        motion: false,
      }}
      closeConfirm={async () => await closeConfirm(id)}
      mutexWithLeftSideSheet
    >
      {children}
    </SingletonInnerSideSheet>
  );
};
