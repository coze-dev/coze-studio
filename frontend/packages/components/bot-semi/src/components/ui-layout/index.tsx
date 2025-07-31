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

/* eslint-disable @typescript-eslint/naming-convention */

import { Helmet } from 'react-helmet';
import React, { PropsWithChildren, useContext } from 'react';

import classNames from 'classnames';
import { type I18nContext, i18nContext } from '@coze-arch/i18n/i18n-provider';

import UIHeader, { UIHeaderProps } from '../ui-header';
import UIFooter, { UIFooterProps } from '../ui-footer';
import UIContent from '../ui-content';

import s from './index.module.less';

export const UILayout: React.FC<
  PropsWithChildren<{
    className?: string;
    title?: string;
  }>
> & {
  Header: React.FC<UIHeaderProps>;
  Content: typeof UIContent;
  Footer: React.FC<UIFooterProps>;
} = ({ className, children, title }) => {
  const { i18n } = useContext<I18nContext>(i18nContext);
  const _title = title || i18n.t('platform_name');
  return (
    <div className={classNames(s['ui-layout'], className)}>
      <Helmet>
        <title>{_title}</title>
      </Helmet>
      {children}
    </div>
  );
};

UILayout.Header = UIHeader;
UILayout.Content = UIContent;
UILayout.Footer = UIFooter;

export default UILayout;
