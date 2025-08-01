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

/* eslint-disable @coze-arch/no-deep-relative-import */
/**
 * BizIDE side pull panel
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
