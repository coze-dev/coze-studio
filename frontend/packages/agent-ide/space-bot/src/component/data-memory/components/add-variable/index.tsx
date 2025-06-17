import { I18n } from '@coze-arch/i18n';
import { IconButton } from '@coze-arch/coze-design';
import { IconAdd } from '@coze-arch/bot-icons';

import { type ISysConfigItemGroup } from '../../hooks';

const DEFAULT_VARIABLE_LENGTH = 10;
export const AddVariable = (props: {
  groupConfig?: ISysConfigItemGroup;
  isReadonly: boolean;
  hideAddButton?: boolean;
  forceShow?: boolean;
  handleInputedClick: () => void;
}) => {
  const {
    groupConfig,
    isReadonly,
    hideAddButton = false,
    forceShow = false,
    handleInputedClick,
  } = props;
  const enableVariables = groupConfig?.var_info_list ?? [];
  return (enableVariables.length < DEFAULT_VARIABLE_LENGTH &&
    !isReadonly &&
    !hideAddButton) ||
    forceShow ? (
    <div className="my-3 px-[22px] text-left">
      <IconButton
        className="!m-0"
        onClick={() => handleInputedClick()}
        icon={<IconAdd />}
      >
        {I18n.t('bot_userProfile_add')}
      </IconButton>
    </div>
  ) : null;
};
