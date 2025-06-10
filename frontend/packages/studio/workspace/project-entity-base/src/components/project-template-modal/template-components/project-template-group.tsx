import { type ReactNode, type PropsWithChildren } from 'react';

import classNames from 'classnames';

import styles from './card.module.less';

export interface ProjectTemplateGroupProps {
  title: ReactNode | undefined;
  groupChildrenClassName?: string;
}

export const ProjectTemplateGroup: React.FC<
  PropsWithChildren<ProjectTemplateGroupProps>
> = ({ title, groupChildrenClassName, children }) => (
  <div>
    <div className="mb-8px coz-fg-plus text-[16px] font-medium leading-[22px]">
      {title}
    </div>
    <div
      className={classNames(
        'grid',
        styles['template-group'],
        groupChildrenClassName,
      )}
    >
      {children}
    </div>
  </div>
);
