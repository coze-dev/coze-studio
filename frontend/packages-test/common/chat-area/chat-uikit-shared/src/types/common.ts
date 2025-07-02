import { type ForwardRefExoticComponent, type RefAttributes } from 'react';

import type { ContentType, Message } from '@coze-common/chat-core';
import { type IconProps } from '@douyinfe/semi-icons';

import {
  type IFileAttributeKeys,
  type IFileCardTooltipsCopyWritingConfig,
} from './file';
import { type ISimpleFunctionContentCopywriting } from './copywriting';
import { type ContentBoxType } from './content';

export type ICardEmptyConfig = Partial<{
  title: string;
  description: string;
}>;

export interface ICopywritingConfig {
  cardEmpty?: ICardEmptyConfig;
  file?: IFileCardTooltipsCopyWritingConfig;
}

export type IMessage = Message<ContentType>;

export interface IBaseContentProps {
  message: IMessage;
  readonly?: boolean;
  showBackground?: boolean;
  className?: string;
}

export interface IContentConfig<T = Record<string, unknown>> {
  enable?: boolean;
  copywriting?: T;
}

/**
 * 后续维护注意，需要扩展参数的类型的卡片默认关闭
 */
export type IContentConfigs = Partial<{
  [ContentBoxType.TAKO]: IContentConfig;
  [ContentBoxType.CARD]: IContentConfig<ICardCopywritingConfig> & {
    region: unknown;
  };
  [ContentBoxType.IMAGE]: IContentConfig;
  [ContentBoxType.TEXT]: IContentConfig;
  [ContentBoxType.FILE]: IContentConfig<IFileCopywritingConfig> & {
    fileAttributeKeys?: IFileAttributeKeys;
  };
  [ContentBoxType.SIMPLE_FUNCTION]: IContentConfig<ISimpleFunctionContentCopywriting>;
}>;

export interface ICardCopywritingConfig {
  empty: ICardEmptyConfig;
}

export interface IFileCopywritingConfig {
  tooltips: IFileCardTooltipsCopyWritingConfig;
}

export type IChatUploadCopywritingConfig = Partial<{
  fileSizeReachLimitToast: string;
  fileExceedsLimitToast: string;
  fileEmptyToast: string;
}>;

export enum Layout {
  MOBILE = 'mobile',
  PC = 'pc',
}

export type IconType = ForwardRefExoticComponent<
  Omit<IconProps, 'ref' | 'svg'> & RefAttributes<HTMLSpanElement>
>;
