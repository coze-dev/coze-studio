import dayjs from 'dayjs';

export const formatTime = (timestamp?: number | string) =>
  dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
