import { type Setter } from '@coze-workflow/setters';
import { typeSafeJSONParse } from '@coze-arch/bot-utils';

import {
  type MessageVisibilityValue,
  type MessageVisibilitySetterOptions,
} from './types';
import { MessageVisibility } from './message-visibility';

export const MessageVisibilityWrapper: Setter<
  string,
  MessageVisibilitySetterOptions
> = props => {
  const { value, onChange } = props;

  const handleOnChange = (v: MessageVisibilityValue) => {
    onChange?.(JSON.stringify(v));
  };

  return (
    <MessageVisibility
      {...props}
      value={typeSafeJSONParse(value) ?? {}}
      onChange={handleOnChange}
    />
  );
};
