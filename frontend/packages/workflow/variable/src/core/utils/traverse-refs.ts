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
