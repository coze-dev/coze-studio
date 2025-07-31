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

/* eslint-disable @coze-arch/max-line-per-function */
import { useCallback, useEffect, useRef, useState } from 'react';

import { throttle } from 'lodash-es';
import {
  initPdfJsWorker,
  getDocument,
  generatePdfAssetsUrl,
  type PDFDocumentProxy,
} from '@coze-arch/pdfjs-shadow';
import { logger } from '@coze-arch/logger';
import {
  IconCozDownload,
  IconCozArrowLeft,
  IconCozArrowRight,
} from '@coze-arch/coze-design/icons';
import { Spin, Button, Typography } from '@coze-arch/coze-design';

import { downloadFile, fetchResource } from '../../utils/download';
import { LoadError } from '../../common/load-error';
import { ReactComponent as IconPDF } from '../../assets/icon.svg';

import styles from './index.module.less';

initPdfJsWorker();

interface PdfPreviewContentProps {
  src: string;
  extraInfo?: Record<string, string>;
  onClose: VoidFunction;
}

export default function PdfPreviewContent({
  src,
  extraInfo,
  onClose,
}: PdfPreviewContentProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerStyle, setContainerStyle] = useState({});
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getDocument({
      url: src,
      cMapUrl: generatePdfAssetsUrl('cmaps'),
    })
      .promise.then(pdf => {
        setPdfDoc(pdf);
        setPageCount(pdf.numPages);
      })
      .catch(error => {
        setHasError(true);
        console.error('PdfPreviewContent error', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [src]);

  const renderPdfPage = useCallback(() => {
    if (!pdfDoc) {
      return;
    }
    pdfDoc.getPage(pageNumber).then(page => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const context = canvas.getContext('2d');
      if (!context) {
        return;
      }
      const deviceRatio = window.devicePixelRatio || 1;

      const pdfOriginViewport = page.getViewport({ scale: 1 });
      const windowHeight = window.innerHeight - (90 + 32);

      const realViewport = page.getViewport({
        scale: (windowHeight / pdfOriginViewport.height) * deviceRatio,
      });

      canvas.width = Math.floor(realViewport.width * deviceRatio);
      canvas.height = Math.floor(realViewport.height * deviceRatio);
      canvas.style.width = `${realViewport.width}px`;
      canvas.style.height = `${realViewport.height}px`;
      canvas.style.transform = `scale(${1 / deviceRatio})`;
      canvas.style.transformOrigin = '0 0';
      setContainerStyle({
        width: realViewport.width * (1 / deviceRatio),
      });

      const renderContext = {
        canvasContext: context,
        viewport: realViewport,
        transform: [deviceRatio, 0, 0, deviceRatio, 0, 0],
        enhanceTextSelection: true,
      };
      page.render(renderContext);
    });
  }, [pageNumber, pdfDoc]);

  const throttleRenderPdfPage = throttle(renderPdfPage);

  useEffect(() => {
    renderPdfPage();
  }, [renderPdfPage]);

  useEffect(() => {
    window.addEventListener('resize', throttleRenderPdfPage);

    return () => {
      window.removeEventListener('resize', throttleRenderPdfPage);
    };
  }, [throttleRenderPdfPage]);

  const changePage = (offset: number) => {
    setPageNumber(prevPageNum => prevPageNum + offset);
  };

  const handleDownload = async () => {
    try {
      setDownloadLoading(true);
      const blob = await fetchResource(src);
      downloadFile(blob, extraInfo?.fileName);
      setDownloadLoading(false);
    } catch (error) {
      logger.error({
        eventName: 'pdf-download',
        error: error as Error,
      });
      setDownloadLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start relative w-full h-full">
      <div
        ref={containerRef}
        style={{
          display: isLoading || hasError ? 'none' : 'block',
          ...containerStyle,
        }}
        className="rounded-lg overflow-hidden relative"
      >
        <div
          className="header flex items-center justify-between w-full px-6 bg-white py-4"
          style={{
            borderBottom:
              '1px solid var(--Stroke-COZ-stroke-primary, rgba(6, 7, 9, 0.10))',
          }}
        >
          <div className="flex items-center">
            <IconPDF />
            <Typography.Text
              className={styles['pdf-title']}
              ellipsis={{
                showTooltip: {
                  opts: {
                    content: extraInfo?.fileName || '--',
                  },
                },
              }}
            >
              {extraInfo?.fileName ?? '-'}
            </Typography.Text>
          </div>
          <div>
            <Button
              icon={<IconCozDownload />}
              color="secondary"
              className="w-4 h-4"
              loading={downloadLoading}
              onClick={() => {
                handleDownload();
              }}
            ></Button>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          className="max-h-full overflow-hidden rounded-b-lg bg-white"
        />
      </div>
      {!isLoading && !hasError && (
        <div className={styles['control-bar']}>
          <Button
            icon={<IconCozArrowLeft />}
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            color="secondary"
            className="w-4 h-4"
          ></Button>
          <span className={styles['page-number']}>
            {pageNumber}/{pageCount}
          </span>
          <Button
            icon={<IconCozArrowRight />}
            onClick={() => changePage(1)}
            disabled={pageNumber >= pageCount}
            color="secondary"
            className="w-4 h-4"
          ></Button>
        </div>
      )}
      {isLoading ? (
        <div className="absolute flex justify-center items-center top-0 right-0 bottom-0 left-0 h-full w-full pointer-events-none">
          <Spin />
        </div>
      ) : null}
      {hasError ? (
        <div className="w-full h-full flex justify-center items-center">
          <LoadError onClose={onClose} />
        </div>
      ) : null}
    </div>
  );
}
