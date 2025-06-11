import { useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze/coze-design';

interface GetPositionProps {
  getPositionSuccess: (position: GeolocationPosition) => void;
}

export const useGetPosition = ({ getPositionSuccess }: GetPositionProps) => {
  // 位置授权按钮loading态
  const [loading, setLoading] = useState(false);

  const getSysPosition = () => {
    setLoading(true);
    /** 获取系统地理位置信息 */
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setLoading(false);

          getPositionSuccess?.(position);
        },
        error => {
          setLoading(false);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              Toast.error(
                I18n.t('bot_ide_user_declines_geolocation_auth_toast'),
              );
              break;
            case error.POSITION_UNAVAILABLE:
              Toast.error(I18n.t('bot_ide_geolocation_not_usable_toast'));
              break;
            case error.TIMEOUT:
              Toast.error(I18n.t('bot_ide_geolocation_request_timeout_toast'));
              break;
            default:
              Toast.error(
                I18n.t('bot_ide_geolocation_request_unknown_error_toast'),
              );
              break;
          }
        },
      );
    } else {
      setLoading(false);
      Toast.error(I18n.t('bot_ide_browser_not_support_geolocation_toast'));
    }
  };

  return {
    loading,
    getSysPosition,
  };
};
