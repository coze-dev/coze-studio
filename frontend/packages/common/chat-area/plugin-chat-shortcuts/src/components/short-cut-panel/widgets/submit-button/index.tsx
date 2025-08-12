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
