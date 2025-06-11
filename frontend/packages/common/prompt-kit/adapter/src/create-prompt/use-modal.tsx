import {
  usePromptConfiguratorModal as BaseUsePromptConfiguratorModal,
  type UsePromptConfiguratorModalProps,
} from '@coze-common/prompt-kit-base/create-prompt';

import { PromptConfiguratorModal } from './prompt-configurator-modal';

export const usePromptConfiguratorModal = (
  props: UsePromptConfiguratorModalProps,
) =>
  BaseUsePromptConfiguratorModal({
    ...props,
    CustomPromptConfiguratorModal: PromptConfiguratorModal,
  });
