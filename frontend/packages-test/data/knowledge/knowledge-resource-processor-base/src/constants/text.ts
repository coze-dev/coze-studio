import { I18n } from '@coze-arch/i18n';

import { type CustomSegmentRule, SeperatorType } from '../types';

const getSeperatorSelect = () => ({
  [SeperatorType.LINE_BREAK]: I18n.t('datasets_Custom_segmentID_linebreak'),
  [SeperatorType.LINE_BREAK2]: I18n.t('datasets_Custom_segmentID_2linebreak'),
  [SeperatorType.CN_PERIOD]: I18n.t('datasets_Custom_segmentID_cnperiod'),
  [SeperatorType.CN_EXCLAMATION]: I18n.t(
    'datasets_Custom_segmentID_cn_exclamation',
  ),
  [SeperatorType.EN_PERIOD]: I18n.t('datasets_Custom_segmentID_enperiod'),
  [SeperatorType.EN_EXCLAMATION]: I18n.t(
    'datasets_Custom_segmentID_en_exclamation',
  ),
  [SeperatorType.CN_QUESTION]: I18n.t('datasets_Custom_segmentID_cn_question'),
  [SeperatorType.EN_QUESTION]: I18n.t('datasets_Custom_segmentID_en_question'),
  [SeperatorType.CUSTOM]: I18n.t('datasets_Custom_segmentID_custom'),
});

export const getSeperatorOptionList = () =>
  Object.entries(getSeperatorSelect()).map(([k, label]) => ({
    value: k,
    label,
  }));

const defaultMaxTokens = 800;

const defaultOverlap = 10;

export const defaultCustomSegmentRule: CustomSegmentRule = {
  separator: {
    type: SeperatorType.LINE_BREAK,
    customValue: '###',
  },
  maxTokens: defaultMaxTokens,
  preProcessRules: [],
  overlap: defaultOverlap,
};
