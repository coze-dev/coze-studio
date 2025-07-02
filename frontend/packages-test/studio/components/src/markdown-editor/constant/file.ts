import { I18n } from '@coze-arch/i18n';

export const MAX_FILE_SIZE = 20 * 1024 * 1024;
export const getFileSizeReachLimitI18n = () =>
  I18n.t('file_too_large', {
    max_size: '20MB',
  });
