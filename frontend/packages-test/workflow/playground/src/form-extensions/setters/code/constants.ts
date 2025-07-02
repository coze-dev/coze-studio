import { type EditorProps } from '@coze-workflow/code-editor-adapter';
import { I18n } from '@coze-arch/i18n';

export enum LanguageEnum {
  NODE_JS = 1,
  GO_LANG = 2,
  PYTHON = 3,
  JAVA = 4,
  TYPESCRIPT = 5,
}

export const DEFAULT_TYPESCRIPT_CODE_PARAMS = {
  code: `${I18n.t('workflow_code_js_illustrate_all')}

async function main({ params }: Args): Promise<Output> {
    ${I18n.t('workflow_code_js_illustrate_output')}
    const ret = {
        "key0": params.input + params.input, ${I18n.t('workflow_code_js_illustrate_output_param')}
        "key1": ["hello", "world"], ${I18n.t('workflow_code_js_illustrate_output_arr')}
        "key2": { ${I18n.t('workflow_code_js_illustrate_output_obj')}
            "key21": "hi"
        },
    };

    return ret;
}`,
  language: LanguageEnum.TYPESCRIPT,
};

export const DEFAULT_IDE_PYTHON_CODE_PARAMS = {
  code: `${I18n.t('workflow_code_py_illustrate_all')}

async def main(args: Args) -> Output:
    params = args.params
    ${I18n.t('workflow_code_py_illustrate_output')}
    ret: Output = {
        "key0": params['input'] + params['input'], ${I18n.t('workflow_code_py_illustrate_output_param')}
        "key1": ["hello", "world"],  ${I18n.t('workflow_code_py_illustrate_output_arr')}
        "key2": { ${I18n.t('workflow_code_py_illustrate_output_obj')}
            "key21": "hi"
        },
    }
    return ret`,
  language: LanguageEnum.PYTHON,
};

export const LANG_CODE_NAME_MAP = new Map<
  number | undefined,
  'javascript' | 'python' | 'typescript'
>([
  [LanguageEnum.NODE_JS, 'javascript'],
  [LanguageEnum.PYTHON, 'python'],
  [LanguageEnum.TYPESCRIPT, 'typescript'],
]);

export const LANG_NAME_CODE_MAP = new Map<string, number>([
  ['typescript', LanguageEnum.TYPESCRIPT],
  ['python', LanguageEnum.PYTHON],
  ['javascript', LanguageEnum.NODE_JS],
]);

export const DEFAULT_LANGUAGES: NonNullable<EditorProps['languageTemplates']> =
  [
    {
      language: 'typescript',
      template: DEFAULT_TYPESCRIPT_CODE_PARAMS.code,
      displayName: 'JavaScript',
    },
    {
      language: 'python',
      displayName: 'Python',
      template: DEFAULT_IDE_PYTHON_CODE_PARAMS.code,
    },
  ];

export const DEFAULT_AVATAR_LANGUAGES: NonNullable<
  EditorProps['languageTemplates']
> = DEFAULT_LANGUAGES.filter(v => v.language === 'python');

export const DEFAULT_OPEN_SOURCE_LANGUAGES: NonNullable<
  EditorProps['languageTemplates']
> = DEFAULT_LANGUAGES.filter(v => v.language === 'python');
