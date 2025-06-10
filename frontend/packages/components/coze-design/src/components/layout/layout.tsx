import { Helmet } from 'react-helmet';
import React, { type PropsWithChildren } from 'react';

import { cn } from '@/utils';
import { useCDLocale } from '@/locales';

import type { LayoutProps } from './layout-types';
import { LayoutHeader } from './layout-header';
import { LayoutFooter } from './layout-footer';
import { LayoutContent } from './layout-content';

import './index.css';

const LayoutComp: React.FC<PropsWithChildren<LayoutProps>> = ({
  className,
  children,
  title,
  keepDocTitle,
  ...rest
}) => {
  const { i18n } = useCDLocale();
  const _title = title || i18n?.t('platform_name');
  return (
    <div className={cn('coz-layout', className)} {...rest}>
      {keepDocTitle ? null : (
        <Helmet>
          <title>{_title}</title>
        </Helmet>
      )}
      {children}
    </div>
  );
};

export const Layout = Object.assign(LayoutComp, {
  Header: LayoutHeader,
  Content: LayoutContent,
  Footer: LayoutFooter,
});
