export function getEnv(): string {
  if (!IS_PROD) {
    return 'cn-boe';
  }

  const regionPart = IS_OVERSEA ? 'oversea' : 'cn';
  const inhousePart = IS_RELEASE_VERSION ? 'release' : 'inhouse';
  return [regionPart, inhousePart].join('-');
}

// error code
export const ERROR_CODE = {
  SAFE_CHECK: 720092020,
  DUP_NAME_URL: 702093022,
  DUP_NAME: 702092010,
  DUP_PATH: 702093021,
};

export const ACCEPT_FORMAT = ['json', 'yaml'];

export const ACCEPT_EXT = ACCEPT_FORMAT.map(item => `.${item}`);

export const INITIAL_PLUGIN_REPORT_PARAMS = {
  environment: getEnv(),
  workspace_id: '',
  workspace_type: '',
  status: 1,
  create_type: 'import',
};

export const INITIAL_TOOL_REPORT_PARAMS = {
  environment: getEnv(),
  workspace_id: '',
  workspace_type: '',
  status: 1,
  create_type: 'import',
  plugin_id: '',
};
