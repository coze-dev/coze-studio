import { useNavigate } from 'react-router-dom';
import React, { useCallback } from 'react';

import { IconCozArrowLeft } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';
import { useSpaceId } from '@coze-project-ide/framework';

export const GoBackButton: React.FC = () => {
  const navigate = useNavigate();
  const spaceId = useSpaceId();
  const handleGoBack = useCallback(() => {
    navigate(`/space/${spaceId}/develop`);
  }, [spaceId, navigate]);

  return (
    <IconButton
      color="secondary"
      icon={<IconCozArrowLeft />}
      onClick={handleGoBack}
    />
  );
};
