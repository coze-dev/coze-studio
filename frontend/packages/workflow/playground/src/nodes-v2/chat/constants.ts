import { I18n } from '@coze-arch/i18n';

export const CONVERSATION_NAME = 'conversationName';

export const PARAMS_COLUMNS = [
  {
    title: I18n.t('workflow_detail_node_parameter_name'),
    style: { width: 180 },
  },
  {
    title: I18n.t('workflow_detail_node_parameter_value'),
    style: { flex: '1' },
  },
];

export const INPUT_COLUMNS_NARROW = [
  {
    title: I18n.t('workflow_detail_node_parameter_name'),
    style: { width: 140 },
  },
  {
    title: I18n.t('workflow_detail_node_parameter_value'),
    style: { flex: '1' },
  },
];
