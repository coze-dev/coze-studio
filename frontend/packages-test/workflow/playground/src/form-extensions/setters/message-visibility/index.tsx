import { I18n } from '@coze-arch/i18n';

import { toStandardSetter } from '../to-standard-setter';
// import { MessageVisibilityWrapper } from './message-visibility-wrapper';
import { MessageVisibility } from './message-visibility';
import { customVisibilityValue } from './constants';

export const messageVisibility = {
  key: 'MessageVisibility',
  component: toStandardSetter(MessageVisibility),
  validator: ({ value }) => {
    if (
      value.visibility === customVisibilityValue &&
      !value.user_settings?.length
    ) {
      return I18n.t('required', {}, 'Required');
    } else {
      return true;
    }
  },
};
