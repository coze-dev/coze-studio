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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { z, type ZodSchema } from 'zod';
import { isArray, isObject } from 'lodash-es';
import { type BaseVariableField } from '@flowgram-adapter/free-layout-editor';
import {
  type FormModelV2,
  FlowNodeFormData,
  isFormV2,
  type FlowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';
import {
  ValueExpressionType,
  type RefExpression,
} from '@coze-workflow/base/types';

import { convertGlobPath } from '../../utils/path';
import { getNamePathByField, matchPath } from './name-path';

const refExpressionSchema: ZodSchema<RefExpression> = z.lazy(() =>
  z.object({
    type: z.literal(ValueExpressionType.REF),
    content: z.object({
      keyPath: z.array(z.string()),
    }),
    rawMeta: z
      .object({
        type: z.number().int(),
      })
      .optional(),
  }),
);

export function isRefExpression(data: any) {
  return refExpressionSchema.safeParse(data).success;
}

export function traverseAllRefExpressions(
  data: any,
  cb: (_ref: RefExpression, _path: string) => void,
  path = '/',
): any {
  if (isObject(data)) {
    if (isRefExpression(data)) {
      return cb(data as RefExpression, path);
    }

    return Object.entries(data).reduce<any>((acm, [_key, _val]) => {
      acm[_key] = traverseAllRefExpressions(_val, cb, `${path}${_key}/`);
      return acm;
    }, {});
  } else if (isArray(data)) {
    return data.map((_item, _idx) =>
      traverseAllRefExpressions(_item, cb, `${path}${_idx}/`),
    );
  }

  return data;
}

export function traverseUpdateRefExpressionByRename(
  fullData: any,
  info: {
    after: BaseVariableField;
    before: BaseVariableField;
  },
  ctx?: {
    onDataRenamed?: (_newData?: any) => void;
    node?: FlowNodeEntity;
  },
): any {
  const { before, after } = info;
  const { onDataRenamed, node } = ctx || {};
  const prevKeyPath = getNamePathByField(before);

  let renamed = false;

  traverseAllRefExpressions(fullData, (_ref, _dataPath) => {
    const keyPath = _ref?.content?.keyPath;
    if (!keyPath?.length) {
      return _ref;
    }
    if (matchPath(prevKeyPath, keyPath)) {
      // Match Prev Key Path And Replace it to new KeyPath
      if (node && isFormV2(node)) {
        const formModel = node
          .getData<FlowNodeFormData>(FlowNodeFormData)
          .getFormModel<FormModelV2>();
        formModel.setValueIn(
          `${convertGlobPath(_dataPath)}.content.keyPath.${
            prevKeyPath.length - 1
          }`,
          after.key,
        );
      } else {
        keyPath[prevKeyPath.length - 1] = after.key;
        renamed = true;
      }
    }
    return _ref;
  });

  if (renamed) {
    onDataRenamed?.(fullData);
  }

  return fullData;
}
