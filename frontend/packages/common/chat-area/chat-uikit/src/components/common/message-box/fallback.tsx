import { useRef, useEffect, type ComponentType } from 'react';

import { type FallbackProps } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';

import { useUiKitMessageBoxContext } from '../../../context/message-box';
export const FallbackComponent: ComponentType<FallbackProps> = ({ error }) => {
  const { onError } = useUiKitMessageBoxContext();

  const reported = useRef(false);

  useEffect(() => {
    if (!onError || !error) {
      return;
    }

    if (reported.current) {
      return;
    }

    onError(error);
    reported.current = true;
  }, [onError, error]);

  return (
    <div className="p-[12px]">
      <span className="text-[14px] font-medium text-[#222222]">
        {I18n.t('message_content_error')}
      </span>
    </div>
  );
};
