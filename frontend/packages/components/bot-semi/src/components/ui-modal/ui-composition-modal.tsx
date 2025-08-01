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
import { PropsWithChildren, ReactNode } from 'react';

import classNames from 'classnames';
import { Divider } from '@douyinfe/semi-ui';
import { IconClose } from '@douyinfe/semi-icons';

import { UIIconButton } from '../../components/ui-icon-button';
import { SemiModalProps, UIModal } from './ui-modal';

import s from './index.module.less';

export interface UICompositionModalProps
  extends Omit<SemiModalProps, 'header' | 'footer' | 'content' | 'title'> {
  sider?: ReactNode;
  siderWrapperClassName?: string;
  content?: ReactNode;
  header?: ReactNode;
  extra?: ReactNode;
  filter?: ReactNode;
}

interface StyleProps {
  style?: React.CSSProperties;
  className?: string;
}

const AsideHeader: React.FC<PropsWithChildren<StyleProps>> = ({
  children,
  className,
  style,
}) => (
  <div className={classNames(className, s['aside-header'])} style={style}>
    {children}
  </div>
);

const AsideDivider: React.FC<StyleProps> = ({ className, style }) => (
  <Divider
    margin={12}
    className={classNames(className, s['aside-divider'])}
    style={style}
  />
);

const AsideContent: React.FC<PropsWithChildren<StyleProps>> = ({
  children,
  className,
  style,
}) => (
  <div className={className} style={style}>
    {children}
  </div>
);

export const UICompositionModalSider: React.FC<
  PropsWithChildren<StyleProps>
> & {
  Header: React.FC<PropsWithChildren<StyleProps>>;
  Divider: React.FC<PropsWithChildren<StyleProps>>;
  Content: React.FC<PropsWithChildren<StyleProps>>;
} = ({ children, style, className }) => (
  <div style={style} className={classNames(className, s['aside-main'])}>
    {children}
  </div>
);

UICompositionModalSider.Header = AsideHeader;
UICompositionModalSider.Divider = AsideDivider;
UICompositionModalSider.Content = AsideContent;

const MainHeader: React.FC<PropsWithChildren<StyleProps>> = ({
  children,
  className,
  style,
}) => (
  <div className={classNames(['main-header'], className)} style={style}>
    {children}
  </div>
);

const MainContent: React.FC<PropsWithChildren<StyleProps>> = ({
  children,
  className,
  style,
}) => (
  <div className={classNames(className, s['main-content'])} style={style}>
    {children}
  </div>
);

export const UICompositionModalMain: React.FC<PropsWithChildren<StyleProps>> & {
  Header: React.FC<PropsWithChildren<StyleProps>>;
  Content: React.FC<PropsWithChildren<StyleProps>>;
} = ({ children, style, className }) => (
  <div style={style} className={classNames(className, s.main)}>
    {children}
  </div>
);

UICompositionModalMain.Header = MainHeader;
UICompositionModalMain.Content = MainContent;

export const UICompositionModal = ({
  sider,
  content,
  header,
  filter,
  extra,
  ...props
}: UICompositionModalProps) => (
  <UIModal
    {...props}
    type="base-composition"
    header={null}
    footer={null}
    className={classNames(s['ui-composition-modal'], props.className)}
  >
    <div className={s['composition-modal-layout']}>
      <div className={classNames(s.aside, props.siderWrapperClassName)}>
        <div className={s.title}>{header}</div>
        {sider}
      </div>
      <div className={s.content}>
        <div
          className={classNames({
            [s.header]: true,
            [s['filter-empty']]: !filter,
          })}
        >
          {filter}
          {extra}
          <UIIconButton
            data-testid="close-icon-button"
            type="tertiary"
            icon={<IconClose />}
            onClick={props.onCancel}
          />
        </div>
        {content}
      </div>
    </div>
  </UIModal>
);
