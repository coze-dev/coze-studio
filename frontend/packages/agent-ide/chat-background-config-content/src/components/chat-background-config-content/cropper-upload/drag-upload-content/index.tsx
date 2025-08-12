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

import { useState, type ReactNode } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Popover } from '@coze-arch/bot-semi';
import { IconUpload, IconInfo } from '@coze-arch/bot-icons';
import { Button } from '@coze-arch/coze-design';

import IMG_SIZE_TIP from '../../assets/image.png';

import s from './index.module.less';
interface DragContentProps {
  icon: ReactNode;
  title: string;
  tip?: ReactNode;
  desc: string;
  btnText: string;
  btnOnClick?: () => void;
}

export const DragContent: React.FC<DragContentProps> = ({
  icon,
  title,
  desc,
  btnOnClick,
  btnText,
  tip,
}) => (
  <div className="flex items-center	flex-col m-auto">
    <div className="mb-4 w-6 h-6">{icon}</div>
    <div className="text-xxl	text-[#1C1F23] font-medium flex items-center gap-1/2">
      {title}
      {tip}
    </div>
    <div className="text-xs	text-[#888D92] mb-4 mt-1">{desc}</div>
    {btnOnClick ? (
      <Button
        onClick={btnOnClick}
        color="primary"
        className="!coz-fg-primary !coz-mg-primary"
      >
        {btnText}
      </Button>
    ) : null}
  </div>
);

interface DragUploadContentProps {
  manualUpload?: () => void;
  mode?: 'init' | 'fill';
  renderEnhancedUpload?: () => ReactNode;
}

export const DragUploadContent: React.FC<DragUploadContentProps> = ({
  manualUpload,
  renderEnhancedUpload,
  mode = 'init',
}) => {
  const [dragIn, setDragIn] = useState(false);
  const customUpload = (
    <DragContent
      icon={<IconUpload className={s.icon} />}
      title={I18n.t('upload_image_guide')}
      tip={
        <Popover
          position="top"
          content={
            <div className="p-4 w-[240px]">
              <div className="coz-fg-plus font-semi">
                {I18n.t('bgi_upload_image_format_requirement_title')}
              </div>
              <div className="coz-fg-secondary text-xs">
                {I18n.t('bgi_upload_image_format_requirement')}
              </div>
              <img src={IMG_SIZE_TIP} className="w-full mt-3" />
            </div>
          }
        >
          <Button
            icon={<IconInfo />}
            color="primary"
            size={'mini'}
            className={'!bg-transparent'}
          />
        </Popover>
      }
      desc={I18n.t('upload_image_format_requirement')}
      btnText={I18n.t('upload_image')}
      btnOnClick={manualUpload}
    />
  );
  return mode === 'init' ? (
    <div
      className={`w-full flex items-center flex-col	p-16  border border-dashed  rounded-[6px] h-[466px] mb-6 ${
        dragIn
          ? 'coz-stroke-hglt coz-bg-primary'
          : 'coz-stroke-primary coz-bg-max'
      }`}
      onClick={e => e.stopPropagation()}
      onDragEnter={() => {
        setDragIn(true);
      }}
      onDragLeave={() => {
        setDragIn(false);
      }}
    >
      {customUpload}
      {renderEnhancedUpload?.()}
    </div>
  ) : (
    <div className="opacity-80	coz-bg-max w-full h-full flex items-center flex-col justify-center">
      {customUpload}
    </div>
  );
};
