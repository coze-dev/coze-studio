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
 * Follow-up maintenance Note that cards of types that require extended parameters are turned off by default
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
