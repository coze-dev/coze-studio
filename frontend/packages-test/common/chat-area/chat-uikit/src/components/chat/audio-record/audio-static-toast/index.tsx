import { type PropsWithChildren } from 'react';

import classNames from 'classnames';

import { typeSafeAudioStaticToastVariants } from './variant';

export interface AudioStaticToastProps {
  theme?: 'danger' | 'primary' | 'background';
  className?: string;
  color?: 'primary' | 'danger';
}

export const AudioStaticToast: React.FC<
  PropsWithChildren<AudioStaticToastProps>
> = ({ children, theme = 'primary', color = 'primary', className }) => {
  const cvaClassNames = typeSafeAudioStaticToastVariants({ theme, color });
  return <div className={classNames(cvaClassNames, className)}>{children}</div>;
};
