import { useShallow } from 'zustand/react/shallow';
import { useGenerateImageStore } from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import { IconCozUpload } from '@coze/coze-design/icons';
import { Button } from '@coze/coze-design';

import { GenerateButton } from '../generate-button';

import s from './index.module.less';

interface AutoGenerateProps {
  onUploadClick: React.MouseEventHandler<HTMLButtonElement>;
  onGenerateStaticImageClick: React.MouseEventHandler<HTMLButtonElement>;
  onGenerateGifClick: React.MouseEventHandler<HTMLButtonElement>;
}

export const UploadGenerateButton = (props: AutoGenerateProps) => {
  const { onUploadClick, onGenerateStaticImageClick, onGenerateGifClick } =
    props;

  const { generateStaticImageButtonLoading, generateGifButtonLoading } =
    useGenerateImageStore(
      useShallow(store => ({
        generateStaticImageButtonLoading:
          store.generateAvatarModal.image.loading,
        generateGifButtonLoading: store.generateAvatarModal.gif.loading,
      })),
    );

  return (
    <div className={s['button-ctn']}>
      <Button color="primary" size="small" onClick={onUploadClick}>
        <IconCozUpload className={s['generate-icon']} />
        {I18n.t('creat_popup_profilepicture_upload')}
      </Button>
      <GenerateButton
        transparent={true}
        text={I18n.t('creat_popup_profilepicture_generateimage')}
        cancelText={I18n.t('creat_popup_profilepicture_generateimage')}
        size="small"
        disabled={generateGifButtonLoading}
        loading={generateStaticImageButtonLoading}
        onClick={onGenerateStaticImageClick}
        onCancel={onGenerateStaticImageClick}
      />
      <GenerateButton
        transparent={true}
        text={I18n.t('creat_popup_profilepicture_generategif')}
        cancelText={I18n.t('creat_popup_profilepicture_generategif')}
        size="small"
        disabled={generateStaticImageButtonLoading}
        loading={generateGifButtonLoading}
        onClick={onGenerateGifClick}
        onCancel={onGenerateGifClick}
      />
    </div>
  );
};
