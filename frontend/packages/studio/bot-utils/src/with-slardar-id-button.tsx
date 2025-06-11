import { type ReactNode } from 'react';

import copy from 'copy-to-clipboard';
import { getSlardarInstance } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { Button, Toast } from '@coze/coze-design';

export const withSlardarIdButton = (node: ReactNode) => {
  const copySlardarId = () => {
    const id = getSlardarInstance()?.config()?.sessionId;
    copy(id ?? '');
    Toast.success(I18n.t('error_id_copy_success'));
  };

  return (
    <div className="flex flex-row justify-center items-center">
      {node}
      <Button
        className="ml-[8px]"
        onClick={copySlardarId}
        size="small"
        color="primary"
      >
        {I18n.t('copy_session_id')}
      </Button>
    </div>
  );
};
