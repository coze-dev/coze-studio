import React from 'react';

import { IconCozMinus } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

interface DeleteProps {
  hidden?: boolean;
  remove?: () => void;
  testId: string;
}

export default function Delete({ hidden, remove, testId }: DeleteProps) {
  return (
    <div>
      {hidden ? null : (
        <IconButton
          data-testid={testId}
          color="secondary"
          size="small"
          icon={<IconCozMinus className="text-sm" />}
          onClick={remove}
        />
      )}
    </div>
  );
}
