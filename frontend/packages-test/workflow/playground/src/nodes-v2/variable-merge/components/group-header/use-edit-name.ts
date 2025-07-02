import { useState } from 'react';

import {
  type FieldRenderProps,
  type FieldArrayRenderProps,
  type FieldError,
} from '@flowgram-adapter/free-layout-editor';

import { validateGroupName } from '../../validators/group-name-validator';
import { toFieldError } from '../../utils/to-field-error';
import { type MergeGroup } from '../../types';

interface Props {
  nameField: FieldRenderProps<string>['field'];
  mergeGroupsField: FieldArrayRenderProps<MergeGroup>['field'];
  mergeGroupField: FieldRenderProps<MergeGroup>['field'];
}

/**
 * 名称编辑
 * @param props
 * @returns
 */
export function useEditName(props: Props) {
  const { nameField, mergeGroupsField, mergeGroupField } = props;
  const [editName, setEditName] = useState<string | undefined>(
    nameField?.value,
  );
  const [editErrors, setEditErrors] = useState<FieldError[]>([]);

  const validateName = (name: string) => {
    const names = mergeGroupsField.map(field =>
      field.name === mergeGroupField.name ? name : field?.value?.name,
    );
    const res = validateGroupName(name, names);
    return res;
  };

  const handleChange = value => {
    const error = validateName(value);
    setEditName(value);

    setEditErrors(
      error ? [toFieldError(`${mergeGroupField.name}.name`, error)] : [],
    );
  };

  const handleBlur = e => {
    const value = e.target?.value;
    if (value && !validateName(value)) {
      nameField?.onChange(value);
    } else {
      setEditName(nameField.value);
    }

    setEditErrors([]);
  };

  return {
    handleBlur,
    handleChange,
    editName,
    editErrors,
  };
}
