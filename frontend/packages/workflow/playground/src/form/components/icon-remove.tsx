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

import { IconCozMinus } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

interface IconRemoveProps {
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  testId?: string;
}

export function IconRemove({
  className = '',
  onClick,
  disabled = false,
  testId = '',
}: IconRemoveProps) {
  return (
    <IconButton
      className={`${className} !block`}
      icon={<IconCozMinus />}
      color="secondary"
      onClick={onClick}
      disabled={disabled}
      size="small"
      data-testid={testId}
    />
  );
}
