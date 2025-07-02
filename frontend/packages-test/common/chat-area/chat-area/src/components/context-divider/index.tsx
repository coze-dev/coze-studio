import classNames from 'classnames';

import { useShowBackGround } from '../../hooks/public/use-show-bgackground';
import { usePreference } from '../../context/preference';

import styles from './index.module.less';

interface ContextDividerProps {
  text?: string;
}

export const ContextDivider = ({ text }: ContextDividerProps) => {
  const { messageWidth } = usePreference();
  const showBackground = useShowBackGround();

  return (
    <div className={styles.divider} style={{ width: messageWidth }}>
      <div
        className={classNames(
          styles['divider-line'],
          styles['coz-divider-line-style'],
          {
            '!coz-bg-images-secondary': showBackground,
          },
        )}
      ></div>
      <div
        className={classNames(styles['divider-text'], 'coz-fg-dim', {
          '!coz-fg-images-secondary': showBackground,
        })}
      >
        {text}
      </div>
      <div
        className={classNames(
          styles['divider-line'],
          // ui 要求分割线颜色特别处理 不使用 token
          styles['coz-divider-line-style'],
          {
            '!coz-bg-images-secondary': showBackground,
          },
        )}
      ></div>
    </div>
  );
};

ContextDivider.displayName = 'ChatAreaContextDivider';
