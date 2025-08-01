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

import classnames from 'classnames';
import {
  usePreviewPdf,
  PreviewMd,
  PreviewTxt,
} from '@coze-data/knowledge-common-components';
import {
  IconCozArrowLeft,
  IconCozArrowRight,
  IconCozMinus,
  IconCozPlus,
} from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

export interface FilePreviewProps {
  fileType?: string;
  fileUrl: string;
  visible: boolean;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  fileType,
  fileUrl,
  visible,
}) => {
  const {
    pdfNode,
    numPages,
    currentPage,
    onNext,
    onBack,
    scale,
    increaseScale,
    decreaseScale,
  } = usePreviewPdf({
    fileUrl,
  });

  return (
    <div
      className={classnames(
        'w-full h-full',
        'border border-solid coz-stroke-primary border-t-0 border-b-0 border-l-0',
        'flex flex-col items-center overflow-auto',
        !visible && 'hidden',
      )}
    >
      {(() => {
        if (fileType === 'md') {
          return <PreviewMd fileUrl={fileUrl} />;
        }

        if (fileType === 'txt') {
          return <PreviewTxt fileUrl={fileUrl} />;
        }

        if (['docx', 'pdf', 'doc'].includes(fileType ?? '')) {
          return (
            <div className="grow w-full relative">
              {numPages >= 1 ? (
                <div
                  className={classnames(
                    'flex w-fit h-[32px] items-center justify-center gap-[3px] absolute top-[8px] right-[8px]',
                    'coz-bg-max rounded-[8px] coz-shadow-default',
                    'z-10',
                    'px-[8px]',
                  )}
                >
                  <IconButton
                    icon={<IconCozArrowLeft />}
                    size="small"
                    color="secondary"
                    onClick={onBack}
                  ></IconButton>
                  <div className="coz-fg-secondary text-[12px] font-[400] leading-[24px]">
                    {currentPage} / {numPages}
                  </div>
                  <IconButton
                    icon={<IconCozArrowRight />}
                    size="small"
                    color="secondary"
                    onClick={onNext}
                  />
                  <div className="w-[1px] h-[12px] coz-mg-primary"></div>
                  <IconButton
                    icon={<IconCozMinus />}
                    size="small"
                    color="secondary"
                    onClick={decreaseScale}
                  />
                  <div className="coz-fg-secondary text-[12px] font-[400] leading-[16px]">
                    {Math.round(scale * 100)}%
                  </div>
                  <IconButton
                    icon={<IconCozPlus />}
                    size="small"
                    color="secondary"
                    onClick={increaseScale}
                  />
                </div>
              ) : null}
              {pdfNode}
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
};
