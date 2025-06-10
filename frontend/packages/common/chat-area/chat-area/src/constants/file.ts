import { I18n } from '@coze-arch/i18n';

export const MAX_UPLOAD_PROGRESS = 100;

export const UPLOAD_FILE_TIMEOUT = 60000;

export const FILE_EXCEEDS_LIMIT_I18N_KEY = 'files_exceeds_limit';

export const getFileSizeReachLimitI18n = ({ limitText = '20MB' }) =>
  I18n.t('file_too_large', {
    max_size: limitText,
  });
