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

import path from 'path';

import fs from 'fs-extra';
import {
  type IPlugin,
  type Program,
  before,
  after,
} from '@coze-arch/idl2ts-plugin';
import {
  type IParseEntryCtx,
  isStructDefinition,
  type FunctionType,
  isSetType,
  isListType,
  SyntaxType,
  isMapType,
  type FieldType,
  createFile,
  getAnnotation,
  getOutputName,
  getTypeFromDynamicJsonAnnotation,
  removeFileExt,
  parseFile,
  genAst,
} from '@coze-arch/idl2ts-helper';
import * as t from '@babel/types';

import { type Options } from '../types';
import { type Contexts, type ProcessIdlCtxWithSchema, HOOK } from '../context';

function isInt(fieldType: FieldType | FunctionType) {
  return [
    SyntaxType.I8Keyword,
    SyntaxType.I16Keyword,
    SyntaxType.I32Keyword,
    SyntaxType.I64Keyword,
  ].some(i => i === fieldType.type);
}

export class AdapterPlugin implements IPlugin {
  private patchTypes = new Map<string, Record<string, string[]>>();
  private options: Options;
  constructor(options: Options) {
    this.options = options;
  }
  apply(program: Program<Contexts>): void {
    program.register(
      before(HOOK.PROCESS_IDL_NODE),
      this.adaptStruct.bind(this),
    );
    program.register(after(HOOK.GEN_FILE_AST), this.genPatchFiles.bind(this));
  }

  private genPatchFiles(ctx: IParseEntryCtx) {
    for (const [idlPath, res] of this.patchTypes.entries()) {
      const targetFile = getOutputName({
        source: `${removeFileExt(idlPath)}.ts`,
        idlRoot: this.options.idlRoot,
        outputDir:
          this.options.patchTypesOutput ||
          path.join(this.options.outputDir, '../patch-types'),
      });
      let file: t.File;
      if (!fs.existsSync(targetFile)) {
        file = createFile('');
      } else {
        file = parseFile(targetFile);
      }
      Object.keys(res).forEach(structName => {
        let target = file.program.body.find(
          i =>
            t.isExportNamedDeclaration(i) &&
            // @ts-expect-error fixme
            i.declaration?.id.name === structName,
        ) as t.ExportNamedDeclaration;
        if (!target) {
          target = genAst(
            `export namespace ${structName} {}`,
          ) as t.ExportNamedDeclaration;
          file.program.body.push(target);
        }
        const declaration = target.declaration as t.TSModuleDeclaration;
        for (const fieldName of res[structName]) {
          if (t.isTSModuleBlock(declaration.body)) {
            if (
              !declaration.body.body.some(i => {
                if (t.isExportNamedDeclaration(i)) {
                  if (
                    t.isTSTypeAliasDeclaration(i.declaration) ||
                    t.isInterfaceDeclaration(i.declaration)
                  ) {
                    return i.declaration.id.name === fieldName;
                  }
                }
                return false;
              })
            ) {
              declaration.body.body.push(
                genAst(
                  `export type ${fieldName}= unknown`,
                ) as t.TSTypeAliasDeclaration,
              );
            }
          }
        }
      });
      ctx.files.set(targetFile, { content: file, type: 'babel' });
    }
    return ctx;
  }
  private adaptStruct(ctx: ProcessIdlCtxWithSchema) {
    const { node, ast } = ctx;
    if (!node) {
      return ctx;
    }
    if (isStructDefinition(node)) {
      const decodeEncodeFields = [] as string[];
      // eslint-disable-next-line complexity
      node.fields = node.fields.map(f => {
        // req
        if (
          getAnnotation(f.annotations, 'api.converter') === 'atoi_comp_empty'
        ) {
          if (isInt(f.fieldType)) {
            // Type conversion to string
            f.fieldType.type = SyntaxType.StringKeyword;
          }
        }
        // Api.converter works for int and map types
        if (getAnnotation(f.annotations, 'api.converter') === 'itoa') {
          if (isInt(f.fieldType)) {
            // Type conversion to string
            f.fieldType.type = SyntaxType.StringKeyword;
          }
          if (isMapType(f.fieldType)) {
            const { valueType } = f.fieldType;
            if (isInt(valueType)) {
              f.fieldType.valueType.type = SyntaxType.StringKeyword;
            }
          }
        }
        // item_converter for list types
        if (
          ['atoi_comp_empty', 'itoa'].includes(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            getAnnotation(f.annotations, 'api.item_converter')!,
          )
        ) {
          if (isSetType(f.fieldType) || isListType(f.fieldType)) {
            f.fieldType.valueType.type = SyntaxType.StringKeyword;
          }
        }

        // Collection decoding encoding annotation processing
        if (getTypeFromDynamicJsonAnnotation(f.annotations)) {
          decodeEncodeFields.push(f.name.value);
        }
        // api.json annotation processing
        const jsonAnnotation = getAnnotation(f.annotations, 'api.json');
        if (jsonAnnotation) {
          f.extensionConfig = f.extensionConfig || {};
          f.extensionConfig.key = jsonAnnotation;
        }
        // API. json_string annotation handling
        const jsonStrAnnotation = getAnnotation(
          f.annotations,
          'api.json_string',
        );
        if (jsonStrAnnotation) {
          if (isInt(f.fieldType)) {
            // Type conversion to string
            f.fieldType.type = SyntaxType.StringKeyword;
            f.extensionConfig = f.extensionConfig || {};
            f.extensionConfig.key = jsonStrAnnotation;
          } else {
            throw new Error(
              'api.json_string is expected an annotation int type',
            );
          }
        }
        return f;
      });
      if (decodeEncodeFields.length > 0) {
        const currentAstRes = this.patchTypes.get(ast.idlPath);
        if (!currentAstRes) {
          this.patchTypes.set(ast.idlPath, {
            [node.name.value]: decodeEncodeFields,
          });
        } else {
          currentAstRes[node.name.value] = decodeEncodeFields;
        }
      }
    }
    return ctx;
  }
}
