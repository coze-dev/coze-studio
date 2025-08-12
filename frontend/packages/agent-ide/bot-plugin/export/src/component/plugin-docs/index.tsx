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

import { useMemo } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Typography } from '@coze-arch/coze-design';

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
