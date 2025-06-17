import DOMPurify from 'dompurify';
import classNames from 'classnames';

import { type Chunk } from '@/text-knowledge-editor/types/chunk';
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
          DOMPurify.sanitize(chunk.content ?? '', {
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
