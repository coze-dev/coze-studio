import { I18n } from '@coze-arch/i18n';
import { STARTNODE } from '@coze-agent-ide/bot-plugin-tools/pluginModal/config';
import { PluginDocs } from '@coze-agent-ide/bot-plugin-export/pluginDocs';

import s from './index.module.less';

// @ts-expect-error -- linter-disable-autofix
export const SecurityCheckFailed = ({ step }) => (
  <div className={s['error-msg']}>
    {step !== STARTNODE
      ? I18n.t('plugin_parameter_create_modal_safe_error')
      : I18n.t('plugin_tool_create_modal_safe_error')}
    <PluginDocs />
  </div>
);
