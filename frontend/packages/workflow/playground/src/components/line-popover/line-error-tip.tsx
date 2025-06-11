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
