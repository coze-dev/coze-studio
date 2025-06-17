import classNames from 'classnames';
import { IconCozEdit, IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';

import { type TableViewRecord } from '../types';

import styles from './index.module.less';
export interface ActionsRenderProps {
  record: TableViewRecord;
  index: number;
  editProps?: {
    disabled: boolean;
    // 编辑回调
    onEdit?: (record: TableViewRecord, index: number) => void;
  };
  deleteProps?: {
    disabled: boolean;
    // 删除回调
    onDelete?: (index: number) => void;
  };
  className?: string;
}
export const ActionsRender = ({
  record,
  index,
  editProps = { disabled: false },
  deleteProps = { disabled: false },
}: ActionsRenderProps) => {
  const { disabled: editDisabled, onEdit } = editProps;
  const { disabled: deleteDisabled, onDelete } = deleteProps;

  return (
    <div className={classNames(styles['actions-render'], 'table-view-actions')}>
      {!editDisabled && (
        <Button
          size="mini"
          color="secondary"
          icon={<IconCozEdit className="text-[14px]" />}
          className={styles['action-edit']}
          onClick={() => onEdit && onEdit(record, index)}
        ></Button>
      )}
      {!deleteDisabled && (
        <Button
          size="mini"
          color="secondary"
          icon={<IconCozTrashCan className="text-[14px]" />}
          className={styles['action-delete']}
          onClick={() => onDelete && onDelete(index)}
        ></Button>
      )}
    </div>
  );
};
