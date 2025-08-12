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

import { ViewVariableType } from '@coze-workflow/base';
import { languages } from '@coze-editor/editor/preset-code';
import { typescript } from '@coze-editor/editor/language-typescript';

import { type Input, ModuleDetectionKind, type Output } from '../../interface';

export const initTypescriptServer = () => {
  languages.register('typescript', typescript);

  const tsWorker = new Worker(
    new URL('@coze-editor/editor/language-typescript/worker', import.meta.url),
    { type: 'module' },
  );

  typescript.languageService.initialize(tsWorker, {
    compilerOptions: {
      // eliminate Promise error
      lib: ['es2015'],
      moduleDetection: ModuleDetectionKind.Force,
    },
  });
};

const mapVariableType = (type?: ViewVariableType): string => {
  switch (type) {
    case ViewVariableType.String:
      return 'string';
    case ViewVariableType.Integer:
      return 'number';
    case ViewVariableType.Boolean:
      return 'boolean';
    case ViewVariableType.Number:
      return 'number';
    case ViewVariableType.Object:
      return 'object';
    case ViewVariableType.Image:
    case ViewVariableType.File:
    case ViewVariableType.Doc:
    case ViewVariableType.Code:
    case ViewVariableType.Ppt:
    case ViewVariableType.Txt:
    case ViewVariableType.Excel:
    case ViewVariableType.Audio:
    case ViewVariableType.Zip:
    case ViewVariableType.Video:
    case ViewVariableType.Svg:
    case ViewVariableType.Voice:
      return 'string'; // Assuming file-like types are represented as strings (e.g., file paths or URLs)
    case ViewVariableType.Time:
      return 'Date';
    case ViewVariableType.ArrayString:
      return 'string[]';
    case ViewVariableType.ArrayInteger:
      return 'number[]';
    case ViewVariableType.ArrayBoolean:
      return 'boolean[]';
    case ViewVariableType.ArrayNumber:
      return 'number[]';
    case ViewVariableType.ArrayObject:
      return 'object[]';
    case ViewVariableType.ArrayImage:
    case ViewVariableType.ArrayFile:
    case ViewVariableType.ArrayDoc:
    case ViewVariableType.ArrayCode:
    case ViewVariableType.ArrayPpt:
    case ViewVariableType.ArrayTxt:
    case ViewVariableType.ArrayExcel:
    case ViewVariableType.ArrayAudio:
    case ViewVariableType.ArrayZip:
    case ViewVariableType.ArrayVideo:
    case ViewVariableType.ArraySvg:
    case ViewVariableType.ArrayVoice:
      return 'string[]';
    case ViewVariableType.ArrayTime:
      return 'Date[]';
    default:
      return 'any'; // Fallback type
  }
};

export function generateTypeDefinition(output: Output, indent = '  '): string {
  let definition = '';

  if (output.type === ViewVariableType.Object) {
    definition += `${indent}${output.name}: {\n`;
    if (output.children && output.children.length > 0) {
      output.children.forEach(child => {
        definition += `${indent}  ${generateTypeDefinition(
          child,
          `${indent}  `,
        )}`;
      });
    }

    definition += `${indent}}\n`;

    return definition;
  }

  if (output.type === ViewVariableType.ArrayObject) {
    definition += `${indent}${output.name}: {\n`;
    if (output.children && output.children.length > 0) {
      output.children.forEach(child => {
        definition += `${indent}  ${generateTypeDefinition(
          child,
          `${indent}  `,
        )}`;
      });
      definition += `${indent}}[]\n`;
    }

    return definition;
  }

  definition += `${indent}${output.name}: ${mapVariableType(output.type)};\n`;

  definition += '\n';

  return definition;
}

export const initInputAndOutput = async (
  inputs: Input[] = [],
  outputs: Output[] = [],
  uuid = '',
): Promise<void> => {
  const typeDefinition = `
    declare module '/ts_editor_${uuid}' {
      interface Args {
        ${generateTypeDefinition(
          {
            name: 'params',
            type: ViewVariableType.Object,
            children: inputs,
          },
          '    ',
        )}
      }

      interface Output {
        ${outputs
          .map(output => generateTypeDefinition(output, '    '))
          .join('\n')}
      }
    }

    export {}
  `;

  await typescript.languageService.addExtraFiles({
    [`/ts_editor_${uuid}.d.ts`]: typeDefinition,
  });
};
