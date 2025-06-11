import { IconButton, useFormState } from '@coze-arch/bot-semi';
import { IconSend } from '@coze-arch/bot-icons';

import {
  type DSLContext,
  type DSLComponent,
  type DSLFormFieldCommonProps,
} from '../types';
import { findInputElementById } from '../../../../utils/dsl-template';
import { useChatAreaState } from '../../../../context/chat-area-state';

import styles from './index.module.less';

interface DSLSubmitButtonProps {
  formFields?: string[];
}

const useIsSubmitButtonDisable = ({
  context: { readonly, dsl },
  props: { formFields = [] },
}: {
  context: DSLContext;
  props: Pick<DSLSubmitButtonProps, 'formFields'>;
}): boolean => {
  const formState = useFormState();
  const disabled = formFields.some(field => {
    const isEmpty = !formState.values[field];
    const isError = !!formState.errors?.[field];
    const inputDefaultValue = findInputElementById(dsl, field)?.props
      ?.defaultValue as DSLFormFieldCommonProps['defaultValue'];

    if (inputDefaultValue?.value) {
      return isError;
    }

    return isError || isEmpty;
  });
  const { isSendMessageLock } = useChatAreaState();

  return readonly || disabled || isSendMessageLock;
};

export const DSLSubmitButton: DSLComponent<DSLSubmitButtonProps> = ({
  context,
  props,
}) => {
  const isDisabled = useIsSubmitButtonDisable({ context, props });

  return (
    <div className="flex justify-end">
      <IconButton
        theme="borderless"
        className={styles.button}
        htmlType="submit"
        size="small"
        disabled={isDisabled}
        icon={<IconSend />}
      />
    </div>
  );
};
