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

import { type FC } from 'react';

import classNames from 'classnames';

import {
  type ThinkingPlaceholderVariantProps,
  typeSafeThinkingPlaceholderVariants,
} from './variant';
import { type IThinkingPlaceholderProps } from './type';
import './animation.less';

const getVariantByProps = ({
  theme,
  showBackground,
}: {
  theme: IThinkingPlaceholderProps['theme'];
  showBackground: boolean;
}): ThinkingPlaceholderVariantProps => {
  if (showBackground) {
    return { backgroundColor: 'withBackground' };
  }
  if (!theme) {
    return { backgroundColor: null };
  }
  return { backgroundColor: theme };
};

export const ThinkingPlaceholder: FC<IThinkingPlaceholderProps> = props => {
  const { className, theme = 'none', showBackground } = props;

  return (
    <div
      className={classNames(
        typeSafeThinkingPlaceholderVariants(
          getVariantByProps({ showBackground: Boolean(showBackground), theme }),
        ),
        className,
      )}
    >
      <div className="chat-uikit-coz-thinking-placeholder"></div>
    </div>
  );
};
