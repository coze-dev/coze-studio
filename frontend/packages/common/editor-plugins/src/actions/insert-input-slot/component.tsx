import cls from 'classnames';
import { useEditor } from '@flow-lang-sdk/editor/react';
import { type EditorAPI } from '@flow-lang-sdk/editor/preset-prompt';
import { I18n } from '@coze-arch/i18n';
import { IconCozInputSlot } from '@coze/coze-design/icons';
import { IconButton, Tooltip } from '@coze/coze-design';
import { type ButtonProps } from '@coze/coze-design';

import { insertInputSlot } from '../../input-slot/action/insert-input-slot-action';
import {
  useSelectionInInputSlot,
  useSelectionInJinjaRaw,
} from '../../input-slot';
import { useActionBarPreference } from '../../action-bar/hooks/use-action-bar-perference';

type InsertInputSlotProps = Pick<ButtonProps, 'className'>;

export const InsertInputSlotAction: React.FC<InsertInputSlotProps> = props => {
  const editor = useEditor<EditorAPI>();
  const { className } = props;
  const { controller, size } = useActionBarPreference();
  const inInputSlot = useSelectionInInputSlot();
  const inJinjaRaw = useSelectionInJinjaRaw();

  if (inInputSlot || inJinjaRaw) {
    return null;
  }

  return (
    <div
      className={cls(
        'hover:coz-mg-secondary-hovered coz-icon-button rounded-little',
      )}
    >
      <Tooltip
        content={I18n.t('edit_block_set_as_edit_block')}
        position="bottom"
      >
        <IconButton
          color="primary"
          icon={<IconCozInputSlot />}
          className={cls('!bg-transparent', className)}
          size={size}
          onMouseDown={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            controller?.hideActionBar();
            if (!editor) {
              return;
            }
            insertInputSlot(editor);
          }}
        />
      </Tooltip>
    </div>
  );
};
