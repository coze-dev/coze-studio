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

import { useMemo } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Tag } from '@coze-arch/coze-design';
import { IconSpin } from '@douyinfe/semi-icons';

import s from './cropper-cover.module.less';
interface CropperCoverProps {
  loading: boolean;
  mode: 'pc' | 'mobile';
  hasUrl: boolean;
}

const Config = {
  pc: [
    {
      width: 300,
      height: 45,
    },
    {
      width: 300,
      height: 34,
    },
    {
      width: 73,
      height: 24,
    },
  ],

  mobile: [
    {
      width: 186,
      height: 63,
    },
    {
      width: 185,
      height: 28,
    },
    {
      width: 60,
      height: 20,
    },
  ],
};

const BubbleContent = ({
  bg,
  width,
  height,
  rounded,
  className,
}: {
  bg: string;
  width: number;
  height: number;
  rounded: string;
  className: string;
}) => (
  <div
    className={`rounded-${rounded} ${className}`}
    style={{
      background: bg,
      width,
      height,
      backdropFilter: 'blur(6px)',
    }}
  ></div>
);

const AvaterContent = ({ bg, size }: { bg: string; size: number }) => (
  <div
    className={`bg-[${bg}] rounded-full`}
    style={{
      background: bg,
      width: size,
      height: size,
    }}
  ></div>
);

export const CropperCover: React.FC<CropperCoverProps> = ({
  mode,
  loading = false,
  hasUrl = false,
}) =>
  useMemo(
    () => (
      <div className="w-full h-full p-2 absolute z-[200] pointer-events-none ">
        <div className="flex gap-2 mb-6">
          <Tag
            color="primary"
            prefixIcon={null}
            // The background cover color is suitable here, and the color is fixed and does not change.
            className="!text-white !bg-[rgba(0,0,0,0.28)]"
          >
            {mode === 'pc'
              ? I18n.t('display_on_widescreen')
              : I18n.t('display_on_vertical_screen')}
          </Tag>
          {loading ? (
            <Tag
              color="primary"
              prefixIcon={<IconSpin spin />}
              className="!text-white !bg-[rgba(0,0,0,0.28)]"
            >
              {I18n.t('knowledge_insert_img_009')}
            </Tag>
          ) : null}
        </div>
        <div className="flex justify-center">
          <div className={mode === 'pc' ? 'w-[326px]' : 'w-[205px]'}>
            {Config[mode].map((item, index) => {
              const notHasBackground = loading || !hasUrl;
              const background = notHasBackground
                ? index === 1
                  ? '#4E40E5'
                  : '#F4F4F6'
                : index === 1
                ? 'rgba(6, 7, 9, 0.24)'
                : 'rgba(255, 255, 255, 0.60)';
              return (
                <div className="flex gap-1 mb-2" key={index}>
                  <AvaterContent
                    size={mode === 'pc' ? 18 : 16}
                    bg={background}
                  />
                  <div>
                    <div
                      className={classNames(s.text, {
                        [s.shadow]: !notHasBackground,
                        'coz-fg-dim': notHasBackground,
                        'text-white': !notHasBackground,
                      })}
                    >
                      {index === 1 ? 'Glory' : 'Coze'}
                    </div>
                    <BubbleContent
                      width={item.width}
                      height={item.height}
                      bg={background}
                      rounded="lg"
                      className={classNames({
                        [s['background-border']]: !notHasBackground,
                        [s.default]: notHasBackground,
                      })}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    ),
    [mode, loading, hasUrl],
  );
