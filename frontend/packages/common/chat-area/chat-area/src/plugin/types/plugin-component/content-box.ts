import { type RefObject, type ComponentType, type ReactNode } from 'react';

import { type ScrollViewController } from '@coze-common/scroll-view';

import { type ContentBoxProps } from '../../../components/types';

export type CustomContentBox = ComponentType<ContentBoxProps>;

export type MessageListFloatSlot = ComponentType<{
  contentRef: RefObject<HTMLDivElement>;
  getScrollViewRef: RefObject<() => ScrollViewController>;
  headerNode: ReactNode;
}>;
