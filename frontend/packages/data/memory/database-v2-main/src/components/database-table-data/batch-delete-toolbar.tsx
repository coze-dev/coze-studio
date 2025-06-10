import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozCross, IconCozTrashCan } from '@coze/coze-design/icons';
import { Button, Divider, IconButton, Typography } from '@coze/coze-design';

export interface BatchDeleteToolbarProps {
  selectedCount?: number;
  onDelete: () => void;
  onCancel: () => void;
}

export function BatchDeleteToolbar({
  selectedCount = 0,
  onDelete,
  onCancel,
}: BatchDeleteToolbarProps) {
  return (
    <div
      className={classNames(
        'flex items-center p-[8px] gap-[8px] rounded-[12px]',
        'coz-bg-max border-solid coz-stroke-primary coz-shadow-default',
        'fixed bottom-[8px] left-[50%] translate-x-[-50%] z-10',
        { hidden: selectedCount <= 0 },
      )}
    >
      <Typography.Text type="secondary">
        {I18n.t('db_optimize_031', { n: selectedCount })}
      </Typography.Text>
      <Divider layout="vertical" />
      <Button color="red" icon={<IconCozTrashCan />} onClick={onDelete}>
        {I18n.t('db_optimize_030')}
      </Button>
      <Divider layout="vertical" />
      <IconButton
        color="secondary"
        icon={<IconCozCross />}
        onClick={onCancel}
      />
    </div>
  );
}
