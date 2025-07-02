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

    // 防止抖动，当宽度变化 > 20 时才更新宽度
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
