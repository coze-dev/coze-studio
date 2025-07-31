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

// eslint-disable-next-line @coze-arch/no-pkg-dir-import
import { IconFactory } from '@coze-arch/bot-icons/src/factory';

import { ReactComponent as SvgLineError } from './line-error.svg';
import { ReactComponent as SvgLineErrorCaseI18n } from './line-error-case-i18n.svg';
import { ReactComponent as SvgLineErrorCaseCn } from './line-error-case-cn.svg';

export const IconLineErrorCaseI18n: ReturnType<typeof IconFactory> =
  IconFactory(<SvgLineErrorCaseI18n />);

export const IconLineErrorCaseCn: ReturnType<typeof IconFactory> = IconFactory(
  <SvgLineErrorCaseCn />,
);

export const IconLineError: ReturnType<typeof IconFactory> = IconFactory(
  <SvgLineError />,
);
