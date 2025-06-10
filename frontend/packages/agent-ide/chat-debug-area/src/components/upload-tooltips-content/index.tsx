import classnames from 'classnames';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import { OpenModalEvent, emitEvent } from '@coze-arch/bot-utils';
import { BotMode } from '@coze-arch/bot-api/playground_api';

import s from './index.module.less';

export const UploadTooltipsContent = () => {
  const isReadonly = useBotDetailIsReadonly();

  const mode = useBotInfoStore(state => state.mode);
  const isMulti = mode === BotMode.MultiMode;
  const isWorkflow = mode === BotMode.WorkflowMode;

  const botPreviewAttachI18nKey = 'bot_preview_attach_0319';

  const addApi = () => {
    if (isReadonly) {
      return;
    }
    // TODO：图片处理tag上线后修改为对应type
    emitEvent(OpenModalEvent.PLUGIN_API_MODAL_OPEN, { type: 1 });
  };

  return (
    <div className={s['more-btn-tooltip']} onClick={e => e.stopPropagation()}>
      {I18n.t(botPreviewAttachI18nKey, {
        placeholder:
          isMulti || isWorkflow ? (
            I18n.t('bot_preview_attach_select')
          ) : (
            <span className={classnames(s['tool-text'])} onClick={addApi}>
              {I18n.t('bot_preview_attach_select')}
            </span>
          ),
      })}
    </div>
  );
};
