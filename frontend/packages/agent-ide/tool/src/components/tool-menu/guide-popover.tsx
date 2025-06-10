import { useState, type FC } from 'react';

import classnames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze/coze-design';
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
