import { URI } from '@coze-project-ide/client';

export const URI_SCHEME = 'coze-project';

export const TOP_BAR_URI = new URI(`${URI_SCHEME}:///top-bar`);
export const MAIN_PANEL_DEFAULT_URI = new URI(`${URI_SCHEME}:///default`);

export const SIDEBAR_URI = new URI(`${URI_SCHEME}:///side-bar`);
export const SECONDARY_SIDEBAR_URI = new URI(
  `${URI_SCHEME}:///secondary-sidebar`,
);
export const SIDEBAR_RESOURCE_URI = new URI(
  `${URI_SCHEME}:///side-bar/resource`,
);
export const SIDEBAR_CONFIG_URI = new URI(`${URI_SCHEME}:///side-bar/config`);

export const UI_BUILDER_URI = new URI(`${URI_SCHEME}:///ui-builder`);
export const UI_BUILDER_CONTENT = new URI(
  `${URI_SCHEME}:///ui-builder/content`,
);

export const CONVERSATION_URI = new URI(`${URI_SCHEME}:///session`);
