// !Notice 禁止直接导出 shortcut-tool，会导致下游依赖不需要的 knowledge-upload
// export { ShortcutToolConfig } from './shortcut-tool';
export { ShortcutBar } from './shortcut-bar';

export { ComponentsTable } from './shortcut-tool/shortcut-edit/components-table';

export {
  ShortCutCommand,
  getStrictShortcuts,
} from '@coze-agent-ide/tool-config';

export type {
  OnBeforeSendTemplateShortcutParams,
  OnBeforeSendQueryShortcutParams,
} from './shortcut-bar/types';

export { getUIModeByBizScene } from './utils/get-ui-mode-by-biz-scene';
