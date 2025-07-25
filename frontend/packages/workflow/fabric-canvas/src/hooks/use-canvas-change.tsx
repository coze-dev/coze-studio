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

import { cloneDeep } from 'lodash-es';
import { type Canvas, type CanvasEvents, type FabricObject } from 'fabric';
import { useLatest } from 'ahooks';
import {
  ViewVariableType,
  type InputVariable,
} from '@coze-workflow/base/types';
import { I18n } from '@coze-arch/i18n';
import { getUploadCDNAsset } from '@coze-workflow/base-adapter';

import { createElement, defaultProps } from '../utils';
import {
  Mode,
  UNKNOWN_VARIABLE_NAME,
  type FabricObjectWithCustomProps,
  type FabricSchema,
  type VariableRef,
} from '../typings';

const ImagePlaceholder = `${getUploadCDNAsset('')}/workflow/fabric-canvas/img-placeholder.png`;

// 需要额外保存的属性
export const saveProps = [
  'width',
  'height',
  'editable',
  'text',
  'backgroundColor',
  'padding',
  // 自定义参数
  //  textBox 的真实高度
  'customFixedHeight',
  // 元素 id
  'customId',
  // 元素类型
  'customType',
  // image 的适应模式
  'customFixedType',
  // // 由变量生成元素的 title
  // 引用关系
  'customVariableRefs',
];

export const useCanvasChange = ({
  variables,
  canvas,
  onChange,
  schema,
  listenerEvents = [
    'object:modified',
    'object:added',
    'object:removed',
    'object:moving',
    'object:modified-zIndex',
  ],
}: {
  variables?: InputVariable[];
  canvas?: Canvas;
  onChange?: (schema: FabricSchema) => void;
  schema?: FabricSchema;
  listenerEvents?: (
    | 'object:modified'
    | 'object:added'
    | 'object:removed'
    | 'object:moving'
    | 'object:modified-zIndex'
  )[];
}) => {
  const eventDisposers = useRef<(() => void)[]>([]);

  const [isListen, setIsListener] = useState(true);
  const onChangeLatest = useLatest(onChange);
  const schemaLatest = useLatest(schema);
  const cacheCustomVariableRefs = useRef<VariableRef[]>(
    schema?.customVariableRefs ?? [],
  );

  // 删除画布中不存在的引用关系
  const resetCustomVariableRefs = useCallback(
    ({ schema: _schema }: { schema: FabricSchema }) => {
      let newCustomVariableRefs = cacheCustomVariableRefs.current;

      const allObjectIds = _schema.objects.map(d => d.customId);
      newCustomVariableRefs = newCustomVariableRefs?.filter(d =>
        allObjectIds.includes(d.objectId),
      );
      cacheCustomVariableRefs.current = newCustomVariableRefs;

      return newCustomVariableRefs;
    },
    [],
  );

  // 监听画布变化
  useEffect(() => {
    if (canvas && onChangeLatest.current && isListen) {
      const _onChange = ({ isRemove }: { isRemove: boolean }) => {
        const json = canvas.toObject(saveProps) as FabricSchema;
        // 删除时，顺便删掉无效 ref
        if (isRemove) {
          json.customVariableRefs = resetCustomVariableRefs({
            schema: json,
          });
        } else {
          json.customVariableRefs = cloneDeep(cacheCustomVariableRefs.current);
        }

        onChangeLatest.current?.(json);
      };

      eventDisposers.current.forEach(disposer => disposer());
      eventDisposers.current = [];

      listenerEvents.forEach(event => {
        const disposer = canvas.on(event as keyof CanvasEvents, function (e) {
          _onChange({
            isRemove: event === 'object:removed',
          });
        });
        eventDisposers.current.push(disposer);
      });
    }
    return () => {
      eventDisposers.current.forEach(disposer => disposer?.());
      eventDisposers.current = [];
    };
  }, [canvas, isListen]);

  /**
   * 生成带引用的新元素
   */
  const addRefObjectByVariable = useCallback(
    async (variable: InputVariable, element?: FabricObject) => {
      if (!canvas) {
        return;
      }
      const {
        customVariableRefs = [],
        width = 0,
        height = 0,
      } = schemaLatest.current ?? {};

      const { id, name, type } = variable;
      const centerXY = [
        width / 2 + customVariableRefs.length * 16,
        height / 2 + customVariableRefs.length * 16,
      ];

      let _element: FabricObject | undefined = element;

      // 如果没有传入现有元素,则创建新元素
      if (!_element) {
        if (type === ViewVariableType.Image) {
          _element = await createElement({
            mode: Mode.IMAGE,
            position: [
              centerXY[0] - (defaultProps[Mode.IMAGE].width as number) / 2,
              centerXY[1] - (defaultProps[Mode.IMAGE].height as number) / 2,
            ],
            elementProps: {
              width: defaultProps[Mode.IMAGE].width,
              height: defaultProps[Mode.IMAGE].width,
              editable: false,
              src: ImagePlaceholder,
            },
          });
        } else if (type === ViewVariableType.String) {
          _element = await createElement({
            mode: Mode.BLOCK_TEXT,
            position: [
              centerXY[0] - (defaultProps[Mode.BLOCK_TEXT].width as number) / 2,
              centerXY[1] -
                (defaultProps[Mode.BLOCK_TEXT].height as number) / 2,
            ],
            elementProps: {
              text: I18n.t(
                'imageflow_canvas_change_text',
                {},
                '点击编辑文本预览',
              ),
              width: defaultProps[Mode.BLOCK_TEXT].width,
              height: defaultProps[Mode.BLOCK_TEXT].height,
            },
          });
        }
      }

      if (_element) {
        // 更新引用关系
        cacheCustomVariableRefs.current.push({
          variableId: id as string,
          objectId: (_element as FabricObjectWithCustomProps)
            .customId as string,
          variableName: name,
        });

        // 添加到画布并激活
        canvas.add(_element);
        canvas.setActiveObject(_element);
      }
    },
    [canvas],
  );

  /**
   * 更新指定 objectId 的元素的引用关系
   * 如果 variable 为空，则删除引用
   * 如果 variable 不为空 && customVariableRefs 已存在对应关系，则更新引用
   * 如果 variable 不为空 && customVariableRefs 不存在对应关系，则新增引用
   *
   */
  const updateRefByObjectId = useCallback(
    ({
      objectId,
      variable,
    }: {
      objectId: string;
      variable?: InputVariable;
    }) => {
      const customVariableRefs = cacheCustomVariableRefs.current;
      const targetRef = customVariableRefs.find(d => d.objectId === objectId);
      let newCustomVariableRefs = [];
      // 如果 variable 为空，则删除引用
      if (!variable) {
        newCustomVariableRefs = customVariableRefs.filter(
          d => d.objectId !== objectId,
        );
        // 如果 variable 不为空 && customVariableRefs 不存在对应关系，则新增引用
      } else if (!targetRef) {
        newCustomVariableRefs = [
          ...customVariableRefs,
          {
            variableId: variable.id as string,
            objectId,
            variableName: variable.name,
          },
        ];
        // 如果 variable 不为空 && customVariableRefs 已存在对应关系，则更新引用
      } else {
        newCustomVariableRefs = customVariableRefs.map(d => {
          if (d.objectId === objectId) {
            return {
              ...d,
              variableId: variable.id as string,
              variableName: variable.name,
            };
          }
          return d;
        });
      }

      cacheCustomVariableRefs.current = newCustomVariableRefs;
      onChangeLatest.current?.({
        ...(schemaLatest.current as FabricSchema),
        customVariableRefs: newCustomVariableRefs,
      });
    },
    [onChangeLatest, schemaLatest],
  );

  /**
   * variables 变化时，更新引用关系中的变量名
   */
  useEffect(() => {
    const { customVariableRefs = [] } = schemaLatest.current ?? {};
    const needsUpdate = customVariableRefs.some(ref => {
      const variable = variables?.find(v => v.id === ref.variableId);
      return ref.variableName !== (variable?.name ?? UNKNOWN_VARIABLE_NAME);
    });

    if (needsUpdate) {
      const newCustomVariableRefs = customVariableRefs.map(ref => {
        const variable = variables?.find(v => v.id === ref.variableId);
        return {
          ...ref,
          variableName: variable?.name ?? UNKNOWN_VARIABLE_NAME,
        };
      });

      cacheCustomVariableRefs.current = newCustomVariableRefs;
      onChangeLatest.current?.({
        ...(schemaLatest.current as FabricSchema),
        customVariableRefs: newCustomVariableRefs,
      });
    }
  }, [variables]);

  const stopListen = useCallback(() => {
    setIsListener(false);
  }, []);

  const startListen = useCallback(() => {
    setIsListener(true);
    // redo undo 完成后，更新引用关系
    cacheCustomVariableRefs.current =
      schemaLatest.current?.customVariableRefs ?? [];
  }, []);

  return {
    customVariableRefs: cacheCustomVariableRefs.current,
    addRefObjectByVariable,
    updateRefByObjectId,
    stopListen,
    startListen,
  };
};
