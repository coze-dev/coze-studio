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

import { type PropsWithChildren, useRef } from 'react';

import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { AIButton, type ButtonProps } from '@coze-arch/coze-design';

import { usePromptEditor } from '../../context/editor-kit';
import { useBotEditorService } from '../../context/bot-editor-service';

export const NLPromptButton: React.FC<PropsWithChildren<ButtonProps>> = ({
  children,
  ...buttonProps
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { nLPromptModalVisibilityService } = useBotEditorService();
  const { promptEditor } = usePromptEditor();
  const isReadonly = useBotDetailIsReadonly();

  const isDisabled = !promptEditor || isReadonly;

  const onClick = () => {
    if (!ref.current) {
      return;
    }
    const { offsetHeight, offsetTop } = ref.current;
    const { top, left } = ref.current.getBoundingClientRect();
    nLPromptModalVisibilityService.open(
      {
        top: top + offsetHeight,
        left: left + offsetTop,
      },
      'ai-button',
    );
  };
  return (
    <div ref={ref}>
      <AIButton
        color="aihglt"
        iconPosition="left"
        size="small"
        disabled={isDisabled}
        onClick={onClick}
        {...buttonProps}
      >
        {children}
      </AIButton>
    </div>
  );
};
