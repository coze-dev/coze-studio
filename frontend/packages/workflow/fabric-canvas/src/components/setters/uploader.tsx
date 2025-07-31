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

import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozLoading, IconCozUpload } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';

import { ImageUpload } from '../topbar/image-upload';

interface IProps {
  getLabel: (isRefElement: boolean) => string;
  onChange: (url: string) => void;
  isRefElement: boolean;
}
export const Uploader: FC<IProps> = props => {
  const { getLabel, onChange, isRefElement } = props;
  return (
    <div className="w-full flex gap-[8px] justify-between items-center text-[14px]">
      <div className="min-w-[80px]">{getLabel(isRefElement)}</div>
      <ImageUpload
        disabledTooltip
        onChange={onChange}
        tooltip={I18n.t('card_builder_image')}
        className="flex-1"
      >
        {({ loading, cancel }) => (
          <Button
            className="w-full"
            color="primary"
            onClick={() => {
              loading && cancel();
            }}
            icon={
              loading ? (
                <IconCozLoading className={'loading coz-fg-dim'} />
              ) : (
                <IconCozUpload />
              )
            }
          >
            {loading
              ? I18n.t('imageflow_canvas_cancel_change', {}, '取消上传')
              : I18n.t('imageflow_canvas_change_img', {}, '更换图片')}
          </Button>
        )}
      </ImageUpload>
    </div>
  );
};
