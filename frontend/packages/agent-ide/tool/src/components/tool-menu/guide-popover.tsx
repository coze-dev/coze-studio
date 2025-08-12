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

import { useState, type FC } from 'react';

import classnames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';
import { useCommonConfigStore } from '@coze-foundation/global-store';

import guideFallbackImage from './images/guide-fallback.png';

import styles from './index.module.less';

interface IProps {
  onClose?: () => void;
}

export const GuidePopover: FC<IProps> = ({ onClose }) => {
  const [fallbackUrl, setFallbackUrl] = useState('');

  const botIdeGuideVideoUrl = useCommonConfigStore(
    state => state.commonConfigs.botIdeGuideVideoUrl,
  );
  return (
    <div className={styles.guide}>
      <p className={classnames(styles['guide-text'], 'coz-fg-primary')}>
        {I18n.t('modules_menu_guide')}
      </p>
      {fallbackUrl ? (
        <img src={fallbackUrl} className={styles['guide-image']} />
      ) : (
        <video
          width={380}
          height={238}
          src={botIdeGuideVideoUrl}
          poster={guideFallbackImage}
          data-object-fit
          muted
          data-autoplay
          loop={true}
          autoPlay={true}
          onError={() => setFallbackUrl(guideFallbackImage)}
          className={styles['guide-video']}
        />
      )}
      <Button
        className={styles['guide-button']}
        type="primary"
        theme="solid"
        onClick={onClose}
      >
        {I18n.t('modules_menu_guide_gotit')}
      </Button>
    </div>
  );
};
