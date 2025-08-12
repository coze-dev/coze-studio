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

import { type CSSProperties, type FC } from 'react';

import { merge } from 'lodash-es';
import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';

import { ERROR_LINE_HEIGHT } from '../../constants';

export const RequiredWarn: FC<{
  text?: string;
  className?: string;
  style?: CSSProperties;
  absolute?: boolean;
}> = props => {
  const { text, style, className, absolute = true } = props;
  return (
    <div
      className={classNames(
        className,
        'coz-fg-hglt-red text-[10px]',
        'ml-[8px]',
        'whitespace-nowrap',
        absolute ? 'absolute' : '',
      )}
      style={merge(
        {
          lineHeight: `${ERROR_LINE_HEIGHT}px`,
        },
        style,
      )}
    >
      {text || I18n.t('publish_base_configFields_requiredWarn')}
    </div>
  );
};
