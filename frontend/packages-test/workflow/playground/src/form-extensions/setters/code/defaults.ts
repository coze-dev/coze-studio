import {
  DEFAULT_AVATAR_LANGUAGES,
  DEFAULT_IDE_PYTHON_CODE_PARAMS,
  DEFAULT_LANGUAGES,
  DEFAULT_OPEN_SOURCE_LANGUAGES,
  DEFAULT_TYPESCRIPT_CODE_PARAMS,
} from './constants';

function getLanguageTemplates(options?: { isBindDouyin?: boolean }) {
  // open source version only support Python(limit from backend)
  return IS_OPEN_SOURCE
    ? DEFAULT_OPEN_SOURCE_LANGUAGES
    : options?.isBindDouyin
      ? DEFAULT_AVATAR_LANGUAGES
      : DEFAULT_LANGUAGES;
}

function getDefaultValue(options?: { isBindDouyin?: boolean }) {
  const templates = getLanguageTemplates(options);

  if (templates[0]?.language === 'python') {
    return DEFAULT_IDE_PYTHON_CODE_PARAMS;
  }

  return DEFAULT_TYPESCRIPT_CODE_PARAMS;
}

export { getLanguageTemplates, getDefaultValue };
