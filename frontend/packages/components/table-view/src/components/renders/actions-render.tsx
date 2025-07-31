/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
    // edit callback
    onEdit?: (record: TableViewRecord, index: number) => void;
  };
  deleteProps?: {
    disabled: boolean;
    // Delete callback
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
