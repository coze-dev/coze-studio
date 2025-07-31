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
      // layout
      'relative',
      // spacing
      'mb-2 p-2',
      // Text Style
      'text-sm leading-5',
      // color
      'coz-fg-primary hover:coz-mg-hglt-secondary-hovered coz-mg-secondary',
      // border
      'border border-solid coz-stroke-primary rounded-lg',
      // table style
      getEditorTableClassname(),
      // image style
      getEditorImgClassname(),
      // line feed
      getEditorWordsCls(),
    )}
  >
    <p
      // Filtered xss with DOMPurify
      // eslint-disable-next-line risxss/catch-potential-xss-react
      dangerouslySetInnerHTML={{
        __html:
          DOMPurify.sanitize(getRenderHtmlContent(chunk.content ?? ''), {
            /**
             * 1. Prevent CSS injection attacks
             * 2. Prevent users from writing the style tag by mistake, resulting in the global style being modified and the page display being abnormal
             */
            FORBID_TAGS: ['style'],
          }) ?? '',
      }}
    />
  </div>
);
