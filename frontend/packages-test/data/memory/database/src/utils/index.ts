import dayjs from 'dayjs';

export const formatDate = (v: number, template = 'YYYY/MM/DD HH:mm:ss') =>
  dayjs.unix(v).format(template);
