/* eslint-disable @coze-arch/no-deep-relative-import */
import { I18n } from '@coze-arch/i18n';
import { IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { Tooltip, IconButton, Switch } from '@coze-arch/coze-design';

import { ObjectLikeTypes } from '@/store/variable-groups/types';
import { useVariableContext } from '@/context';

import AddOperation from '../add-operation';
import { type TreeNodeCustomData } from '../../../../type';

interface ParamOperatorProps {
  data: TreeNodeCustomData;
  level: number;
  onAppend: () => void;
  onDelete: () => void;
  onEnabledChange: (enabled: boolean) => void;
  hasObjectLike?: boolean;
  needRenderAppendChild?: boolean;
  readonly?: boolean;
}

export default function ParamOperator({
  level,
  data,
  hasObjectLike,
  readonly,
  needRenderAppendChild = true,
  onEnabledChange,
  onDelete,
  onAppend,
}: ParamOperatorProps) {
  const isLimited = level >= 3;

  // 是否可以添加子项
  const canAddChild = !readonly && ObjectLikeTypes.includes(data.type);
  // 子项按钮是否可用
  const enableAddChildButton =
    !readonly && hasObjectLike && canAddChild && needRenderAppendChild;
  // 是否显示删除按钮
  const showDeleteButton = !readonly;
  // 是否显示开启/关闭按钮
  const enabledSwitch = level === 0;

  const { variablePageCanEdit } = useVariableContext();

  return (
    <div className="flex items-center h-[24px] flex-shrink-0 justify-start gap-x-2 w-[130px]">
      {/* 开启/关闭 */}
      <Switch
        size="small"
        disabled={!variablePageCanEdit || !enabledSwitch}
        checked={data.enabled}
        onChange={onEnabledChange}
      />
      {/* 添加子项 */}
      {needRenderAppendChild ? (
        <div className="flex items-center justify-center">
          <Tooltip
            content={I18n.t('workflow_detail_node_output_add_subitem')}
            theme="dark"
          >
            <div>
              <AddOperation
                color="secondary"
                disabled={isLimited || !enableAddChildButton}
                className="cursor-pointer"
                onClick={onAppend}
                subitem={true}
              />
            </div>
          </Tooltip>
        </div>
      ) : null}
      {/* 删除 */}
      <IconButton
        color="secondary"
        onClick={onDelete}
        disabled={!showDeleteButton}
        icon={<IconCozTrashCan />}
      />
    </div>
  );
}
