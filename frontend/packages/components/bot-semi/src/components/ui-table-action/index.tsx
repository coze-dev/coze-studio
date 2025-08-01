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

import { FC, useCallback, useContext } from 'react';

import { i18nContext, type I18nContext } from '@coze-arch/i18n/i18n-provider';
import {
  IconEdit,
  IconCopy,
  IconDeleteOutline,
  IconWaringRed,
} from '@coze-arch/bot-icons';
import { TooltipProps } from '@douyinfe/semi-ui/lib/es/tooltip';
import { PopconfirmProps } from '@douyinfe/semi-ui/lib/es/popconfirm';
import { Tooltip, Popconfirm } from '@douyinfe/semi-ui';

import { UIIconButton } from '../ui-icon-button';

import styles from './index.module.less';

export interface ActionItemProps {
  disabled?: boolean;
  handler?: (() => void) | (() => Promise<void>);
  handleClick?: () => void;
  hide?: boolean;
  popconfirm?: PopconfirmProps;
  tooltip?: TooltipProps;
}

export interface UITableActionProps {
  editProps?: ActionItemProps;
  copyProps?: ActionItemProps;
  deleteProps: ActionItemProps;
}
export const UITableAction: FC<UITableActionProps> = props => {
  const { i18n } = useContext<I18nContext>(i18nContext);
  const { editProps, deleteProps, copyProps } = props;
  const handle = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
  };

  const iconColor = useCallback(
    (type: string) => {
      const targetProps = props[`${type}Props` as keyof UITableActionProps];
      return {
        color: targetProps?.disabled
          ? 'rgba(136, 138, 142, 0.5)'
          : 'rgba(136, 138, 142, 1)',
      };
    },
    [editProps, deleteProps, copyProps],
  );

  return (
    <div className={styles['ui-action-content']} onClick={handle}>
      {copyProps && !copyProps.hide ? (
        <Tooltip
          spacing={12}
          content={i18n.t('Copy')}
          position="top"
          {...copyProps?.tooltip}
        >
          <span className={styles['action-btn']}>
            <UIIconButton
              disabled={copyProps?.disabled}
              icon={<IconCopy className={styles.icon} />}
              onClick={copyProps?.handler}
              style={iconColor('copy')}
              data-testid="ui.table-action.copy"
            />
          </span>
        </Tooltip>
      ) : null}
      {editProps && !editProps.hide ? (
        <Tooltip
          spacing={12}
          content={i18n.t('Edit')}
          position="top"
          {...editProps?.tooltip}
        >
          <span className={styles['action-btn']}>
            <UIIconButton
              disabled={editProps?.disabled}
              icon={<IconEdit className={styles.icon} />}
              onClick={editProps?.handler}
              style={iconColor('edit')}
              data-testid="ui.table-action.edit"
            />
          </span>
        </Tooltip>
      ) : null}
      {!deleteProps.hide && (
        <div>
          <Popconfirm
            trigger="click"
            okType="danger"
            title={i18n.t('delete_title')}
            content={i18n.t('delete_desc')}
            okText={i18n.t('confirm')}
            cancelText={i18n.t('cancel')}
            style={{ width: 350 }}
            icon={deleteProps?.popconfirm?.icon ?? <IconWaringRed />}
            {...deleteProps.popconfirm}
            onConfirm={deleteProps?.handler}
            disabled={deleteProps.disabled}
          >
            <span>
              <Tooltip
                spacing={12}
                content={i18n.t('Delete')}
                position="top"
                {...deleteProps.tooltip}
              >
                <UIIconButton
                  disabled={deleteProps.disabled}
                  icon={<IconDeleteOutline className={styles.icon} />}
                  style={iconColor('delete')}
                  onClick={deleteProps.handleClick}
                  data-testid="ui.table-action.delete"
                />
              </Tooltip>
            </span>
          </Popconfirm>
        </div>
      )}
    </div>
  );
};
