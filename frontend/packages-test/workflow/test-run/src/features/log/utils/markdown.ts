import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { isString } from 'lodash-es';

/**
 * 是否符合渲染为 markdown
 * 1. ast > 1 或
 * 2. ast = 1 且类型不为普通段落
 * 2. ast = 1 且类型为普通段落，但段落中超过两个或者仅有一项但不为 text
 */
export const isPreviewMarkdown = (str: unknown) => {
  if (!isString(str)) {
    return false;
  }

  const tree = unified().use(remarkParse).parse(str);

  if (tree.children.length > 1) {
    return true;
  }
  if (tree.children.length === 1) {
    const [child] = tree.children;
    if (child.type !== 'paragraph') {
      return true;
    } else if (
      child.children.length > 1 ||
      child.children?.[0]?.type !== 'text'
    ) {
      return true;
    }
  }
  return false;
};
