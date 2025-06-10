/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, type PropsWithChildren } from 'react';

import { SideSheet } from '@coze-arch/bot-semi';

import {
  useInnerSideSheetStoreShallow,
  type SingletonSideSheetProps,
} from '../hooks/use-inner-side-sheet-store';
import { getWorkflowInnerSideSheetHolder } from '../../../utils/get-workflow-inner-side-sheet-holder';

/* 单例 InnerSideSheet 弹窗， 打开一个时关闭其他的 */
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
