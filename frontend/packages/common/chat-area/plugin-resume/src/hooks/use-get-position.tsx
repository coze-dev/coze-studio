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

import { useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';

interface GetPositionProps {
  getPositionSuccess: (position: GeolocationPosition) => void;
}

export const useGetPosition = ({ getPositionSuccess }: GetPositionProps) => {
  // Position authorization button loading state
  const [loading, setLoading] = useState(false);

  const getSysPosition = () => {
    setLoading(true);
    /** Acquire system location information */
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
