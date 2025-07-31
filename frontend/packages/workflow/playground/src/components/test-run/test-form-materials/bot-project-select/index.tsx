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

import { type ComponentAdapterCommonProps } from '../../types';
import { FieldName } from '../../constants';
import { type ValueType } from '../../../bot-project-select/types';
import { BotProjectSelectWithField } from '../../../bot-project-select';

export type BotSelectProps = ComponentAdapterCommonProps<
  ValueType | undefined
> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

const BotProjectSelectTestset: React.FC<BotSelectProps> = ({
  value,
  ...props
}) => (
  <BotProjectSelectWithField
    field={FieldName.Bot}
    hideLabel={true}
    {...props}
  />
);

export { BotProjectSelectTestset };
