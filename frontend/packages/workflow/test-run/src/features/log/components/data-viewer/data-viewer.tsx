import React, { useMemo } from 'react';

import { noop } from 'lodash-es';
import cls from 'classnames';

import { generateFields } from './utils/generate-field';
import type { JsonValueType } from './types';
import { JsonField } from './json-field';
import { DataViewerProvider } from './context';

import css from './data-viewer.module.less';

export interface DataViewerProps {
  /** 支持对象或者纯文本渲染 */
  data: JsonValueType;
  mdPreview?: boolean;
  className?: string;
  onPreview?: (value: string, path: string[]) => void;
  emptyPlaceholder?: string;
}

export const DataViewer: React.FC<DataViewerProps> = ({
  data,
  mdPreview = false,
  className,
  onPreview = noop,
  emptyPlaceholder,
}) => {
  const fields = useMemo(() => generateFields(data), [data]);
  const isTree = useMemo(() => fields.some(field => field.isObj), [fields]);
  const isEmpty = fields.length === 0;

  if (isEmpty && emptyPlaceholder) {
    return (
      <div className="text-xs flex items-center justify-center leading-4 coz-fg-dim">
        {emptyPlaceholder}
      </div>
    );
  }

  return (
    <div
      className={cls(css['json-viewer-wrapper'], className)}
      style={isTree ? { paddingLeft: '12px' } : {}}
      draggable
      onDragStart={e => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <DataViewerProvider fields={fields}>
        {fields.map(i => (
          <JsonField
            field={i}
            key={i.path.join('.')}
            mdPreview={mdPreview}
            onPreview={onPreview}
          />
        ))}
      </DataViewerProvider>
    </div>
  );
};
