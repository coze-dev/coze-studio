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

import { useState, type FC } from 'react';

import classNames from 'classnames';
import {
  isGrabTextNode,
  isGrabLink,
  isGrabImage,
} from '@coze-common/text-grab';
import { type GrabNode } from '@coze-common/text-grab';
import { useShowBackGround } from '@coze-common/chat-area';
import { Image, ImagePreview } from '@coze-arch/coze-design';

import { typeSafeQuoteNodeColorVariants } from '../variants';
import DefaultImage from '../../assets/image-default.png';

import styles from './index.module.less';

const getQuoteNode = ({
  nodeList,
  theme,
  handleClickImage,
  showBackground,
}: {
  nodeList: GrabNode[];
  theme: 'white' | 'black';
  handleClickImage: (url: string) => void;
  showBackground: boolean;
}): React.ReactNode =>
  nodeList.map((node, index) => {
    if (isGrabTextNode(node)) {
      return (
        <span
          className={classNames('text-[14px] align-middle', 'leading-[16px]', {
            'coz-fg-secondary': theme === 'black',
            [typeSafeQuoteNodeColorVariants({ showBackground })]:
              theme === 'white',
          })}
          key={index}
        >
          {node.text}
        </span>
      );
    }

    if (isGrabImage(node)) {
      return (
        <Image
          className={classNames(
            styles.image,
            'w-[24px] h-[24px] leading-[24px] align-middle rounded-[4px] cursor-zoom-in',
            {
              'mx-[4px]': index !== 0,
              'mr-[4px]': index === 0,
            },
          )}
          src={node.src}
          onClick={() => handleClickImage(node.src)}
          key={index}
          fallback={DefaultImage}
          preview={false}
        />
      );
    }

    if (isGrabLink(node)) {
      return (
        <span
          className={classNames('text-[14px] align-middle', 'leading-[16px]', {
            'coz-fg-secondary': theme === 'black',
            [typeSafeQuoteNodeColorVariants({ showBackground })]:
              theme === 'white',
          })}
          key={index}
        >
          [
          {getQuoteNode({
            nodeList: node.children,
            theme,
            handleClickImage,
            showBackground,
          })}
          ]
        </span>
      );
    }

    return null;
  });

export const QuoteNode: FC<{
  nodeList: GrabNode[];
  theme: 'white' | 'black';
}> = ({ nodeList, theme }) => {
  const [previewUrl, setPreviewUrl] = useState('');
  const showBackground = useShowBackGround();
  const handleClickImage = (url: string) => {
    setPreviewUrl(url);
  };

  return (
    <>
      <ImagePreview
        src={previewUrl}
        visible={Boolean(previewUrl)}
        onVisibleChange={() => setPreviewUrl('')}
      />
      {getQuoteNode({
        nodeList,
        theme,
        handleClickImage,
        showBackground,
      })}
    </>
  );
};
