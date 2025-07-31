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

import { type ReactNode } from 'react';

export interface RenderButtonProps {
  onClick?: () => void;
  icon: ReactNode;
  dataTestId?: string;
}
export interface LayoutButtonItem {
  icon: ReactNode;
  tooltip: string;
  portal?: ReactNode;
  onClick?: () => void;
  dataTestId?: string;
  className?: string;
  iconClass?: string;
  renderButton?: (props: RenderButtonProps) => ReactNode;
}

export interface LayoutMenuItem {
  title: string;
  icon: ReactNode;
  activeIcon: ReactNode;
  path: string | string[];
  dataTestId?: string;
}

export type LayoutAccountMenuItem =
  | {
      prefixIcon?: ReactNode;
      title: string;
      extra?: ReactNode;
      onClick: () => void;
      dataTestId?: string;
    }
  | ReactNode;

export interface LayoutOverrides {
  feedbackUrl?: string;
}

export interface LayoutProps {
  hasSider: boolean;
  actions?: LayoutButtonItem[];
  menus?: LayoutMenuItem[];
  extras?: LayoutButtonItem[];
  onClickLogo?: () => void;
  banner?: ReactNode;
  footer?: ReactNode;
}

export interface GlobalLayoutContext {
  sideSheetVisible: boolean;
  setSideSheetVisible: (visible: boolean) => void;
}
