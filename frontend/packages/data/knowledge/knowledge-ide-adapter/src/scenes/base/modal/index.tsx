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

import { type IKnowledgeParams } from '@coze-data/knowledge-stores';
import { useKnowledgeIDEFullScreenModal as useKnowledgeIDEFullScreenModalBase } from '@coze-data/knowledge-ide-base/layout/base/modal';
import { type KnowledgeIDENavBarProps } from '@coze-data/knowledge-ide-base/components/knowledge-nav-bar';

import { BaseKnowledgeIDE } from '../index';

export const useBaseKnowledgeIDEFullScreenModal = (props: {
  keepDocTitle?: boolean;
  navBarProps?: Partial<KnowledgeIDENavBarProps>;
  biz: IKnowledgeParams['biz'];
  spaceId: string;
}) =>
  useKnowledgeIDEFullScreenModalBase({
    ...props,
    renderKnowledgeIDE: ({ onClose }) => (
      <BaseKnowledgeIDE
        {...props}
        navBarProps={{
          ...props.navBarProps,
          onBack: onClose,
        }}
      />
    ),
  });
