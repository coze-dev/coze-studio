import classNames from 'classnames';
import { type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import { I18n } from '@coze-arch/i18n';

import { TitleArea } from './title-area';

import styles from './index.module.less';

export interface SettingItemProps {
  title: string;
  tip?: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
  tipStyle?: Record<string, string | number>;
}

export const SettingItem = ({
  title,
  tip,
  children,
  className,
  tipStyle,
}: SettingItemProps) => (
  <div className={classNames(styles['setting-item-container'], className)}>
    <TitleArea
      title={I18n.t(title as unknown as I18nKeysNoOptionsType)}
      tip={tip || ''}
      tipStyle={tipStyle}
    />
    <div
      className={classNames(
        styles['setting-item'],
        'dataset-setting-content-item',
      )}
    >
      {children}
    </div>
  </div>
);
