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

import { isObject } from 'lodash-es';
import {
  ContentType,
  type ImageModel,
  type ImageMixItem,
  type TextMixItem,
  type FileModel,
  type FileMixItem,
} from '@coze-common/chat-core/message/types';

export const isMultimodalContentListLike = (
  value: unknown,
): value is { item_list: unknown[] } =>
  isObject(value) && 'item_list' in value && Array.isArray(value.item_list);

export const isTextMixItem = (value: unknown): value is TextMixItem =>
  isObject(value) &&
  'type' in value &&
  'text' in value &&
  value.type === ContentType.Text;

export const isImageModel = (value: unknown): value is ImageModel =>
  isObject(value) &&
  'key' in value &&
  'image_thumb' in value &&
  'image_ori' in value;

export const isImageMixItem = (value: unknown): value is ImageMixItem =>
  isObject(value) &&
  'type' in value &&
  'image' in value &&
  isImageModel(value.image) &&
  value.type === ContentType.Image;

export const isFileModel = (value: unknown): value is FileModel =>
  isObject(value) &&
  'file_key' in value &&
  'file_name' in value &&
  'file_type' in value &&
  'file_size' in value &&
  'file_url' in value;

export const isFileMixItem = (value: unknown): value is FileMixItem =>
  isObject(value) &&
  'type' in value &&
  'file' in value &&
  isFileModel(value.file) &&
  value.type === ContentType.File;
