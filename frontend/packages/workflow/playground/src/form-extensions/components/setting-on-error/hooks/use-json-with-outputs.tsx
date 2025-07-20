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
 
import { useMemo, useRef } from 'react';

import { isEqual, isNil } from 'lodash-es';
import { type ViewVariableTreeNode } from '@coze-workflow/base';

import { jsonFormat, metasToJSON, niceAssign, outputsVerify } from '../utils';

type IUseIgnoreJSON = (opts: {
  isOpen?: boolean;
  json?: string;
  outputs?: ViewVariableTreeNode[];
  isBatch?: boolean;
  onJSONChange: (v: unknown) => void;
}) => { value?: string; defaultValue?: string };

// 第一层新增 key，并且没填名称时有个临时结构：{fieldRandomKey: 'OsUDuHxLYRem_njkEe8Zo', type: 1, field: '[2]'}
// 这里并不关心临时态，转成正常结构消费
const transformInitOutputs = (
  outputs?: (ViewVariableTreeNode & { fieldRandomKey?: string })[],
): ViewVariableTreeNode[] | undefined =>
  outputs?.map(d => {
    if (d?.fieldRandomKey) {
      return {
        ...d,
        key: d.fieldRandomKey,
      };
    }
    return d;
  });

export const useJSONWithOutputs: IUseIgnoreJSON = ({
  json,
  outputs: outputsInParams,
  isOpen,
  onJSONChange,
  isBatch,
}) => {
  const outputs = transformInitOutputs(outputsInParams);
  const lastOutputs = useRef(outputs);
  const lastIsBatch = useRef(isBatch);
  const lastIsOpen = useRef(isOpen);

  const _json = useMemo(() => {
    let defaultJSON;
    if (isOpen && outputsVerify(outputs)) {
      // 生成默认值，时机：第一次打开开关
      defaultJSON = jsonFormat(metasToJSON(outputs));
      if (!json && isNil(lastIsOpen.current)) {
        onJSONChange(defaultJSON);
        lastIsOpen.current = isOpen;
        lastOutputs.current = outputs;
        return { value: defaultJSON, defaultValue: defaultJSON };
      }

      // 切换 single/batch
      if (lastIsBatch.current !== isBatch) {
        lastOutputs.current = outputs;
        lastIsBatch.current = isBatch;
        if (!json) {
          return { value: json, defaultValue: defaultJSON };
        }
        try {
          const jsonObj = JSON.parse(json);

          let newJSON;
          // single -> batch 添加 outputList 包裹
          if (isBatch) {
            newJSON = jsonFormat({ outputList: [jsonObj] });
            // batch -> single 删除 outputList 包裹
          } else {
            newJSON = jsonFormat(jsonObj?.outputList?.[0] ?? jsonObj);
          }
          onJSONChange(newJSON);

          return { value: newJSON, defaultValue: defaultJSON };
        } catch (error) {
          console.error(error);
          return { value: json, defaultValue: defaultJSON };
        }
      }

      // output 结构变化
      if (!isEqual(outputs, lastOutputs.current)) {
        // 需要分析出属性的增、删、改名、改类型，并同步修改 json
        const newJSON = niceAssign(json, outputs, lastOutputs.current);
        onJSONChange(newJSON);
        lastOutputs.current = outputs;
        return { value: newJSON, defaultValue: defaultJSON };
      }
    }

    return { value: json, defaultValue: defaultJSON };
  }, [outputs, json, isOpen, onJSONChange, isBatch]);

  return _json;
};
