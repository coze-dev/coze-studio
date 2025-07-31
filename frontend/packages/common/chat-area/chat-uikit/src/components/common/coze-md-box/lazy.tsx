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

import { type ComponentPropsWithRef, type FC } from 'react';

import { MdBoxLazy } from '@coze-arch/bot-md-box-adapter/lazy';

import { CozeLink } from '../../md-box-slots/link';
import { CozeImage } from '../../md-box-slots/coze-image';

export const LazyCozeMdBox: FC<
  ComponentPropsWithRef<typeof MdBoxLazy>
> = props => (
  <MdBoxLazy
    slots={{
      Image: CozeImage,
      Link: CozeLink,
    }}
    {...props}
  />
);
