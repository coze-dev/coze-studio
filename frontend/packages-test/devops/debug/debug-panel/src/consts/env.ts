export const IS_DEV_MODE =
  (process.env.NODE_ENV as 'production' | 'development' | 'test') ===
  'development';
