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
