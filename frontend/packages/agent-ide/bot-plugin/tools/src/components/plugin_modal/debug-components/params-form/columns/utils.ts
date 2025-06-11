import { type APIParameterRecord } from '../../../types/params';

export const getColumnClass = (record: APIParameterRecord) =>
  record.global_disable ? 'disable' : 'normal';
