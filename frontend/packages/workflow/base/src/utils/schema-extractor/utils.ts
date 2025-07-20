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
 
import { get } from 'lodash-es';

import { type ValueExpressionDTO } from '../../types';

// 是否我们自己上传生成的url, 这是个临时方案，等修复 schema 中的 type:string -> type:image 后，删掉此逻辑
export function isWorkflowImageTypeURL(str: string): boolean {
  // base64 加工
  const hostWhiteList = [
    'cC1ib3Qtd29ya2Zsb3ctc2lnbi5ieXRlZGFuY2UubmV0',
    'cC1ib3Qtd29ya2Zsb3cuYnl0ZWQub3Jn',
    'cC1ib3Qtd29ya2Zsb3cuYnl0ZWRhbmNlLm5ldA==',
    'cDI2LWJvdC13b3JrZmxvdy1zaWduLmJ5dGVpbWcuY29t',
    'cDMtYm90LXdvcmtmbG93LXNpZ24uYnl0ZWltZy5jb20=',
    'cDktYm90LXdvcmtmbG93LXNpZ24uYnl0ZWltZy5jb20=',
  ];
  const suffixWhiteList = ['image', 'jpg', 'jpeg', 'png'];

  let urlObj;

  try {
    urlObj = new URL(str);
  } catch (_) {
    return false;
  }

  const suffix =
    urlObj.searchParams?.get('x-wf-file_name')?.split('.')?.pop() ||
    urlObj.pathname.split('.').pop();

  if (!suffixWhiteList.includes(suffix)) {
    return false;
  }

  if (!hostWhiteList.includes(btoa(urlObj.hostname ?? ''))) {
    return false;
  }

  return true;
}

export const parseExpression = (expression?: ValueExpressionDTO) => {
  if (!expression) {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = get(expression, 'value.content') as any;
  if (!content) {
    return null;
  } else if (typeof content === 'string') {
    return {
      value: content,
      isImage: isWorkflowImageTypeURL(content),
    };
  } else if (content.source === 'block-output' && typeof content.name) {
    return {
      value: content.name,
      isImage: false,
    };
  } else if (
    typeof content.source === 'string' &&
    content.source.startsWith('global_variable')
  ) {
    return {
      value: content?.path?.join('.'),
      isImage: false,
    };
  }
};
