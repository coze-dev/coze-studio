/** table common constants */

export enum TableStatus {
  ERROR = 'error',
  LOADING = 'loading',
  NORMAL = 'normal',
}

export const MAX_TABLE_META_COLUMN_LEN = 50;

export const MAX_TABLE_META_STR_LEN = 30;

/** table-local resegment unit steps */
export enum TableLocalResegmentStep {
  CONFIGURATION,
  PREVIEW,
  PROCESSING,
}

export enum TableSettingFormFields {
  SHEET = 'sheet_id',
  KEY_START_ROW = 'header_line_idx',
  DATA_START_ROW = 'start_line_idx',
}

export const DEFAULT_TABLE_SETTINGS_FROM_ONE = {
  [TableSettingFormFields.SHEET]: 0,
  [TableSettingFormFields.KEY_START_ROW]: 0,
  [TableSettingFormFields.DATA_START_ROW]: 1,
};

export const DEFAULT_TABLE_SETTINGS_FROM_ZERO = {
  [TableSettingFormFields.SHEET]: 0,
  [TableSettingFormFields.KEY_START_ROW]: 0,
  [TableSettingFormFields.DATA_START_ROW]: 0,
};
