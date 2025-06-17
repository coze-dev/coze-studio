import copy from 'copy-to-clipboard';
import { I18n } from '@coze-arch/i18n';
import { IconCozCopy } from '@coze-arch/coze-design/icons';
import { Typography, Toast } from '@coze-arch/coze-design';
import { UIIconButton } from '@coze-arch/bot-semi';

import { useExecStateEntity } from '../../../hooks';

const { Text } = Typography;

export const ExecuteLogId = () => {
  const execEntity = useExecStateEntity();

  const { executeLogId = '', logID = '' } = execEntity;

  const handleCopy = (id: string) => {
    const success = copy(id);
    if (success) {
      Toast.success({ content: I18n.t('copy_success'), showClose: false });
    } else {
      Toast.warning({ content: I18n.t('copy_failed'), showClose: false });
    }
  };

  if (!executeLogId) {
    return null;
  }

  return (
    <>
      <div>
        <Text className="inline break-words" size="small" type="quaternary">
          {`${I18n.t(
            'workflow_running_results_error_executeid',
          )}: ${executeLogId}`}
          <UIIconButton
            wrapperClass="inline"
            iconSize="small"
            icon={<IconCozCopy color="#1D1C2359" />}
            onClick={() => handleCopy(executeLogId)}
          />
        </Text>
      </div>

      <div>
        <Text className="inline break-words" size="small" type="quaternary">
          {`logID: ${logID}`}
          <UIIconButton
            wrapperClass="inline"
            iconSize="small"
            icon={<IconCozCopy color="#1D1C2359" />}
            onClick={() => handleCopy(logID)}
          />
        </Text>
      </div>
    </>
  );
};
