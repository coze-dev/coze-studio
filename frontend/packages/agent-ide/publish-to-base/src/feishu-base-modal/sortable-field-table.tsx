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

import {
  type ComponentType,
  type CSSProperties,
  type FC,
  forwardRef,
  type JSX,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import classNames from 'classnames';
import { SortableList } from '@coze-studio/components/sortable-list';
import { type ITemRenderProps, type ConnectDnd } from '@coze-studio/components';
import { IconCozHandle, IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';

import { MdTooltip } from '../md-tooltip';

export interface HeaderItem {
  name: string;
  required: boolean;
  width: number;
  tooltip?: string;
  style?: CSSProperties;
}

export interface SortableFieldTableMethod {
  addRow: () => boolean;
}

export interface IData<Data extends object> {
  data: Data;
  deletable: boolean;
  getKey: (data: Data) => string;
  onDelete?: (data: Data) => void;
  bizComponent: ComponentType<{ data: Data }>;
  lineStyle?: CSSProperties;
  deleteButtonStyle?: CSSProperties;
}

interface SortableFieldTableProps<Data extends object> {
  className?: string;
  headers: HeaderItem[];
  data: IData<Data>[];
  getId: (data: IData<Data>) => string;
  onChange: (data: IData<Data>[]) => void;
  headless?: boolean;
  style?: CSSProperties;
  enabled: boolean;
  linesWrapper?: ComponentType;
}

const DefaultLinesWrapper: FC<PropsWithChildren> = ({ children }) => (
  <>{children}</>
);

export const SortableFieldTable = <T extends object>({
  className,
  headers,
  data,
  getId,
  onChange,
  headless,
  enabled,
  style,
  linesWrapper,
}: SortableFieldTableProps<T>): ReactElement => {
  const uniqueSymbol = useMemo(() => Symbol(), []);
  const LinesWrapper = linesWrapper || DefaultLinesWrapper;
  return (
    <div
      className={classNames(
        headless ? '' : 'coz-bg-primary',
        headless ? '' : 'coz-stroke-primary border-solid border-[1px]',
        'px-[12px] pt-[12px] pb-[12px]',
        'rounded-[8px]',
        className,
      )}
      style={style}
    >
      {headless ? null : <FieldTableHeader headers={headers} />}
      <LinesWrapper>
        <SortableList
          enabled={enabled}
          getId={getId}
          list={data}
          onChange={onChange}
          itemRender={ItemRender as never}
          type={uniqueSymbol}
        />
      </LinesWrapper>
    </div>
  );
};

const ItemRender = <Data extends object>(
  props: ITemRenderProps<IData<Data>>,
): JSX.Element => {
  const { data: bizProps } = props;
  const BizComponent = bizProps.bizComponent;
  return (
    <FieldSortLine
      gap={8}
      connect={props.connect}
      deletable={bizProps.deletable}
      onDelete={() => bizProps.onDelete?.(bizProps.data)}
      style={bizProps.lineStyle}
      deleteButtonStyle={bizProps.deleteButtonStyle}
    >
      <BizComponent key={bizProps.getKey(bizProps.data)} data={bizProps.data} />
    </FieldSortLine>
  );
};

const TableFieldLine = forwardRef<
  HTMLDivElement,
  PropsWithChildren<{
    className?: string;
    gap?: number;
    prefix?: ReactNode;
    style?: CSSProperties;
  }>
>(({ children, className, gap, prefix, style }, ref) => (
  <div
    className={classNames(className, 'flex items-center')}
    ref={ref}
    style={style}
  >
    {prefix}
    <div
      className="flex items-center w-full"
      style={{
        gap,
      }}
    >
      {children}
    </div>
  </div>
));

TableFieldLine.displayName = 'TableFieldLine';

const FieldSortLine: FC<
  PropsWithChildren<{
    deletable?: boolean;
    connect: ConnectDnd;
    gap?: number;
    style?: CSSProperties;
    deleteButtonStyle?: CSSProperties;
    onDelete: () => void;
  }>
> = ({
  children,
  deletable,
  connect,
  gap,
  style,
  onDelete,
  deleteButtonStyle,
}) => {
  const dropRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    connect(dropRef, dragRef);
  }, []);
  return (
    <TableFieldLine
      style={style}
      gap={gap}
      ref={dropRef}
      prefix={
        <div className="cursor-grab h-full mr-[4px] w-[12px]" ref={dragRef}>
          <IconCozHandle className="text-[12px]" />
        </div>
      }
    >
      {children}
      {deletable ? (
        <Button
          color="secondary"
          onClick={onDelete}
          style={deleteButtonStyle}
          icon={<IconCozTrashCan />}
        ></Button>
      ) : null}
    </TableFieldLine>
  );
};

const FieldTableHeader: FC<{ headers: HeaderItem[] }> = ({ headers }) => (
  <TableFieldLine
    className="border-0 border-b-[1px] coz-stroke-primary border-solid h-[28px] mb-[12px]"
    gap={8}
    prefix={
      <div
        style={{
          minWidth: 16,
        }}
      />
    }
  >
    {headers.map(header => (
      <div
        key={header.name}
        className={classNames(
          'text-[14px] coz-fg-secondary font-medium leading-[20px]',
          'inline-flex items-center',
        )}
        style={{
          width: header.width,
          ...header.style,
        }}
      >
        {header.name}
        {header.required ? <i className="coz-fg-hglt-red">*</i> : null}
        <MdTooltip content={header.tooltip} />
      </div>
    ))}
  </TableFieldLine>
);
