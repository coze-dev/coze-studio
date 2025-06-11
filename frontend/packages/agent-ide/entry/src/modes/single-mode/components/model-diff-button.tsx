import { useShallow } from 'zustand/react/shallow';
import { useDiffTaskStore } from '@coze-studio/bot-detail-store/diff-task';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { I18n } from '@coze-arch/i18n';
import { IconCozCompare } from '@coze/coze-design/icons';
import { Button } from '@coze/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
export const ModelDiffButton = (props: { readonly?: boolean }) => {
  const { readonly } = props;
  const { enterDiffMode } = useDiffTaskStore(
    useShallow(state => ({
      enterDiffMode: state.enterDiffMode,
    })),
  );
  const { botId } = useBotInfoStore(
    useShallow(state => ({
      botId: state.botId,
    })),
  );
  return (
    <Button
      icon={<IconCozCompare />}
      color="highlight"
      disabled={readonly}
      onClick={() => {
        sendTeaEvent(EVENT_NAMES.compare_mode_front, {
          bot_id: botId,
          compare_type: 'models',
          from: 'compare_button',
          source: 'bot_detail_page',
          action: 'start',
        });
        enterDiffMode({ diffTask: 'model' });
      }}
    >
      {I18n.t('compare_model_compare_model')}
    </Button>
  );
};
