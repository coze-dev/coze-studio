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

import { type Program, after } from '@coze-arch/idl2ts-plugin';
import {
  type Comment,
  type EnumDefinition,
  type FieldDefinition,
  type FieldType,
  type FunctionType,
  type IParseEntryCtx,
  type IParseResultItem,
  type Identifier,
  type ProcessIdlCtx,
  type StructDefinition,
  SyntaxType,
  type UnifyStatement,
  createFile,
  findDefinition,
  getParseResultFromNamespace,
  getStatementById,
  getValuesFromEnum,
  isBaseType,
  isEnumDefinition,
  isIdentifier,
  isListType,
  isMapType,
  isServiceDefinition,
  isSetType,
  isStructDefinition,
  parseIdFiledType,
  withExportDeclaration,
} from '@coze-arch/idl2ts-helper';
import { HOOK } from '@coze-arch/idl2ts-generator';
// eslint-disable-next-line @coze-arch/no-batch-import-or-export
import * as t from '@babel/types';

export class FilterTypesPlugin {
  methods: Record<string, string[]>;
  statements: Record<string, UnifyStatement[]> = {};
  enums: Record<string, EnumDefinition[]> = {};
  output: string;
  constructor(methods: Record<string, string[]>, output: string) {
    this.methods = methods;
    this.output = output;
  }

  apply(program: Program) {
    program.register(after(HOOK.PARSE_ENTRY), this.filterTypes.bind(this));
    program.register(
      after(HOOK.PROCESS_IDL_AST),
      this.genEnumsFiles.bind(this),
    );
  }

  genEnumsFiles(ctx: ProcessIdlCtx) {
    const file = createFile('');
    Object.keys(this.enums).forEach(key => {
      const defs = this.enums[key];
      const block = t.tsModuleBlock([]);

      defs.forEach(d => {
        const values = getValuesFromEnum(d);
        const objExps = d.members.map((m, index) => {
          const valueProps = t.objectProperty(
            t.identifier('value'),
            t.numericLiteral(values[index]),
          );
          t.addComment(valueProps, 'trailing', 'm.name.value');
          return t.objectExpression([
            valueProps,
            t.objectProperty(
              t.identifier('label'),
              t.stringLiteral(m.name.value),
            ),
          ]);
        });
        const constNode = t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier(d.name.value),
            t.arrayExpression(objExps),
          ),
        ]);
        block.body.push(withExportDeclaration(constNode));
      });
      const exportNode = withExportDeclaration(
        t.tsModuleDeclaration(t.identifier(key), block),
      );
      file.program.body.push(exportNode);
    });
    ctx.output.set(path.resolve(this.output, 'enums.ts'), {
      type: 'babel',
      content: file,
    });
    return ctx;
  }

  filterTypes(ctx: IParseEntryCtx) {
    ctx.ast.forEach(i => {
      if (i.isEntry) {
        i.statements.forEach(s => {
          if (isServiceDefinition(s) && this.methods[s.name.value]) {
            for (const f of s.functions) {
              if (this.methods[s.name.value].includes(f.name.value)) {
                if (isIdentifier(f.returnType)) {
                  this.lookupTypes(f.returnType, i);
                }
                const fieldType = f.fields[0]?.fieldType;
                if (isIdentifier(fieldType)) {
                  this.lookupTypes(fieldType, i);
                }
              }
            }
          }
        });
      }
    });
    ctx.ast = ctx.ast
      .filter(i => this.statements[i.idlPath])
      .map(i => ({ ...i, statements: this.statements[i.idlPath] }));
    return ctx;
  }
  private lookupTypes(id: Identifier, current: IParseResultItem) {
    const { namespace, refName } = parseIdFiledType(id);
    if (namespace) {
      const next = getParseResultFromNamespace(namespace, current);
      const nextID = findDefinition(next.statements, refName);
      if (nextID) {
        this.lookupTypes(nextID.name, next);
      }
    } else {
      const statement = getStatementById(id, current);
      if (statement) {
        if (this.statements[current.idlPath]) {
          if (!this.statements[current.idlPath].includes(statement)) {
            this.statements[current.idlPath].push(statement);
          }
        } else {
          this.statements[current.idlPath] = [statement];
        }
        if (isStructDefinition(statement)) {
          this.lookupStructTypes(statement, current);
        }
      }
    }
  }

  private lookupStructTypes(
    statement: StructDefinition,
    current: IParseResultItem,
  ) {
    for (const field of statement.fields) {
      const { fieldType } = field;
      this.processFiledType(fieldType, current, field);
    }
  }

  private processFiledType(
    fieldType: FieldType | FunctionType,
    current: IParseResultItem,
    field: FieldDefinition,
  ) {
    if (isBaseType(fieldType)) {
      return;
    } else if (isListType(fieldType) || isSetType(fieldType)) {
      const { valueType } = fieldType;
      return this.processFiledType(valueType, current, field);
    } else if (isMapType(fieldType)) {
      const { valueType } = fieldType;
      return this.processFiledType(valueType, current, field);
    } else if (isIdentifier(fieldType)) {
      const statement = getStatementById(fieldType, current);
      if (isEnumDefinition(statement)) {
        // Forced indexing number
        // @ts-expect-error fixme late
        fieldType.type = SyntaxType.I32Keyword;
        let namespace = current.unifyNamespace;
        const parsedFieldType = parseIdFiledType(fieldType);

        if (parsedFieldType.namespace) {
          const next = getParseResultFromNamespace(
            parsedFieldType.namespace,
            current,
          );
          namespace = next.unifyNamespace;
        }
        const extraComment = {
          type: SyntaxType.CommentLine,
          value: `@see${fieldType.value}`,
        } as Comment;
        if (field.comments) {
          field.comments.push(extraComment);
        } else {
          field.comments = [extraComment];
        }
        if (this.enums[namespace]) {
          if (
            this.enums[namespace].some(
              i => i.name.value === statement.name.value,
            )
          ) {
            return;
          }
          this.enums[namespace].push(statement);
        } else {
          this.enums[namespace] = [statement];
        }
        return;
      } else {
        return this.lookupTypes(fieldType, current);
      }
    }
    throw new Error(`unknown type:${fieldType.type}`);
  }
}
