import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';

export const reportNavClick = (title: string) => {
  sendTeaEvent(EVENT_NAMES.tab_click, { content: title });
  sendTeaEvent(EVENT_NAMES.coze_space_sidenavi_ck, {
    item: title,
    navi_type: 'prime',
    need_login: true,
    have_access: true,
  });
};
