import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { UIButton } from '@coze-arch/bot-semi';
import { IconDownloadStroked } from '@douyinfe/semi-icons';

import { useImages } from './use-images';
import { Images } from './images';

import styles from './index.module.less';

export const ImagesWithDownload = () => {
  const { images, downloadImages } = useImages();

  return (
    <div className={styles.container}>
      {images.length > 0 && (
        <>
          <UIButton
            className={styles.downloadImages}
            type="primary"
            theme="borderless"
            onClick={downloadImages}
            icon={<IconDownloadStroked />}
          >
            {I18n.t('imageflow_output_display_save')}
          </UIButton>
          <Images images={images} />
        </>
      )}
    </div>
  );
};
