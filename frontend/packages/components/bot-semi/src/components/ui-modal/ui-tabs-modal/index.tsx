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

import { ReactNode } from 'react';

import classNames from 'classnames';
import type { TabPaneProps, TabsProps } from '@douyinfe/semi-ui/lib/es/tabs';
import { Tabs, TabPane } from '@douyinfe/semi-ui';
import { IconClose } from '@douyinfe/semi-icons';

import { SemiModalProps, UIModal } from '../ui-modal';
import { UIIconButton } from '../../ui-icon-button';

import s from './index.module.less';

export type UITabsModalProps = {
  tabs: {
    tabsProps?: TabsProps;
    tabPanes: {
      tabPaneProps: TabPaneProps;
      content: ReactNode;
    }[];
  };
} & Omit<SemiModalProps, 'header' | 'footer' | 'content' | 'title'>;

export const UITabsModal = ({
  tabs: { tabsProps, tabPanes },
  ...props
}: UITabsModalProps) => (
  <UIModal
    {...props}
    type="base-composition"
    header={null}
    footer={null}
    className={classNames(s['ui-tabs-modal'], props.className)}
  >
    <>
      <UIIconButton
        wrapperClass={s['close-btn']}
        type="tertiary"
        icon={<IconClose />}
        onClick={props.onCancel}
      />
      <Tabs
        {...tabsProps}
        contentStyle={{
          flex: 1,
          padding: 0,
          overflowY: 'hidden',
        }}
        className={classNames(s.tabs, tabsProps?.className)}
      >
        {tabPanes.map(({ tabPaneProps, content }, index) => (
          <TabPane
            key={tabPaneProps.itemKey ?? index}
            {...tabPaneProps}
            className={classNames(s['tab-pane'], tabPaneProps.className)}
          >
            {content}
          </TabPane>
        ))}
      </Tabs>
    </>
  </UIModal>
);
