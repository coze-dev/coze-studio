/**
 * 对 semi-ui 的 banner 做一个简单的样式封装，符合 UX 设计稿规范
 */

import { type FC } from 'react';

import classnames from 'classnames';
import { Banner, type BannerProps } from '@coze-arch/coze-design';
import { IconClose } from '@douyinfe/semi-icons';

import styles from './index.module.less';

export const UIBanner: FC<BannerProps> = props => (
  <Banner
    bordered
    closeIcon={<IconClose />}
    fullMode={false}
    {...props}
    className={classnames(styles.uiBanner, props.className)}
  />
);
