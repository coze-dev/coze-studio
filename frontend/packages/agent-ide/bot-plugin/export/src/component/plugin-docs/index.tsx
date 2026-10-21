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
    const DRAFT_CN: Record<string, string> = {
      'zh-CN': '/docs/guides/plugin',
      en: '/docs/en_guides/en_plugin',
    };
    const DRAFT_OVERSEA: Record<string, string> = {
      'zh-CN': '',
      en: '',
    };
    const drafts = IS_OVERSEA ? DRAFT_OVERSEA : DRAFT_CN;
    // Languages without their own docs page (e.g. ru) use the English one
    return drafts[I18n.language] ?? drafts.en;
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
