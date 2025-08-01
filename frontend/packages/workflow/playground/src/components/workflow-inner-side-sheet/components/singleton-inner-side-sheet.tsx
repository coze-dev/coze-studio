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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, type PropsWithChildren } from 'react';

import { SideSheet } from '@coze-arch/bot-semi';

import {
  useInnerSideSheetStoreShallow,
  type SingletonSideSheetProps,
} from '../hooks/use-inner-side-sheet-store';
import { getWorkflowInnerSideSheetHolder } from '../../../utils/get-workflow-inner-side-sheet-holder';

/* Singleton InnerSideSheet pop-up window, open one and close the other */
export const SingletonInnerSideSheet = (
  props: PropsWithChildren<
    SingletonSideSheetProps & {
      sideSheetProps: Record<string, any>;
    }
  >,
) => {
  const {
    sideSheetId,
    closeConfirm,
    mutexWithLeftSideSheet,
    sideSheetProps,
    children,
  } = props;

  const { registerSideSheet, unRegisterSideSheet, activeId } =
    useInnerSideSheetStoreShallow();

  useEffect(() => {
    registerSideSheet(sideSheetId, {
      sideSheetId,
      closeConfirm,
      mutexWithLeftSideSheet,
    });

    return () => unRegisterSideSheet(sideSheetId);
  }, [sideSheetId, closeConfirm, mutexWithLeftSideSheet]);

  if (activeId !== sideSheetId) {
    return null;
  }

  return (
    <SideSheet
      closable={false}
      mask={false}
      maskClosable={false}
      {...sideSheetProps}
      visible={!!activeId}
      getPopupContainer={getWorkflowInnerSideSheetHolder}
    >
      {children}
    </SideSheet>
  );
};
