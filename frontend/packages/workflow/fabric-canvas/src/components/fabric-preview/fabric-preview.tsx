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

import { useEffect, useRef, type FC } from 'react';

import { useSize } from 'ahooks';
import { I18n } from '@coze-arch/i18n';

import { type FabricSchema } from '../../typings';
import { useFabricPreview } from '../../hooks';

export interface IFabricPreview {
  schema: FabricSchema;
  showPlaceholder?: boolean;
}

export const FabricPreview: FC<IFabricPreview> = props => {
  const { schema, showPlaceholder } = props;
  const ref = useRef<HTMLCanvasElement>(null);

  const sizeRef = useRef(null);
  const size = useSize(sizeRef);

  const oldWidth = useRef(0);
  useEffect(() => {
    if (size?.width && !oldWidth.current) {
      oldWidth.current = size?.width || 0;
    }

    // To prevent jitter, update the width when the width changes > 20
    if (size?.width && size.width - oldWidth.current > 20) {
      oldWidth.current = size?.width || 0;
    }
  }, [size?.width]);

  const maxWidth = oldWidth.current;
  const maxHeight = 456;

  useFabricPreview({
    schema,
    ref,
    maxWidth,
    maxHeight,
    startInit: !!size?.width,
  });

  const isEmpty = schema.objects.length === 0;
  return (
    <div className="w-full relative">
      <div ref={sizeRef} className="w-full"></div>
      <canvas ref={ref} className="h-[0px]" />
      {isEmpty && showPlaceholder ? (
        <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center">
          <div className="text-[14px] coz-fg-secondary">
            {I18n.t('imageflow_canvas_double_click', {}, '双击开始编辑')}
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
