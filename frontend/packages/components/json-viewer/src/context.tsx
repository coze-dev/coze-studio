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
 
import React, {
  useCallback,
  useState,
  type PropsWithChildren,
  useEffect,
} from 'react';

import { createContext } from 'use-context-selector';
import { noop } from 'lodash-es';

import { type Field } from './types';

interface JsonViewerContextType {
  expand: Record<string, boolean> | null;
  onExpand: (path: string, val: boolean) => void;
}
interface JsonViewerProviderProps {
  fields: Field[];
  defaultExpandAllFields?: boolean;
}

/**
 * 根只有一项且其可以下钻时，默认展开它
 */
const generateInitialExpandValue = (fields: Field[], expandAll?: boolean) => {
  if (expandAll) {
    return setExpandAllFields(fields);
  }
  if (fields.length === 1 && fields[0]?.isObj) {
    return {
      [fields[0].path.join('.')]: true,
    };
  }
  return null;
};

const setExpandAllFields = (fields: Field[]) =>
  fields.reduce(
    (acc, field) => ({
      ...acc,
      [field.path.join('.')]: true,
      ...setExpandAllFields(field.children),
    }),
    {},
  );

export const JsonViewerContext = createContext<JsonViewerContextType>({
  expand: {},
  onExpand: noop,
});

export const JsonViewerProvider: React.FC<
  PropsWithChildren<JsonViewerProviderProps>
> = ({ fields, children, defaultExpandAllFields }) => {
  /** 因为存在不属于单项的逻辑，所以集中管理展开折叠的状态 */
  const [expand, setExpand] = useState<JsonViewerContextType['expand'] | null>(
    null,
  );
  const handleExpand = useCallback(
    (path: string, val: boolean) => setExpand(e => ({ ...e, [path]: val })),
    [setExpand],
  );

  /**
   * fields 是动态更新的，这里要注意固化 expand 数据，因为 fields 总是由少增多
   * 由于存在自动展开逻辑，所以从 0 => 1 变化时需要赋值
   */
  useEffect(() => {
    if (!expand) {
      const autoExpand = generateInitialExpandValue(
        fields,
        defaultExpandAllFields,
      );
      if (autoExpand) {
        setExpand(autoExpand);
      }
    }
  }, [expand, fields, setExpand, defaultExpandAllFields]);
  return (
    <JsonViewerContext.Provider value={{ expand, onExpand: handleExpand }}>
      {children}
    </JsonViewerContext.Provider>
  );
};
