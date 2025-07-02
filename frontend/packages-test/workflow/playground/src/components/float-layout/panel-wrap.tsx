import cls from 'classnames';

import { useGlobalState } from '../../hooks';

import styles from './panel-wrap.module.less';

interface PanelWrapProps {
  layout?: 'horizontal' | 'vertical';
  className?: string;
  style?: React.CSSProperties;
}

export const PanelWrap: React.FC<React.PropsWithChildren<PanelWrapProps>> = ({
  layout = 'horizontal',
  children,
  className,
  ...props
}) => {
  const { isInIDE } = useGlobalState();

  return (
    <div
      className={cls(styles['panel-wrap'], className, {
        [styles.vertical]: layout === 'vertical' && !isInIDE,
        [styles.horizontal]: layout === 'horizontal' && !isInIDE,
        [styles.vertical_project]: layout === 'vertical' && isInIDE,
        [styles.horizontal_project]: layout === 'horizontal' && isInIDE,
      })}
      {...props}
    >
      {children}
    </div>
  );
};
