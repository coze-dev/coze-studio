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

import React, { useMemo } from 'react';

import { IconCozFocus } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';
import { type Span } from '@coze-arch/bot-api/workflow_api';

import { getStrFromSpan } from '../../utils';

export const FocusButton: React.FC<{
  span: Span;
  onClick: (span: Span) => void;
}> = ({ span, onClick }) => {
  const nodeId = useMemo(
    () => getStrFromSpan(span, 'workflow_node_id'),
    [span],
  );

  if (!nodeId) {
    return null;
  }

  return (
    <IconButton
      icon={<IconCozFocus />}
      size="mini"
      onClick={() => onClick(span)}
    />
  );
};
