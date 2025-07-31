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
import { Typography } from '@coze-arch/coze-design';

const { Text } = Typography;

export const ReadonlyText = (props: { value: string; className?: string }) => {
  const { value, className } = props;
  return (
    <Text
      className={classNames(
        'w-full coz-fg-primary text-sm !font-medium',
        className,
      )}
      ellipsis
    >
      {value}
    </Text>
  );
};
