import { I18n } from '@coze-arch/i18n';
import { type TagColor } from '@coze-arch/bot-semi/Tag';
import { PluginType } from '@coze-arch/bot-api/plugin_develop';

export const PLUGIN_TYPE_MAP = new Map<
  PluginType,
  { label: string; color: TagColor }
>([
  [PluginType.APP, { label: I18n.t('plugin_type_app'), color: 'yellow' }],
  [PluginType.PLUGIN, { label: I18n.t('plugin_type_plugin'), color: 'blue' }],
  [PluginType.FUNC, { label: I18n.t('plugin_type_func'), color: 'blue' }],
  [
    PluginType.WORKFLOW,
    { label: I18n.t('plugin_type_workflow'), color: 'blue' },
  ],
]);

export const PLUGIN_PUBLISH_MAP = new Map<
  boolean,
  { label: string; color: string }
>([
  [
    false,
    {
      label: I18n.t('Unpublished_1'),
      color: 'var(--coz-fg-secondary)',
    },
  ],
  [true, { label: I18n.t('Published_1'), color: 'var(--coz-fg-hglt-green)' }],
]);
