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

import {
  type FileMessageContent,
  type ImageMessageContent,
} from '@coze-common/chat-core';
import { type MdBoxLazyProps } from '@coze-arch/bot-md-box-adapter/lazy';

import { type IMessage } from './common';

export type IContent = ISuggestionContent | IImageContent;

export type ISuggestionContent = IMessage[];

export type IImageContent = ImageMessageContent;

export interface IFileContent {
  file_list: Array<
    FileMessageContent['file_list'][0] & {
      upload_status?: number;
      upload_percent?: number;
    }
  >;
}

export const enum ContentBoxType {
  TEXT = 1,
  IMAGE = 2,
  CARD = 3,
  FILE = 4,
  TAKO = 5,
  SUGGESTION = 100,
  SIMPLE_FUNCTION = 101,
}

export interface IFunctionCallContent {
  name: string;
  arguments: {
    name: string;
    description: string;
  };
}

export type GetBotInfo = (id: string) => { nickname: string } | undefined;

export type MdBoxProps = Pick<
  MdBoxLazyProps,
  'insertedElements' | 'enabledHtmlTags' | 'slots'
>;
