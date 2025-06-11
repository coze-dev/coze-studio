import { ConditionType } from '@coze-arch/idl/workflow_api';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozEqual,
  IconCozEqualSlash,
  IconCozGreater,
  IconCozGreaterEqual,
  IconCozLess,
  IconCozLessEqual,
  IconCozProperSuperset,
  IconCozProperSupersetSlash,
} from '@coze/coze-design/icons';

export enum Logic {
  OR = 1,
  AND = 2,
}

export const logicTextMap = new Map<number, string>([
  [Logic.OR, I18n.t('workflow_detail_condition_or')],
  [Logic.AND, I18n.t('workflow_detail_condition_and')],
]);

export const operatorMap = {
  [ConditionType.Equal]: <IconCozEqual />,
  [ConditionType.NotEqual]: <IconCozEqualSlash />,
  [ConditionType.LengthGt]: <IconCozGreater />,
  [ConditionType.LengthGtEqual]: <IconCozGreaterEqual />,
  [ConditionType.LengthLt]: <IconCozLess />,
  [ConditionType.LengthLtEqual]: <IconCozLessEqual />,
  // 包含
  [ConditionType.Contains]: <IconCozProperSuperset />,
  // 不包含
  [ConditionType.NotContains]: <IconCozProperSupersetSlash />,
  // isEmpty
  [ConditionType.Null]: <IconCozEqual />,
  // isNotEmpty
  [ConditionType.NotNull]: <IconCozEqualSlash />,
  // isTrue
  [ConditionType.True]: <IconCozEqual />,
  // isFalse
  [ConditionType.False]: <IconCozEqual />,
  [ConditionType.Gt]: <IconCozGreater />,
  [ConditionType.GtEqual]: <IconCozGreaterEqual />,
  [ConditionType.Lt]: <IconCozLess />,
  [ConditionType.LtEqual]: <IconCozLessEqual />,
};
