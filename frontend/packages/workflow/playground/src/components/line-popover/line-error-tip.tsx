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

import React from 'react';

import { Typography } from '@coze-arch/bot-semi';
import { I18n } from '@coze-arch/i18n';

const { Title } = Typography;

import { IconLineErrorCaseI18n, IconLineErrorCaseCn } from './svg';

export const LineErrorTip = () => {
  const lang = I18n.getLanguages();
  const currentLang = lang[0];

  const renderIcon = () => {
    if (currentLang === 'zh-CN' || currentLang === 'zh') {
      return <IconLineErrorCaseCn />;
    }
    return <IconLineErrorCaseI18n />;
  };

  return (
    <div className="w-[420px]">
      <Title heading={6}>{I18n.t('workflow_running_results_line_error')}</Title>
      <div className="flex mt-2">{renderIcon()}</div>
    </div>
  );
};
