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

import { type CSSProperties, useEffect } from 'react';

import classNames from 'classnames';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import {
  Menu,
  Divider,
  Button,
  ButtonGroup,
  Space,
} from '@coze-arch/coze-design';
import { IconClose } from '@douyinfe/semi-icons';

import { type EditMenuItem, type TableViewRecord } from '../types';
import { getRowOpConfig } from './utils';

import styles from './index.module.less';

export interface EditMenuProps {
  configs: EditMenuItem[];
  visible: boolean;
  style: CSSProperties;
  selected: {
    record?: TableViewRecord;
    indexs?: (string | number)[];
  };
  onExit?: () => void | Promise<void>;
  onDelete?: (indexs: (string | number)[]) => void | Promise<void>;
  // Line operations edit line callbacks
  onEdit?: (
    record: TableViewRecord,
    index: string | number,
  ) => void | Promise<void>;
}

export const EditMenu = ({
  configs,
  visible,
  style,
  selected,
  onExit,
  onEdit,
  onDelete,
}: EditMenuProps) => {
  const menuConfigs = getRowOpConfig({
    selected,
    onEdit,
    onDelete,
  });

  useEffect(() => {
    const fn = (_e: Event) => {
      if (onExit) {
        onExit();
      }
    };
    window.addEventListener('click', fn);
    return () => window.removeEventListener('click', fn);
  }, []);

  if (visible && configs && configs.length) {
    return (
      <div
        style={style}
        className={classNames(
          styles['table-edit-menu'],
          'context-menu-disabled',
        )}
      >
        <Menu.SubMenu mode="menu">
          {configs.map(config => {
            const { text, onClick, icon } = menuConfigs[config];
            return (
              <Menu.Item
                onClick={() => {
                  onClick();
                }}
                icon={icon}
              >
                {I18n.t(text as I18nKeysNoOptionsType)}
              </Menu.Item>
            );
          })}
        </Menu.SubMenu>
      </div>
    );
  }
  return <div className="context-menu-disabled"></div>;
};

export const EditToolBar = ({
  configs,
  visible,
  selected,
  onExit,
  onEdit,
  onDelete,
}: EditMenuProps) => {
  const menuConfigs = getRowOpConfig({
    selected,
    onEdit,
    onDelete,
  });
  const { indexs } = selected;
  return (
    <>
      {visible ? (
        <div
          className={styles['table-edit-toolbar']}
          style={{
            marginLeft: `${
              (selected?.indexs || []).length > 1 ? '-145px' : '-203.5px'
            }`,
          }}
        >
          <ButtonGroup className={styles['button-group']}>
            {selected ? (
              <div className={styles['selected-count']}>
                {I18n.t('table_view_002', {
                  n: indexs?.length,
                })}
              </div>
            ) : null}
            <Divider layout="vertical" margin={'8px'} />
            {configs.length > 0 ? (
              <Space spacing={8}>
                {configs.map(config => {
                  const { text, onClick } = menuConfigs[config];
                  return (
                    <Button onClick={onClick} color="primary">
                      {I18n.t(text as I18nKeysNoOptionsType)}
                    </Button>
                  );
                })}
              </Space>
            ) : null}

            <Divider layout="vertical" margin={'8px'} />

            <Button
              icon={<IconClose />}
              onClick={onExit}
              color="secondary"
            ></Button>
          </ButtonGroup>
        </div>
      ) : null}
    </>
  );
};
