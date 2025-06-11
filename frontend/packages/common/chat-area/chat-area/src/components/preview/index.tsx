import { type FC } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { I18n } from '@coze-arch/i18n';
import { ImagePreview, UIToast } from '@coze-arch/bot-semi';
import { Layout } from '@coze-common/chat-uikit-shared';

import { useChatAreaStoreSet } from '../../hooks/context/use-chat-area-context';

import s from './index.module.less';
export const Preview: FC<{ layout?: Layout }> = ({ layout }) => {
  const { useFileStore } = useChatAreaStoreSet();

  const { previewURL, updatePreviewURL } = useFileStore(
    useShallow(state => ({
      previewURL: state.previewURL,
      updatePreviewURL: state.updatePreviewURL,
    })),
  );

  const resetPreviewUrl = () => {
    updatePreviewURL('');
  };
  return (
    <ImagePreview
      // image preview 的默认 z index 比 toast 要高，调小一些
      zIndex={1009}
      previewCls={layout === Layout.MOBILE ? s['image-preview-mobile'] : ''}
      src={previewURL}
      // disableDownload
      onDownloadError={() => {
        UIToast.error(I18n.t('image_download_not_supported'));
      }}
      visible={Boolean(previewURL)}
      onVisibleChange={resetPreviewUrl}
    />
  );
};
