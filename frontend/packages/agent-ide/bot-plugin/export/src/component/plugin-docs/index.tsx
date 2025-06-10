import { useMemo } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Typography } from '@coze/coze-design';

export const PluginDocs = () => {
  const docsHref = useMemo(() => {
    const DRAFT_CN = {
      'zh-CN': '/docs/guides/plugin',
      en: '/docs/en_guides/en_plugin',
    };
    const DRAFT_OVERSEA = {
      'zh-CN': '',
      en: '',
    };
    // @ts-expect-error -- linter-disable-autofix
    return IS_OVERSEA ? DRAFT_OVERSEA[I18n.language] : DRAFT_CN[I18n.language];
  }, []);

  return !IS_OVERSEA ? (
    <Typography.Text
      link={{
        href: docsHref,
        target: '_blank',
      }}
      fontSize="12px"
    >
      {I18n.t('plugin_create_guide_link')}
    </Typography.Text>
  ) : null;
};
