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
import { Document, Page, pdfjs } from 'react-pdf';
import { useMemo, useRef, useState } from 'react';

import cls from 'classnames';
import { FixedSizeList as List, AutoSizer } from '@coze-common/virtual-list';
import { Spin } from '@coze-arch/coze-design';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

interface IUsePreviewPdfProps {
  fileUrl: string;
}

pdfjs.GlobalWorkerOptions.workerSrc =
  REGION === 'cn'
    ? // cp-disable-next-line
      `//lf-cdn.coze.cn/obj/unpkg/pdfjs-dist/${pdfjs.version}/build/pdf.worker.min.mjs`
    : // cp-disable-next-line
      `//sf-cdn.coze.com/obj/unpkg-va/pdfjs-dist/${pdfjs.version}/build/pdf.worker.min.mjs`;

const options = {
  cMapUrl:
    REGION === 'cn'
      ? // cp-disable-next-line
        `//lf-cdn.coze.cn/obj/unpkg/pdfjs-dist/${pdfjs.version}/cmaps/`
      : // cp-disable-next-line
        `//sf-cdn.coze.com/obj/unpkg-va/pdfjs-dist/${pdfjs.version}/cmaps/`,
  // Boost performance
  cMapPacked: true,
};

export const usePreviewPdf = (props: IUsePreviewPdfProps) => {
  const { fileUrl } = props;
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<List>(null);
  const [pageHeight, setPageHeight] = useState(
    containerRef.current?.clientHeight,
  );
  const itemSize = Math.floor((pageHeight ?? 500) + 20);

  const onNext = () => {
    if (currentPage < numPages - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      listRef.current?.scrollToItem(nextPage, 'start');
    }
  };

  const onBack = () => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      listRef.current?.scrollToItem(prevPage, 'start');
    }
  };

  const onDocumentLoadSuccess = ({
    numPages: totalPages,
  }: {
    numPages: number;
  }) => {
    setLoading(false);
    setNumPages(totalPages);
  };

  const handleScroll = ({ scrollOffset }: { scrollOffset: number }) => {
    const newIndex = Math.floor(scrollOffset / itemSize);
    setCurrentPage(newIndex);
  };

  const [scale, setScale] = useState(1);
  const increaseScale = () => {
    setScale(prevScale => Math.min(prevScale + 0.1, 2));
  };
  const decreaseScale = () => {
    setScale(prevScale => Math.max(prevScale - 0.1, 0.5));
  };

  const memoizedList = useMemo(
    () =>
      !loading ? (
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height ?? 0}
              itemCount={numPages}
              itemSize={itemSize}
              width={width ?? 0}
              onScroll={handleScroll}
              ref={listRef}
            >
              {({
                index,
                style,
              }: {
                index: number;
                style: React.CSSProperties;
              }) => (
                <div key={`page_${index + 1}`} style={style}>
                  <Page
                    pageNumber={index + 1}
                    className={cls(
                      'flex items-center justify-center !coz-bg-primary',
                    )}
                    width={(width ?? 100) - 32}
                    scale={scale}
                    onLoadSuccess={page => {
                      setPageHeight(page.height);
                    }}
                    loading={
                      <div
                        style={{
                          height: containerRef.current?.clientHeight,
                        }}
                      ></div>
                    }
                  />
                </div>
              )}
            </List>
          )}
        </AutoSizer>
      ) : null,
    [loading, numPages, pageHeight, scale, itemSize],
  );

  const pdfNode = (
    <>
      <div className="flex flex-col items-center w-full h-full relative coz-bg-primary">
        <div
          className={cls(
            'absolute top-0 left-0 right-0 bot-0 flex items-center justify-center h-full',
            'z-10',
            !loading && 'invisible',
          )}
        >
          <Spin />
        </div>
        <div
          className={cls(
            'flex absolute top-0 left-0 right-0 overflow-auto px-5 w-full h-full justify-center',
            loading && 'invisible',
          )}
          ref={containerRef}
        >
          <Document
            file={fileUrl}
            // bug fix https://github.com/wojtekmaj/react-pdf/issues/974
            key={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            options={options}
            className={cls('flex w-full h-full')}
            loading={
              <Spin
                wrapperClassName="w-full h-full"
                childStyle={{
                  width: containerRef.current?.clientWidth,
                  height: '100%',
                }}
              ></Spin>
            }
          >
            {containerRef.current ? memoizedList : null}
          </Document>
        </div>
      </div>
    </>
  );

  return {
    pdfNode,
    numPages,
    currentPage: currentPage + 1,
    onNext,
    onBack,
    scale,
    increaseScale,
    decreaseScale,
  };
};
