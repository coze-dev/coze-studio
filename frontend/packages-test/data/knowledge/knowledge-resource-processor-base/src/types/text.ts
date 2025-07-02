export enum SegmentMode {
  AUTO,
  CUSTOM,
  LEVEL,
}

export enum PreProcessRule {
  REMOVE_SPACES = 'remove_extra_spaces',
  REMOVE_EMAILS = 'remove_urls_emails',
}

export enum SeperatorType {
  LINE_BREAK = '\n',
  LINE_BREAK2 = '\n\n',
  CN_PERIOD = '。',
  CN_EXCLAMATION = '！',
  EN_PERIOD = '.',
  EN_EXCLAMATION = '!',
  CN_QUESTION = '？',
  EN_QUESTION = '?',
  CUSTOM = 'custom',
}

export interface Seperator {
  type: SeperatorType;
  customValue?: string;
}

export interface CustomSegmentRule {
  separator: Seperator;
  maxTokens: number;
  preProcessRules: PreProcessRule[];
  /** 分段重叠度 */
  overlap: number;
}
