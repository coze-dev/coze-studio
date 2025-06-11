import { I18n } from '@coze-arch/i18n';
import { type EditorProps } from '@coze-workflow/code-editor-adapter';

export const getIDERegionParams = () => ({
  region: IS_BOE
    ? ('boe' as EditorProps['region'])
    : (REGION as EditorProps['region']),
  locale: (I18n.language === 'en' ? 'en' : 'zh') as EditorProps['locale'],
});
