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

import { useShallow } from 'zustand/react/shallow';
import { useGenerateImageStore } from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import { IconCozUpload } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';

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
