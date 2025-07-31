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
  memo,
  useCallback,
  useMemo,
  useState,
  type FC,
  type ReactElement,
} from 'react';

import classNames from 'classnames';
import { useLatest } from 'ahooks';
import { ConfigProvider, Tooltip } from '@coze-arch/coze-design';

import { setters } from '../setters';
import { PopInScreen } from '../pop-in-screen';
import { schemaToFormValue } from '../../utils';
import {
  REF_VARIABLE_ID_PREFIX,
  type FabricObjectSchema,
  type FabricObjectWithCustomProps,
  type FabricSchema,
  type FormMeta,
  type FormMetaItem,
} from '../../typings';
import { formMetas } from './form-meta';

const schemaItemToNode = (props: {
  metaItem: FormMetaItem;
  value: unknown;
  tooltipVisible?: boolean;
  isRefElement: boolean;
  onChange: (v: unknown) => void;
}) => {
  const { metaItem, value, onChange, tooltipVisible, isRefElement } = props;
  const { setter, setterProps, title } = metaItem;
  let dom: ReactElement | string = setter as string;

  if (typeof setter === 'function') {
    dom = setter({
      value,
      onChange,
      tooltipVisible,
    });
  }

  if (typeof setter === 'string' && setters[setter]) {
    const Setter = setters[setter];
    dom = (
      <Setter
        value={value}
        onChange={onChange}
        isRefElement={isRefElement}
        {...setterProps}
      />
    );
  }

  return [
    title ? (
      <div className="w-full text-[14px] font-medium">{title}</div>
    ) : undefined,
    <div className="flex items-center gap-[2px] text-[16px]">{dom}</div>,
  ];
};

const FormItem = memo(
  (props: {
    metaItem: FormMetaItem;
    isLast: boolean;
    isRow: boolean;
    // Specialized for the image upload component, you need to set different labels according to whether it is a reference element.
    isRefElement: boolean;
    formValue: Partial<FabricObjectSchema>;
    onChange: (v: Partial<FabricObjectSchema>, cacheSave?: boolean) => void;
  }) => {
    const { metaItem, isLast, isRow, formValue, onChange, isRefElement } =
      props;
    const { name = '', tooltip, splitLine, visible } = metaItem;
    const _splitLine = splitLine ?? (isRow && !isLast ? true : false);

    const [tooltipVisible, setTooltipVisible] = useState(false);
    const _visible = visible?.(formValue) ?? true;
    if (!_visible) {
      return <></>;
    }

    return (
      <>
        <div key={`form-item-${name}`} className="flex flex-col gap-[12px]">
          {tooltip ? (
            <Tooltip
              onVisibleChange={setTooltipVisible}
              showArrow={false}
              position={'bottom'}
              trigger="click"
              style={{
                maxWidth: 'unset',
              }}
              spacing={{
                y: 12,
                x: 0,
              }}
              content={
                <div
                  key={`tooltip-${name}`}
                  className="flex flex-col gap-[12px]"
                >
                  {tooltip.content
                    .filter(d => {
                      const _v = d.visible?.(formValue) ?? true;
                      return _v;
                    })
                    .map(d =>
                      schemaItemToNode({
                        metaItem: d,
                        value: formValue[d.name ?? ''],
                        isRefElement,
                        onChange: v => {
                          onChange(
                            {
                              [d.name ?? '']: v,
                            },
                            d.cacheSave,
                          );
                        },
                      }),
                    )}
                </div>
              }
            >
              {schemaItemToNode({
                metaItem,
                value: formValue[name],
                isRefElement,
                tooltipVisible,
                onChange: v => {
                  onChange(
                    {
                      [name]: v,
                    },
                    metaItem.cacheSave,
                  );
                },
              })}
            </Tooltip>
          ) : (
            schemaItemToNode({
              metaItem,
              value: formValue[name],
              isRefElement,
              onChange: v => {
                onChange(
                  {
                    [name]: v,
                  },
                  metaItem.cacheSave,
                );
              },
            })
          )}
        </div>
        {_splitLine ? (
          isRow ? (
            <div
              key={`split-${name}`}
              className="w-[1px] h-[24px] coz-mg-primary-pressed"
            />
          ) : (
            <div
              key={`split-${name}`}
              className="w-full h-[1px] coz-mg-primary-pressed"
            />
          )
        ) : undefined}
      </>
    );
  },
);

interface IProps {
  position: { tl: { x: number; y: number }; br: { x: number; y: number } };
  onChange: (value: Partial<FabricObjectSchema>) => void;
  offsetY?: number;
  offsetX?: number;
  schema: FabricSchema;
  activeObjects: FabricObjectWithCustomProps[];
  canvasHeight?: number;
  limitRect?: {
    width: number;
    height: number;
  };
}

export const Form: FC<IProps> = props => {
  const {
    position,
    offsetY = 10,
    offsetX = 0,
    schema,
    activeObjects,
    onChange,
    limitRect,
    canvasHeight,
  } = props;
  const { tl, br } = position;
  const x = tl.x + (br.x - tl.x) / 2;
  let { y } = br;

  let showPositionY: 'bottom-center' | 'top-center' = 'bottom-center';
  if (canvasHeight && tl.y + (br.y - tl.y) / 2 > canvasHeight / 2) {
    y = tl.y;
    showPositionY = 'top-center';
  }

  const formMeta = useMemo<FormMeta>(
    () =>
      formMetas[
        (activeObjects[0] as FabricObjectWithCustomProps).customType
      ] as FormMeta,
    [activeObjects],
  );

  // Temporary saving of form values that do not need to be saved to the schema
  const [cacheFormValue, setCacheFormValue] = useState<
    Partial<FabricObjectSchema>
  >({});

  const formValue = {
    ...schemaToFormValue({
      schema,
      activeObjectId: activeObjects[0].customId,
      formMeta,
    }),
    ...cacheFormValue,
  };

  const isRow = formMeta.display === 'row';
  const isCol = formMeta.display === 'col';

  const latestCacheFromValue = useLatest(cacheFormValue);
  const _onChange = useCallback(
    (v: Partial<FabricObjectSchema>, cacheSave?: boolean) => {
      if (!cacheSave) {
        onChange(v);
      }

      setCacheFormValue({
        ...latestCacheFromValue.current,
        ...v,
      });
    },
    [onChange],
  );

  const fields = useMemo(
    () =>
      formMeta.content.map((metaItem, i) => {
        const isLast = i === formMeta.content.length - 1;
        return (
          <FormItem
            key={metaItem.name}
            formValue={formValue}
            metaItem={metaItem}
            isLast={isLast}
            isRow={isRow}
            onChange={_onChange}
            isRefElement={activeObjects[0].customId.startsWith(
              REF_VARIABLE_ID_PREFIX,
            )}
          />
        );
      }),
    [formMeta, isRow, isCol, _onChange, formValue],
  );

  return (
    <ConfigProvider getPopupContainer={() => document.body}>
      <PopInScreen
        left={x + offsetX}
        top={y + offsetY + (showPositionY === 'top-center' ? -10 : 10)}
        position={showPositionY}
        limitRect={limitRect}
      >
        <div
          tabIndex={0}
          style={{
            ...(formMeta.style ?? {}),
          }}
          onClick={e => {
            e.stopPropagation();
          }}
        >
          <div
            className={classNames([
              'flex gap-[12px]',
              {
                'flex-col': isCol,
                'flex-row items-center': isRow,
              },
            ])}
          >
            {fields}
          </div>
        </div>
      </PopInScreen>
    </ConfigProvider>
  );
};
