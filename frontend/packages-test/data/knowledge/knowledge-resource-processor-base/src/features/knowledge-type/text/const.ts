enum PreProcessRule {
  REMOVE_SPACES = 'remove_extra_spaces',
  REMOVE_EMAILS = 'remove_urls_emails',
}

export enum SeparatorType {
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

export interface SegmentRule {
  separator: string;
  maxTokens: number;
  preProcessRules: PreProcessRule[];
}

export enum SegmentCleaner {
  AUTO = 0,
  CUSTOM = 1,
}
