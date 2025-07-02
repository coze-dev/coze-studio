import { type FC, type ReactNode } from 'react';

import {
  useToolItemContext,
  ToolItemIconInfo,
  ToolItemActionDelete,
} from '@coze-agent-ide/tool';
import { ParametersPopover } from '@coze-studio/components/parameters-popover';
import { type WorkFlowItemType } from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';

interface ActionsProps {
  index: number;
  item: WorkFlowItemType | undefined;
  removeWorkFlow: (index: number) => void;
  isReadonly?: boolean;
  slot?: ReactNode;
}

const Actions: FC<ActionsProps> = ({
  item,
  removeWorkFlow,
  index,
  isReadonly,
  slot,
}) => {
  const { setIsForceShowAction } = useToolItemContext();
  const handleVisibleChange = (visible: boolean) => {
    setIsForceShowAction(visible);
  };

  return (
    <>
      <ParametersPopover
        position="bottom"
        pluginApi={{
          name: item?.name,
          desc: item?.desc,
          parameters: item?.parameters,
        }}
        onVisibleChange={handleVisibleChange}
      >
        <ToolItemIconInfo />
      </ParametersPopover>
      {slot}

      {!isReadonly ? (
        <ToolItemActionDelete
          tooltips={I18n.t('bot_edit_remove_workflow')}
          onClick={() => {
            removeWorkFlow(index);
          }}
          data-testid={'bot.editor.tool.workflow.delete-button'}
        />
      ) : null}
    </>
  );
};

export { Actions };
