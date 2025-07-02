import { primitiveExhaustiveCheck } from '../utils/exhaustive-check';
import { type SyncAction } from '../type';
import { getMarkdownLink } from './get-markdown-link';

export const getSyncInsertText = (action: SyncAction): string => {
  const { type, payload } = action;
  if (type === 'link') {
    const { text, link } = payload;
    return getMarkdownLink({ text, link });
  }
  if (type === 'variable') {
    return payload.variableTemplate;
  }

  /**
   * 不应该走到这里
   */
  primitiveExhaustiveCheck(type);
  return '';
};
