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

import classNames from 'classnames';
import { IconCozLongArrowUp } from '@coze-arch/coze-design/icons';

import { OutlinedIconButton } from '../button';
import { type ToNewestTipProps } from './type';
import './animation.less';

export const ToNewestTipUI = (props: ToNewestTipProps) => {
  const { onClick, style, className, show, showBackground } = props;
  return (
    <OutlinedIconButton
      className={classNames(
        [
          'shadow-normal',
          'coz-fg-hglt',
          'to-newest-tip-ui-animation',
          '!rounded-full',
        ],
        !show && ['pointer-events-none', 'opacity-0'],
        className,
      )}
      size="large"
      onClick={onClick}
      style={style}
      icon={<IconCozLongArrowUp className="rotate-180" />}
      showBackground={showBackground}
    />
  );
};

ToNewestTipUI.displayName = 'UIKitToNewestTip';
