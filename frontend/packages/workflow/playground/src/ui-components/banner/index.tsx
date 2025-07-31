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

/**
 * Make a simple style encapsulation for the banner of semi-ui, which conforms to the UX design draft specification
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
