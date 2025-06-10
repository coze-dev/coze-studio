/* eslint-disable @typescript-eslint/no-namespace -- namespace is necessary */
import type { CommentEditorBlock } from '../type';
import {
  type CommentEditorBlockFormat,
  CommentEditorDefaultBlocks,
  CommentEditorLeafType,
} from '../constant';

export namespace CommentEditorJSONParser {
  // 处理单个节点
  const processNode = (node: CommentEditorBlock): CommentEditorBlock => {
    if ('text' in node && !node.type) {
      return {
        ...node,
        type: CommentEditorLeafType as unknown as CommentEditorBlockFormat,
      };
    }

    if ('type' in node && 'children' in node) {
      return {
        ...node,
        children: (node.children as CommentEditorBlock[]).map(processNode),
      };
    }

    return node as CommentEditorBlock;
  };

  // 主函数：处理整个 schema
  const addLeafType = (schema: CommentEditorBlock[]): CommentEditorBlock[] =>
    schema.map(processNode);

  /** JSON 转换为 Schema */
  export const from = (value?: string): CommentEditorBlock[] | undefined => {
    if (!value || value === '') {
      return CommentEditorDefaultBlocks as CommentEditorBlock[];
    }
    try {
      const blocks = JSON.parse(value);
      return blocks;
      // eslint-disable-next-line @coze-arch/use-error-in-catch -- no need to handle error
    } catch (error) {
      return;
    }
  };

  /** schema 转换为 JSON */
  export const to = (schema: CommentEditorBlock[]): string | undefined => {
    try {
      const value = JSON.stringify(addLeafType(schema));
      return value;
      // eslint-disable-next-line @coze-arch/use-error-in-catch -- no need to handle error
    } catch (error) {
      return;
    }
  };
}
