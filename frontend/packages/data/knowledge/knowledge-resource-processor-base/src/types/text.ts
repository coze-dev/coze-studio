/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  /** segmented overlap */
  overlap: number;
}
