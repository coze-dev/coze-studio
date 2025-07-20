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
 
import DOMPurify from 'dompurify';
import classNames from 'classnames';

import { type Chunk } from '@/text-knowledge-editor/types/chunk';
import { getRenderHtmlContent } from '@/text-knowledge-editor/services/use-case/get-render-editor-content';
import { getEditorWordsCls } from '@/text-knowledge-editor/services/inner/get-editor-words-cls';
import { getEditorTableClassname } from '@/text-knowledge-editor/services/inner/get-editor-table-cls';
import { getEditorImgClassname } from '@/text-knowledge-editor/services/inner/get-editor-img-cls';

export const DocumentChunkPreview = ({
  chunk,
  locateId,
}: {
  chunk: Chunk;
  locateId: string;
}) => (
  <div
    id={locateId}
    className={classNames(
      // 布局
      'relative',
      // 间距
      'mb-2 p-2',
      // 文字样式
      'text-sm leading-5',
      // 颜色
      'coz-fg-primary hover:coz-mg-hglt-secondary-hovered coz-mg-secondary',
      // 边框
      'border border-solid coz-stroke-primary rounded-lg',
      // 表格样式
      getEditorTableClassname(),
      // 图片样式
      getEditorImgClassname(),
      // 换行
      getEditorWordsCls(),
    )}
  >
    <p
      // 已使用 DOMPurify 过滤 xss
      // eslint-disable-next-line risxss/catch-potential-xss-react
      dangerouslySetInnerHTML={{
        __html:
          DOMPurify.sanitize(getRenderHtmlContent(chunk.content ?? ''), {
            /**
             * 1. 防止CSS注入攻击
             * 2. 防止用户误写入style标签，导致全局样式被修改，页面展示异常
             */
            FORBID_TAGS: ['style'],
          }) ?? '',
      }}
    />
  </div>
);
