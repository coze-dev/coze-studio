import { BotPageFromEnum } from '@coze-arch/bot-typings/common';
import { SkillsPane } from '@coze-agent-ide/skills-pane-adapter';
import { MemoryToolPane } from '@coze-agent-ide/memory-tool-pane-adapter';
import { DebugToolList } from '@coze-agent-ide/debug-tool-list';

export interface SingleModeToolPaneListProps {
  pageFrom: BotPageFromEnum | undefined;
  showBackground: boolean;
}

export const SingleModeToolPaneList: React.FC<SingleModeToolPaneListProps> = ({
  pageFrom,
  showBackground,
}) => {
  if (pageFrom === BotPageFromEnum.Store) {
    return (
      <DebugToolList showBackground={showBackground}>
        <MemoryToolPane />
      </DebugToolList>
    );
  }
  return (
    <DebugToolList showBackground={showBackground}>
      {/* 任务-调试入口 */}
      <SkillsPane />

      {/* memory查看数据入口 */}
      <MemoryToolPane />
    </DebugToolList>
  );
};
