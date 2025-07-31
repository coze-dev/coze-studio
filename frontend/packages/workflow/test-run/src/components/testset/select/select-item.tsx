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

import React, { forwardRef, useCallback, type ReactNode } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozEdit,
  IconCozTrashCan,
  IconCozWarningCircle,
} from '@coze-arch/coze-design/icons';
import { Typography, IconButton, Tooltip } from '@coze-arch/coze-design';
import { type CaseDataDetail } from '@coze-arch/bot-api/debugger_api';

import styles from './select-item.module.less';

interface BaseSelectItemProps {
  name: string;
  description?: string;
  incompatible?: boolean;
  disabled?: boolean;
  className?: string;
  onEdit: () => void;
  onDelete: () => void;
  forbiddenOperation?: boolean;
  nameExtra?: ReactNode;
}

const BaseSelectItem = forwardRef<HTMLDivElement, BaseSelectItemProps>(
  (
    {
      name,
      incompatible,
      disabled,
      className,
      onEdit,
      onDelete,
      description,
      forbiddenOperation,
      nameExtra,
      ...props
    },
    ref,
  ) => {
    const handleEdit = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit();
      },
      [onEdit],
    );
    const handleDelete = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete();
      },
      [onDelete],
    );

    return (
      <div
        className={cls(styles['base-item'], className, 'test-set-base-item')}
        {...props}
        ref={ref}
      >
        {incompatible ? (
          <IconCozWarningCircle className="coz-fg-hglt-yellow" />
        ) : null}
        <div className={styles['item-text-wrapper']}>
          <div className={cls(styles['item-text'], 'flex items-center')}>
            <Typography.Text
              ellipsis={{ showTooltip: incompatible ? false : true }}
            >
              {name}
            </Typography.Text>

            {nameExtra}
          </div>
          <div className={styles['item-text']}>
            {description ? (
              <Typography.Text
                size={'small'}
                style={{
                  color: 'rgba(6, 7, 9, 0.5)',
                }}
                ellipsis={{ showTooltip: incompatible ? false : true }}
              >
                {description}
              </Typography.Text>
            ) : null}
          </div>
        </div>
        {!disabled && !forbiddenOperation && (
          <div className={styles['item-operator']}>
            <IconButton
              size="mini"
              icon={<IconCozEdit />}
              color="secondary"
              onClick={handleEdit}
            />
            <IconButton
              size="mini"
              icon={<IconCozTrashCan />}
              color="secondary"
              onClick={handleDelete}
            />
          </div>
        )}
      </div>
    );
  },
);

interface NormalSelectItemProps {
  data: CaseDataDetail;
  disabled?: boolean;
  onEdit: (v: CaseDataDetail) => void;
  onDelete: (v: CaseDataDetail) => void;
  forbiddenOperation?: boolean;
  nameExtra?: ReactNode;
}

export const NormalSelectItem: React.FC<NormalSelectItemProps> = ({
  data,
  onEdit,
  onDelete,
  ...props
}) => {
  const incompatible = data.schemaIncompatible;
  const testsetName = data.caseBase?.name ?? '-';

  const handleEdit = useCallback(() => {
    onEdit(data);
  }, [data, onEdit]);
  const handleDelete = useCallback(() => {
    onDelete(data);
  }, [data, onDelete]);

  return incompatible ? (
    <Tooltip
      position="left"
      spacing={48}
      content={I18n.t('workflow_testset_invalid_tip', { testsetName })}
    >
      <BaseSelectItem
        name={testsetName}
        description={data.caseBase?.description}
        incompatible={incompatible}
        onEdit={handleEdit}
        onDelete={handleDelete}
        {...props}
      />
    </Tooltip>
  ) : (
    <BaseSelectItem
      name={testsetName}
      description={data.caseBase?.description}
      incompatible={incompatible}
      {...props}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
};
