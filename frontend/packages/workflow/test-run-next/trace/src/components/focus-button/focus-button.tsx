import React, { useMemo } from 'react';

import { IconCozFocus } from '@coze/coze-design/icons';
import { IconButton } from '@coze/coze-design';
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
