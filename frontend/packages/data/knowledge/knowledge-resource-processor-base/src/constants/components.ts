/** 更新频率 */
export enum FrequencyDay {
  ZERO = 0,
  ONE = 1,
  THREE = 3,
  SEVEN = 7,
  THIRTY = 30,
}
export enum TableSettingFormFields {
  SHEET = 'sheet_id',
  KEY_START_ROW = 'header_line_idx',
  DATA_START_ROW = 'start_line_idx',
}

/** 知识库上传文件最大 size 100MB */
export const UNIT_MAX_MB = 100;

export const PDF_MAX_PAGES = 500;
