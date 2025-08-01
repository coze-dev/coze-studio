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
