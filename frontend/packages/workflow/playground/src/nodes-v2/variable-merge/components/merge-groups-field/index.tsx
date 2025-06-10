import { type FC } from 'react';

import {
  Field,
  FieldArray,
  type FieldRenderProps,
  type FieldArrayRenderProps,
} from '@flowgram-adapter/free-layout-editor';
import { type ValueExpression } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { GroupVariables } from '../group-variables';
import { GroupHeader } from '../group-header';
import { AddGroupButton } from '../add-group-button';
import { type MergeGroup } from '../../types';

interface Props {
  readonly?: boolean;
}

/**
 * 变量聚合分组
 * @param param0
 * @returns
 */
export const MergeGroupsField: FC<Props> = ({ readonly }) => (
  <FieldArray name="inputs.mergeGroups">
    {({ field: mergeGroupsField }: FieldArrayRenderProps<MergeGroup>) => (
      <div>
        {mergeGroupsField.map((mergeGroupField, groupIndex) => (
          <div
            key={mergeGroupField.name}
            className="border border-solid border-[var(--coz-stroke-plus)] rounded-[8px] p-2 mb-3 coz-bg-max"
          >
            <Field name={`${mergeGroupField.name}.name`}>
              {({ field, fieldState }: FieldRenderProps<string>) => (
                <GroupHeader
                  tooltip={I18n.t('workflow_var_merge_group_tooltips')}
                  mergeGroup={mergeGroupField.value}
                  mergeGroupsField={mergeGroupsField}
                  mergeGroupField={mergeGroupField}
                  index={groupIndex}
                  readonly={readonly}
                  nameField={field}
                  nameFieldErrors={fieldState?.errors || []}
                />
              )}
            </Field>

            <FieldArray
              name={`${mergeGroupField.name}.variables`}
              defaultValue={[]}
            >
              {({
                field: variablesField,
                fieldState: variablesFieldState,
              }: FieldArrayRenderProps<ValueExpression>) => (
                <>
                  <GroupVariables
                    variablesField={variablesField}
                    readonly={readonly}
                    errors={variablesFieldState?.errors}
                    groupIndex={groupIndex}
                  />
                </>
              )}
            </FieldArray>
          </div>
        ))}
        <AddGroupButton
          mergeGroupsField={mergeGroupsField}
          readonly={readonly}
        />
      </div>
    )}
  </FieldArray>
);
