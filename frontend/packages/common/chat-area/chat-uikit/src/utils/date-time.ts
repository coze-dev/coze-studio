import dayjs from 'dayjs';

export const formatMessageBoxContentTime = (contentTime: number): string => {
  if (contentTime < 1) {
    return '';
  }
  // 当天：hh:mm；跨天：mm-dd hh:mm；跨年：yyyy-mm-dd hh:mm
  const now = Date.now();
  const today = dayjs(now);
  const messageDay = dayjs(contentTime);
  if (today.year() !== messageDay.year()) {
    return messageDay.format('YYYY-MM-DD HH:mm');
  }
  if (
    today.month() !== messageDay.month() ||
    today.date() !== messageDay.date()
  ) {
    return messageDay.format('MM-DD HH:mm');
  }
  return messageDay.format('HH:mm');
};
