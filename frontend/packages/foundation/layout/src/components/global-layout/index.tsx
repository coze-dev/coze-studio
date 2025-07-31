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

import { useLocation } from 'react-router-dom';
import { type FC, type PropsWithChildren, useState, useEffect } from 'react';

import cls from 'classnames';
import { Layout, SideSheet } from '@coze-arch/coze-design';

import { type LayoutProps } from './types';
import { useLayoutResponsive } from './hooks';
import { GlobalLayoutProvider } from './context';
import { GlobalLayoutSider } from './component/sider';

import sideSheetStyle from './side-sheet.module.less';

export const GlobalLayout: FC<PropsWithChildren<LayoutProps>> = ({
  hasSider,
  children,
  banner,
  ...props
}) => {
  const [sideSheetVisible, setSideSheetVisible] = useState(false);
  const { isResponsive, mobileTipsModal } = useLayoutResponsive();
  const location = useLocation();
  useEffect(() => {
    setSideSheetVisible(false);
  }, [location.pathname, location.search, isResponsive]);
  const siderContent = isResponsive ? (
    <SideSheet
      placement="left"
      visible={sideSheetVisible}
      className={sideSheetStyle['side-sheet']}
      closeOnEsc
      onCancel={() => {
        setSideSheetVisible(false);
      }}
    >
      <GlobalLayoutSider {...props} key="GlobalLayoutSider" />
    </SideSheet>
  ) : (
    <GlobalLayoutSider {...props} key="GlobalLayoutSider" />
  );

  return (
    <GlobalLayoutProvider
      value={{
        sideSheetVisible,
        setSideSheetVisible,
      }}
    >
      {banner}
      <Layout
        className={cls(
          'flex !flex-row items-stretch w-full coz-bg-plus',
          banner ? 'h-[calc(100%_-_30px)]' : 'h-full',
        )}
      >
        {hasSider ? siderContent : null}
        <Layout className="flex-1 relative flex flex-col overflow-x-hidden coz-bg-plus">
          {children}
        </Layout>
        {mobileTipsModal}
      </Layout>
    </GlobalLayoutProvider>
  );
};
