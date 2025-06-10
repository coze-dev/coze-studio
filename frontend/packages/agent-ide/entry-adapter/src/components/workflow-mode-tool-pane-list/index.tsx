import { BotDebugToolPane } from '@coze-agent-ide/space-bot/component';
import { BotPageFromEnum } from '@coze-arch/bot-typings/common';
import { MemoryToolPane } from '@coze-agent-ide/memory-tool-pane-adapter';
import { DebugToolList } from '@coze-agent-ide/debug-tool-list';

export interface WorkflowModeToolPaneListProps {
  pageFrom: BotPageFromEnum | undefined;
  showBackground: boolean;
}

export const WorkflowModeToolPaneList: React.FC<
  WorkflowModeToolPaneListProps
> = ({ pageFrom, showBackground }) => {
  if (pageFrom === BotPageFromEnum.Store) {
    return (
      <DebugToolList showBackground={showBackground}>
        <MemoryToolPane />
      </DebugToolList>
    );
  }
  return (
    <DebugToolList showBackground={showBackground}>
      {/* memory查看数据入口 */}
      <MemoryToolPane />

      {/* Bot调试台-调试入口 */}
      <BotDebugToolPane />
    </DebugToolList>
  );
};
