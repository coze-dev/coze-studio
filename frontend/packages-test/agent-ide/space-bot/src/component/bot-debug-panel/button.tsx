import { I18n } from '@coze-arch/i18n';
import { IconCozDebug } from '@coze-arch/coze-design/icons';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { OperateTypeEnum, ToolPane } from '@coze-agent-ide/debug-tool-list';

import { useEvaluationPanelStore } from '@/store/evaluation-panel';

import { useDebugStore } from '../../store/debug-panel';

export const BotDebugToolPane: React.FC = () => {
  const { isDebugPanelShow, setIsDebugPanelShow, setCurrentDebugQueryId } =
    useDebugStore();
  const { setIsEvaluationPanelVisible } = useEvaluationPanelStore();
  return (
    <ToolPane
      visible={true}
      itemKey={'key_debug'}
      title={I18n.t('debug_btn')}
      operateType={OperateTypeEnum.CUSTOM}
      icon={(<IconCozDebug />) as React.ReactNode}
      customShowOperateArea={isDebugPanelShow}
      beforeVisible={async () => {
        await sendTeaEvent(EVENT_NAMES.open_debug_panel, {
          path: 'preview_debug',
        });
        setCurrentDebugQueryId('');
        if (!isDebugPanelShow) {
          setIsEvaluationPanelVisible(false);
        }
        setIsDebugPanelShow(!isDebugPanelShow);
      }}
    />
  );
};
