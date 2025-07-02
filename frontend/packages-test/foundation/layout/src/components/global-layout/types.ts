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
