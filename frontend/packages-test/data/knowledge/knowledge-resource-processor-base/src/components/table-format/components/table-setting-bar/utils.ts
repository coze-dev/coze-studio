import { I18n } from '@coze-arch/i18n';

export const initIndexOptions = (length: number, start: number) => {
  const MAX_VALUE = 50;
  const limit = length > MAX_VALUE ? MAX_VALUE : length;
  const res: Array<{
    label: string;
    value: number;
  }> = [];
  for (let i = start; i < limit; i++) {
    res.push({
      label: I18n.t('datasets_createFileModel_tab_dataStarRow_value', {
        LineNumber: i + 1,
      }),
      value: i,
    });
  }
  return res;
};
