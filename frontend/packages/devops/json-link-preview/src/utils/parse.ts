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

export interface JsonValue {
  content_type: string;
  content: {
    text: string | null;
    image_url: null | {
      url: string;
      name: string;
    };
    file_url: null | {
      url: string;
      file_name: string;
      suffix_type: string;
    };
  };
}

const supportedType = new Set(['image', 'file']);

export interface Result {
  link: string;
  contentType: string;
  extraInfo?: Record<string, string>;
}

export const parse = (inputValue: JsonValue[]) => {
  const result: Record<string, Result> = {};

  inputValue.forEach(item => {
    if (!supportedType.has(item.content_type)) {
      return;
    }

    if (item.content_type === 'image') {
      const link = item.content.image_url?.url ?? '';
      result[link] = {
        link,
        contentType: 'image',
      };
    }

    if (item.content_type === 'file') {
      const suffixType = item.content.file_url?.suffix_type ?? '';
      const link = item.content.file_url?.url ?? '';
      result[link] = {
        link,
        contentType: suffixType,
        extraInfo: {
          fileName: item.content.file_url?.file_name ?? '',
        },
      };
    }
  });

  return result;
};
