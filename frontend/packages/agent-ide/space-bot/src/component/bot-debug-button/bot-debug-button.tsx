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

import { type Ref, forwardRef, type FC } from 'react';

import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { type IconButtonProps } from '@coze-arch/coze-design/types';
import { Button, IconButton } from '@coze-arch/coze-design';
import { type UIButton } from '@coze-arch/bot-semi';

import s from './index.module.less';

export const BotDebugButton: FC<IconButtonProps> = forwardRef(
  (props: IconButtonProps, ref: Ref<UIButton>) => {
    const isReadonly = useBotDetailIsReadonly();

    const className = props.theme || '';
    if (isReadonly) {
      return null;
    }
    if (props.icon && !props.children) {
      return <IconButton {...props} className={s[className]} ref={ref} />;
    }
    return <Button {...props} className={s[className]} ref={ref} />;
  },
);
