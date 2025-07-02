import { type Text, type Link, type Parent, type Image } from 'mdast';
import { isObject, isUndefined } from 'lodash-es';
/**
 * 将markdown转为纯文本
 * @param markdown Markdown文本
 * @returns string 纯文本
 */
export const getTextFromAst = (ast: unknown): string => {
  if (isParent(ast)) {
    return `${ast.children.map(child => getTextFromAst(child)).join('')}`;
  }

  if (isText(ast)) {
    return ast.value;
  }

  if (isLink(ast)) {
    return `[${getTextFromAst(ast.children)}](${ast.url})`;
  }

  if (isImage(ast)) {
    return `![${ast.alt}](${ast.url})`;
  }

  return '';
};

const isParent = (ast: unknown): ast is Parent =>
  !!ast && isObject(ast) && 'children' in ast && !isUndefined(ast?.children);

const isLink = (ast: unknown): ast is Link =>
  isObject(ast) && 'type' in ast && !isUndefined(ast) && ast.type === 'link';

const isImage = (ast: unknown): ast is Image =>
  !isUndefined(ast) && isObject(ast) && 'type' in ast && ast.type === 'image';

const isText = (ast: unknown): ast is Text =>
  !isUndefined(ast) && isObject(ast) && 'type' in ast && ast.type === 'text';

export const parseMarkdownHelper = {
  isParent,
  isLink,
  isImage,
  isText,
};
