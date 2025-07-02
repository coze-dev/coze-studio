import { useShallow } from 'zustand/react/shallow';
import { Divider } from '@coze-arch/bot-semi';
import { DuplicateBot } from '@coze-studio/components';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import {
  type BotHeaderProps,
  DeployButton,
  MoreMenuButton,
  OriginStatus,
} from '@coze-agent-ide/layout';

export type HeaderAddonAfterProps = Omit<
  BotHeaderProps,
  'modeOptionList' | 'deployButton'
>;

export const HeaderAddonAfter: React.FC<HeaderAddonAfterProps> = ({
  isEditLocked,
}) => {
  const isReadonly = useBotDetailIsReadonly();
  const editable = usePageRuntimeStore(state => state.editable);
  const { botId, botInfo } = useBotInfoStore(
    useShallow(state => ({
      botId: state.botId,
      botInfo: state,
    })),
  );
  return (
    <div className="flex items-center gap-2">
      {/** 3.1 状态区 */}
      <div className="flex items-center gap-2">
        {/*  3.1.1 草稿状态 | 协作状态 */}
        {!isReadonly ? <OriginStatus /> : null}
      </div>
      {/** TODO: hzf 隐式关联按钮，后续可以抽离 */}
      {editable ? (
        <Divider layout="vertical" style={{ height: '20px' }} />
      ) : null}
      {/** 3.2 按钮区 */}
      <div className="flex items-center gap-2">
        {!isEditLocked ? (
          <>
            <div className="flex items-center gap-2">
              {/** 功能按钮区域 */}
              <MoreMenuButton />
            </div>
            {/** 提交发布相关按钮 */}
            <div className="flex items-center gap-2">
              {editable ? <DeployButton /> : null}
              {!editable && botInfo && botId ? (
                <DuplicateBot botID={botId} />
              ) : null}
              <div id="diff-task-button-container"></div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
