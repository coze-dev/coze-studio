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

import { Document, Page, pdfjs } from 'react-pdf';
import { useEffect, useRef, useState } from 'react';

import { produce } from 'immer';
import Cropper from 'cropperjs';
import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozArrowLeft,
  IconCozArrowRight,
  IconCozMinus,
  IconCozPlus,
} from '@coze-arch/coze-design/icons';
import { Checkbox, Divider, IconButton, Loading } from '@coze-arch/coze-design';
import 'cropperjs/dist/cropper.css';

import {
  convertCropDataToPercentSize,
  convertPercentSizeToCropData,
} from '@/utils/convert-crop-data';
import {
  type CropperSizePercent,
  type FilterPageConfig,
  type PDFDocumentFilterValue,
} from '@/features/knowledge-type/text/interface';

export interface PDFDocumentProps {
  uri: string;
  url: string;
  onChange?: (props: PDFDocumentFilterValue) => void;
  className?: string;
  initPageCropperSizePercent: CropperSizePercent | null;
  filterPagesConfig: FilterPageConfig[];
  enableCropper: boolean;
}

pdfjs.GlobalWorkerOptions.workerSrc =
  REGION === 'cn'
    ? // cp-disable-next-line
      `//lf-cdn.coze.cn/obj/unpkg/pdfjs-dist/${pdfjs.version}/build/pdf.worker.min.mjs`
    : // cp-disable-next-line
      `//sf-cdn.coze.com/obj/unpkg-va/pdfjs-dist/${pdfjs.version}/build/pdf.worker.min.mjs`;

const getDefaultState = () => ({
  totalPages: 0,
  currentPage: 0,
  percentZoomRatio: 100,
});

const ZOOM_RATIO_STEP = 0.1;
const PERCENT = 100;

type ChangeZoomRatioOption = 'increase' | 'decrease';

const PDF_WIDTH = 484;

const PDF_HEIGHT = 624;

// eslint-disable-next-line @coze-arch/max-line-per-function
export const PDFDocument: React.FC<PDFDocumentProps> = ({
  uri,
  url,
  onChange,
  className,
  initPageCropperSizePercent,
  filterPagesConfig,
  enableCropper,
}) => {
  const {
    totalPages: defaultTotalPages,
    currentPage: defaultCurrentPage,
    percentZoomRatio: defaultPercentZoomRatio,
  } = getDefaultState();
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(defaultTotalPages);
  const [currentPage, setCurrentPage] = useState(defaultCurrentPage);
  const [percentZoomRatio, setPercentZoomRation] = useState(
    defaultPercentZoomRatio,
  );
  const pageCanvasRef = useRef<HTMLCanvasElement>(null);
  const cropperRef = useRef<Cropper>();

  const onPDFLoadSuccess = ({ numPages }: { numPages: number }) => {
    setCurrentPage(1);
    setTotalPages(numPages);
  };

  const initCropper = () => {
    if (!enableCropper) {
      return;
    }

    if (!pageCanvasRef.current) {
      return;
    }

    const pdfSize = {
      naturalHeight: pageCanvasRef.current.height,
      naturalWidth: pageCanvasRef.current.width,
    };

    cropperRef.current = new Cropper(pageCanvasRef.current, {
      dragMode: 'crop',
      zoomable: true,
      zoomOnWheel: false,
      viewMode: 2,
      modal: false,
      background: false,
      highlight: true,
      crop: event => {
        onChange?.({
          uri,
          filterPagesConfig,
          cropperSizePercent: convertCropDataToPercentSize({
            data: event.detail,
            pdfSize,
          }),
        });
      },
      data: initPageCropperSizePercent
        ? convertPercentSizeToCropData({
            cropSizePercent: initPageCropperSizePercent,
            pdfSize,
          })
        : undefined,
    });
  };

  const getChangedPercentZoomRatio = (
    currentPercentRatio: number,
    option: ChangeZoomRatioOption,
  ) => {
    const percentRatioStep = ZOOM_RATIO_STEP * PERCENT;
    if (option === 'decrease') {
      return currentPercentRatio - percentRatioStep;
    }
    return currentPercentRatio + percentRatioStep;
  };

  const changeZoomRatio = (option: ChangeZoomRatioOption) => {
    setPercentZoomRation(prev => {
      const currentPercentRatio = getChangedPercentZoomRatio(prev, option);
      cropperRef.current?.zoomTo(currentPercentRatio / PERCENT);
      return currentPercentRatio;
    });
  };

  const increaseZoomRatio = () => {
    changeZoomRatio('increase');
  };

  const decreaseZoomRatio = () => {
    changeZoomRatio('decrease');
  };

  const onPageRenderSuccess = () => {
    setLoading(false);
    initCropper();
  };

  const nextPage = () => {
    setCurrentPage(p => Math.min(p + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage(p => Math.max(p - 1, 1));
  };

  const onCurrentPageChange = () => {
    setLoading(true);
    return () => {
      cropperRef.current?.destroy();
    };
  };

  const reset = () => {
    const {
      currentPage: _currentPage,
      totalPages: _totalPages,
      percentZoomRatio: _percentZoomRatio,
    } = getDefaultState();
    setCurrentPage(_currentPage);
    setTotalPages(_totalPages);
    setPercentZoomRation(_percentZoomRatio);
    cropperRef.current?.destroy();
  };

  useEffect(onCurrentPageChange, [currentPage]);

  useEffect(() => reset, [uri]);

  return (
    <div
      className={classNames('relative flex justify-center py-16px', className)}
    >
      {!loading ? (
        <div className="absolute left-8px top-8px">
          <Checkbox
            checked={
              filterPagesConfig.find(config => config.pageIndex === currentPage)
                ?.isFilter
            }
            onChange={e => {
              onChange?.(
                produce<PDFDocumentFilterValue>(
                  {
                    uri,
                    filterPagesConfig,
                    cropperSizePercent:
                      enableCropper && cropperRef.current
                        ? convertCropDataToPercentSize({
                            data: cropperRef.current.getData(),
                            pdfSize: cropperRef.current.getCanvasData(),
                          })
                        : null,
                  },
                  draft => {
                    const target = draft.filterPagesConfig.find(
                      config => config.pageIndex === currentPage,
                    );
                    if (!target) {
                      draft.filterPagesConfig.push({
                        pageIndex: currentPage,
                        isFilter: Boolean(e.target.checked),
                      });
                      return;
                    }
                    target.isFilter = Boolean(e.target.checked);
                  },
                ),
              );
            }}
          >
            {I18n.t('kl_write_106')}
          </Checkbox>
        </div>
      ) : null}
      {loading ? (
        <div
          className="absolute w-full flex items-center justify-center"
          style={{ height: PDF_HEIGHT }}
        >
          <Loading loading />
        </div>
      ) : null}

      <div style={{ height: PDF_HEIGHT, width: PDF_WIDTH }}>
        <Document
          className="w-full"
          file={url}
          onLoadSuccess={onPDFLoadSuccess}
          loading={null}
        >
          <Page
            loading={<Loading loading />}
            className="w-full"
            height={PDF_HEIGHT}
            width={PDF_WIDTH}
            canvasRef={pageCanvasRef}
            pageNumber={currentPage}
            onRenderSuccess={onPageRenderSuccess}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
      {!loading ? (
        <div className="absolute right-8px top-8px flex items-center p-[4px] rounded-normal coz-shadow-default">
          <IconButton
            onClick={prevPage}
            disabled={currentPage <= 1}
            icon={<IconCozArrowLeft />}
          />
          <div>
            {currentPage}/{totalPages}
          </div>
          <IconButton
            onClick={nextPage}
            disabled={currentPage >= totalPages}
            icon={<IconCozArrowRight />}
          />
          {enableCropper ? (
            <>
              <Divider margin={3} layout="vertical" />
              <IconButton
                disabled={percentZoomRatio <= defaultPercentZoomRatio}
                onClick={decreaseZoomRatio}
                icon={<IconCozMinus />}
              />
              <div>{percentZoomRatio}%</div>
              <IconButton onClick={increaseZoomRatio} icon={<IconCozPlus />} />
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
