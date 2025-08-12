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
  verifyOutputStructFieldAsGroupByKey,
  verifyOutputStructFieldAsPrimaryKey,
} from '../utils';
import type {
  BaseOutputStructLineType,
  OutputSubComponentFe,
} from '../../types';

export const mutateOutputStruct = (
  outputStructConfig: OutputSubComponentFe,
  preOutputStructConfig?: OutputSubComponentFe,
) => {
  const fields = outputStructConfig.item_list;
  if (!fields || !fields.length) {
    return;
  }
  mutateOutputStructPrimaryKey(fields, preOutputStructConfig?.item_list);
  mutateOutputStructGroupByKey(fields, preOutputStructConfig?.item_list);
};

const getIsPrimaryField = (field: BaseOutputStructLineType) => field.is_primary;
const getIsGroupByKeyField = (field: BaseOutputStructLineType) =>
  field.is_group_by_key;

const mutateOutputStructGroupByKey = (
  fields: BaseOutputStructLineType[],
  preFields?: BaseOutputStructLineType[],
) => {
  const groupByKeyFields = fields.filter(getIsGroupByKeyField);
  if (!groupByKeyFields.length) {
    return;
  }

  const getter = (field: BaseOutputStructLineType) => field.is_group_by_key;

  const setter = (field: BaseOutputStructLineType, val: boolean) =>
    (field.is_group_by_key = val);

  mutatePositiveFieldsMoreThanOne({
    curFields: groupByKeyFields,
    getter,
    setter,
    matchFn: filed => !!filed.is_group_by_key,
    preFields,
  });

  mutateOnlyPositiveField({
    curFields: groupByKeyFields,
    getter,
    setter,
    verify: verifyOutputStructFieldAsGroupByKey,
  });
};

const mutateOutputStructPrimaryKey = (
  fields: BaseOutputStructLineType[],
  preFields?: BaseOutputStructLineType[],
) => {
  const primaryFields = fields.filter(getIsPrimaryField);
  if (!primaryFields.length) {
    return;
  }

  const setter = (field: BaseOutputStructLineType, val: boolean) =>
    (field.is_primary = val);
  const getter = (field: BaseOutputStructLineType) => field.is_primary;

  mutatePositiveFieldsMoreThanOne({
    curFields: primaryFields,
    getter,
    setter,
    matchFn: field => !!field.is_primary,
    preFields,
  });

  mutateOnlyPositiveField({
    curFields: primaryFields,
    getter,
    setter,
    verify: verifyOutputStructFieldAsPrimaryKey,
  });
};

const mutateOnlyPositiveField = ({
  curFields,
  getter,
  setter,
  verify,
}: {
  curFields: BaseOutputStructLineType[];
  getter: (field: BaseOutputStructLineType) => boolean | undefined;
  setter: (field: BaseOutputStructLineType, val: boolean) => void;
  verify: (field: BaseOutputStructLineType) => boolean;
}) => {
  const onlyField = curFields.at(0);
  if (!onlyField) {
    return;
  }

  const notValid = !verify(onlyField);
  if (notValid && getter(onlyField)) {
    setter(onlyField, false);
  }
};

const mutatePositiveFieldsMoreThanOne = ({
  curFields,
  matchFn,
  setter,
  getter,
  preFields,
}: {
  curFields: BaseOutputStructLineType[];
  matchFn: (filed: BaseOutputStructLineType) => boolean;
  setter: (field: BaseOutputStructLineType, val: boolean) => void;
  getter: (field: BaseOutputStructLineType) => boolean | undefined;
  preFields?: BaseOutputStructLineType[];
}) => {
  if (curFields.length <= 1) {
    return;
  }

  const preMatchedFieldsId =
    preFields?.filter(matchFn).map(field => field._id) || [];

  curFields.forEach(field => {
    if (preMatchedFieldsId.includes(field._id) && getter(field)) {
      setter(field, false);
    }
  });

  const leftMatchedFields = curFields.filter(matchFn);
  if (leftMatchedFields.length <= 1) {
    return;
  }

  leftMatchedFields.forEach((field, idx) => {
    const targetVal = idx === leftMatchedFields.length - 1;
    if (getter(field) !== targetVal) {
      setter(field, targetVal);
    }
  });
};
