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

/* eslint-disable @typescript-eslint/naming-convention */
import { useState } from 'react';

import { PromptEditorProvider } from '@/editor';

import { type PromptConfiguratorModalProps } from './types';
import { PromptConfiguratorModal } from './prompt-configurator-modal';
type DynamicProps = Pick<
  PromptConfiguratorModalProps,
  'mode' | 'editId' | 'canEdit' | 'defaultPrompt'
>;

export type UsePromptConfiguratorModalProps = Pick<
  PromptConfiguratorModalProps,
  | 'spaceId'
  | 'getConversationId'
  | 'getPromptContextInfo'
  | 'onUpdateSuccess'
  | 'importPromptWhenEmpty'
  | 'onDiff'
  | 'enableDiff'
  | 'isPersonal'
  | 'source'
  | 'botId'
  | 'projectId'
  | 'workflowId'
> &
  Partial<DynamicProps> & {
    CustomPromptConfiguratorModal?: (
      props: PromptConfiguratorModalProps,
    ) => React.JSX.Element;
  };
export const usePromptConfiguratorModal = (
  props: UsePromptConfiguratorModalProps,
) => {
  const { CustomPromptConfiguratorModal = PromptConfiguratorModal } = props;
  const [visible, setVisible] = useState(false);
  const [dynamicProps, setDynamicProps] = useState<DynamicProps>({
    mode: 'create',
    editId: '',
    canEdit: true,
    defaultPrompt: '',
  });

  const close = () => {
    setVisible(false);
  };
  const open = (
    options: Pick<
      PromptConfiguratorModalProps,
      'mode' | 'editId' | 'canEdit' | 'defaultPrompt'
    >,
  ) => {
    setVisible(true);
    setDynamicProps(options);
  };
  return {
    node: visible ? (
      <PromptEditorProvider>
        <CustomPromptConfiguratorModal
          {...props}
          {...dynamicProps}
          onCancel={close}
        />
      </PromptEditorProvider>
    ) : null,
    close,
    open,
  };
};
