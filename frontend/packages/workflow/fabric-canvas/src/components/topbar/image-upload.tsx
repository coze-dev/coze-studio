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

import classNames from 'classnames';
import { useImageUploader, type ImageRule } from '@coze-workflow/components';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozCrossCircle,
  IconCozLoading,
} from '@coze-arch/coze-design/icons';
import {
  Toast,
  Tooltip,
  Upload,
  type customRequestArgs,
} from '@coze-arch/coze-design';

import styles from './image-upload.module.less';

const imageRules: ImageRule = {
  suffix: ['jpg', 'jpeg', 'png', 'webp'],
  maxSize: 1024 * 1024 * 5,
};

export const ImageUpload = (props: {
  onChange?: (url: string) => void;
  children?:
    | React.ReactNode
    | ((data: { loading: boolean; cancel: () => void }) => React.ReactNode);
  tooltip?: string;
  disabledTooltip?: boolean;
  key?: string;
  className?: string;
}) => {
  const { onChange, children, className, tooltip, key, disabledTooltip } =
    props;
  // const focusRef = useRef(false);
  const { uploadImg, clearImg, loading } = useImageUploader({
    rules: imageRules,
  });

  const handleUpload: (object: customRequestArgs) => void = async ({
    fileInstance,
  }) => {
    clearImg();
    const res = await uploadImg(fileInstance);
    if (res?.isSuccess) {
      onChange?.(res.url);
    }
  };

  const handleAcceptInvalid = () => {
    Toast.error(
      I18n.t('imageflow_upload_error_type', {
        type: imageRules.suffix?.join('/'),
      }),
    );
  };

  const content = (
    <div className={classNames([styles['loading-container'], className])}>
      <Upload
        action=""
        disabled={loading}
        customRequest={handleUpload}
        draggable={true}
        accept={imageRules.suffix?.map(item => `.${item}`).join(',')}
        showUploadList={false}
        onAcceptInvalid={handleAcceptInvalid}
      >
        {typeof children === 'function' ? (
          children({ loading, cancel: clearImg })
        ) : loading ? (
          <div>
            <IconCozLoading
              className={`loading coz-fg-dim ${styles['hover-hidden']}`}
            />
            <IconCozCrossCircle
              onClick={e => {
                e.stopPropagation();
                clearImg();
              }}
              className={`coz-fg-dim hover-visible ${styles['hover-visible']}`}
            />
          </div>
        ) : (
          children
        )}
      </Upload>
    </div>
  );

  return disabledTooltip ? (
    content
  ) : (
    <Tooltip
      key={key ?? 'image'}
      content={loading ? I18n.t('Cancel') : tooltip}
      mouseEnterDelay={300}
      mouseLeaveDelay={300}
      getPopupContainer={() => document.body}
    >
      {content}
    </Tooltip>
  );
};
