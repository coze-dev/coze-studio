import { get, isNil } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';

const MAX_LENGTH = 1000;

export const validateIntentsName = (
  value?: { name?: string; id?: string },
  intents?: { name?: string; id?: string }[],
  name?: string,
) => {
  const data = get(value, 'name');
  const namePath = name?.split('.') || [];
  const idx = namePath[namePath.length - 1];
  const names = intents?.map(item => item?.name);
  if (!isNil(idx)) {
    names?.splice(Number(idx), 1);
  }

  if (!data || data.trim() === '') {
    return I18n.t('workflow_intent_matchlist_error1');
  }

  if (data.length > MAX_LENGTH) {
    return I18n.t('workflow_intent_matchlist_error2');
  }

  if (names && names.includes(name)) {
    return I18n.t(
      'workflow_ques_ans_testrun_dulpicate',
      {},
      '选项内容不可重复',
    );
  }

  return undefined;
};
