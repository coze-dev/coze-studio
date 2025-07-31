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

import { type ButtonProps } from '@coze-arch/bot-semi/Button';
import { Button } from '@coze-arch/bot-semi';

export type BotDebugButtonProps = ButtonProps & {
  readonly: boolean;
};
export const BotDebugButton: FC<BotDebugButtonProps> = forwardRef(
  (props: BotDebugButtonProps, ref: Ref<Button>) => {
    const { readonly, ...rest } = props;

    if (readonly) {
      return null;
    }
    return <Button {...rest} ref={ref} />;
  },
);
