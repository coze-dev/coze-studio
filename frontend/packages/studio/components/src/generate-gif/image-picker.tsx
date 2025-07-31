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

import classNames from 'classnames';
import { withSlardarIdButton } from '@coze-studio/bot-utils';
import { I18n } from '@coze-arch/i18n';
import { IconCozImage, IconCozUpload } from '@coze-arch/coze-design/icons';
import { Button, Image, Popover, Toast, Upload } from '@coze-arch/coze-design';
import { FileBizType } from '@coze-arch/bot-api/developer_api';
import { customUploadRequest } from '@coze-common/biz-components/picture-upload';

import { type ImageItem, ImageList } from '../image-list';

import s from './index.module.less';

interface ImagePickerProps {
  setImage: (image: ImageItem) => void;
  imageList: ImageItem[];
  url?: string;
}

export default function ImagePicker(props: ImagePickerProps) {
  const { setImage, imageList, url } = props;
  const [uploadBtnLoading, setUploadBtnLoading] = useState(false);
  return (
    <div className={s['image-ctn']}>
      <Popover
        position="right"
        trigger="hover"
        keepDOM
        content={
          <div className={s['upload-panel']}>
            <ImageList
              data={imageList || []}
              className={s['image-list']}
              imageItemClassName={s['image-item']}
              showDeleteIcon={false}
              showSelectedIcon={false}
              onClick={({ item }) => {
                setImage(item);
              }}
            />
            <Upload
              action=""
              limit={1}
              customRequest={options => {
                customUploadRequest({
                  ...options,
                  fileBizType: FileBizType.BIZ_BOT_ICON,
                  onSuccess(data) {
                    setImage({
                      img_info: {
                        tar_uri: data?.upload_uri || '',
                        tar_url: data?.upload_url || '',
                      },
                    });
                  },
                  beforeUploadCustom() {
                    setUploadBtnLoading(true);
                  },
                  afterUploadCustom() {
                    setUploadBtnLoading(false);
                  },
                });
              }}
              fileList={[]}
              accept=".jpeg,.jpg,.png"
              showReplace={false}
              showUploadList={false}
              // eslint-disable-next-line @typescript-eslint/no-magic-numbers
              maxSize={2 * 1024}
              onSizeError={() => {
                Toast.error({
                  // Starling toggle
                  content: withSlardarIdButton(
                    I18n.t(
                      'dataset_upload_image_warning',
                      {},
                      'Please upload an image less than 2MB',
                    ),
                  ),
                  showClose: false,
                });
              }}
            >
              <Button
                color="primary"
                size="small"
                loading={uploadBtnLoading}
                icon={<IconCozUpload />}
              >
                {I18n.t('creat_popup_profilepicture_upload')}
              </Button>
            </Upload>
          </div>
        }
      >
        {url ? (
          <div>
            <Image src={url} className={s['show-image']} preview={false} />
          </div>
        ) : (
          <div className={classNames(s['empty-image'])}>
            <IconCozImage />
          </div>
        )}
      </Popover>
    </div>
  );
}
