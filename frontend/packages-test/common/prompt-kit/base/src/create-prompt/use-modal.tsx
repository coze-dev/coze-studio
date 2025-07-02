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
