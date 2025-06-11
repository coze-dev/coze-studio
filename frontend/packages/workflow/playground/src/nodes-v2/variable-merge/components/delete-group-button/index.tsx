import React, { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozMinus } from '@coze/coze-design/icons';
import { IconButton } from '@coze/coze-design';
import { type FieldArrayRenderProps } from '@flowgram-adapter/free-layout-editor';

import { TooltipWithDisabled } from '../tooltip-with-disabled';
import { type MergeGroup } from '../../types';

interface Props {
  mergeGroupsField: FieldArrayRenderProps<MergeGroup>['field'];
  index: number;
  readonly?: boolean;
}

/**
 * 删除分组按钮
 * @param param0
 * @returns
 */
export const DeleteGroupButton: FC<Props> = ({
  mergeGroupsField,
  index,
  readonly,
}) => {
  const canDelete = (mergeGroupsField.value || []).length > 1;

  return (
    <TooltipWithDisabled
      content={I18n.t('workflow_var_merge_delete_limit')}
      disabled={canDelete}
    >
      <IconButton
        style={{ position: 'relative', top: '-1px' }}
        size="small"
        disabled={readonly || !canDelete}
        color="secondary"
        onClick={() => {
          mergeGroupsField.delete(index);
        }}
        icon={<IconCozMinus className="text-lg" />}
      ></IconButton>
    </TooltipWithDisabled>
  );
};
