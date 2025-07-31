/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
        "key0": params.input + params.input, ${I18n.t(
          'workflow_code_js_illustrate_output_param',
        )}
        "key1": ["hello", "world"], ${I18n.t(
          'workflow_code_js_illustrate_output_arr',
        )}
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
        "key0": params['input'] + params['input'], ${I18n.t(
          'workflow_code_py_illustrate_output_param',
        )}
        "key1": ["hello", "world"],  ${I18n.t(
          'workflow_code_py_illustrate_output_arr',
        )}
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
