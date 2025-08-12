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

import {
  type IPlugin,
  type Program,
  on,
  after,
} from '@coze-arch/idl2ts-plugin';
import {
  type EnumDefinition,
  isStructDefinition,
  isIdentifier,
  type StructDefinition,
  isBaseType,
  type FieldType,
  type FunctionType,
  isEnumDefinition,
  isListType,
  isStringLiteral,
  type TypedefDefinition,
  type ConstDefinition,
  type ConstValue,
  isSetType,
  isMapType,
  isBooleanLiteral,
  isIntConstant,
  isDoubleConstant,
  isConstList,
  isConstMap,
  type BaseType,
  isConstDefinition,
  type ProcessIdlCtx,
  isTypedefDefinition,
  isServiceDefinition,
  type IParseResultItem,
  type ServiceDefinition,
  type IGenTemplateCtx,
  addComment,
  getAnnotation,
  parseFiledName,
  parseIdFiledType,
  getTypeFromDynamicJsonAnnotation,
  withExportDeclaration,
  uniformNs,
  removeFileExt,
  genAst,
  getOutputName,
  transformFieldId,
  getRelativePath,
  getFieldsAlias,
  SyntaxType,
  type UnifyStatement,
} from '@coze-arch/idl2ts-helper';
import * as t from '@babel/types';

import { type Options } from '../types';
import { TypeMapper } from '../type-mapper';
import { genFunc, genPublic } from '../template';
import { type Contexts, HOOK } from '../context';

const hasEnumAnnotation = (statement: UnifyStatement) =>
  statement.annotations?.annotations.some(
    i => i.name.value === 'ts.enum' && i.value?.value === 'true',
  );

const findEnumItemIndex = (enumName: string, statements: UnifyStatement[]) => {
  const result: number[] = [];
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (
      statement.type === SyntaxType.ConstDefinition &&
      statement.fieldType.type === SyntaxType.Identifier &&
      statement.fieldType.value === enumName
    ) {
      result.push(i);
    }
  }
  return result;
};

export class ClientPlugin implements IPlugin {
  private options: Options;
  private program!: Program<Contexts>;
  private needPatchTypeFile = new Set<string>();
  constructor(options: Options) {
    this.options = options;
  }
  apply(program: Program<Contexts>): void {
    this.program = program;
    program.register(
      on(HOOK.PROCESS_IDL_NODE),
      ctx => {
        const { node, dts, ast } = ctx;
        if (!node) {
          throw new Error('node is undefined');
        }
        if (isStructDefinition(node)) {
          const { nested, struct } = this.processStructNode(node, ctx);
          dts.program.body.push(struct);
          if (nested) {
            dts.program.body.push(nested);
          }
        } else if (isEnumDefinition(node)) {
          dts.program.body.push(this.processEnumNode(node));
        } else if (isTypedefDefinition(node) && hasEnumAnnotation(node)) {
          dts.program.body.push(this.processTypedefEnumNode(node, ctx));
        } else if (isConstDefinition(node)) {
          dts.program.body.push(this.processConstNode(node));
        } else if (isTypedefDefinition(node)) {
          dts.program.body.push(this.processTypeDefNode(node));
        } else if (isServiceDefinition(node)) {
          dts.program.body = [
            ...dts.program.body,
            ...this.processServiceDefinition(node, ast, ctx),
          ];
        }
        return ctx;
      },
      0,
    );
    program.register(after(HOOK.PROCESS_IDL_AST), ctx => {
      const { ast, dts } = ctx;
      if (ast.isEntry) {
        dts.program.body = [genPublic(ctx, this.options), ...dts.program.body];
      }
      if (ast.includes) {
        Object.keys(ast.includeMap).forEach(key => {
          dts.program.body = [
            ...this.processIncludes(key, ast),
            ...dts.program.body,
          ];
        });
      }
      const outputFile = getOutputName({
        source: `${removeFileExt(ast.idlPath)}.ts`,
        outputDir: this.options.outputDir,
        idlRoot: this.options.idlRoot,
      });
      if (this.needPatchTypeFile.has(ast.idlPath)) {
        let pathName = '';
        if (this.options.patchTypesAliasOutput) {
          pathName = path.join(
            this.options.patchTypesAliasOutput,
            path.relative(
              this.options.idlRoot,
              ast.idlPath.replace('.thrift', ''),
            ),
          );
        } else {
          const patchTypeFile = path.join(
            this.options.patchTypesOutput ||
              path.join(this.options.outputDir, '../patch-types'),
            path.relative(this.options.idlRoot, ast.idlPath),
          );
          pathName = getRelativePath(outputFile, patchTypeFile);
        }

        const code = `import type * as  Patch  from '${pathName}'`;
        dts.program.body.unshift(genAst<t.ImportDeclaration>(code));
      }
      ctx.output.set(outputFile, { type: 'babel', content: dts });
      return ctx;
    });
    this.program.register(
      on(HOOK.GEN_FUN_TEMPLATE),
      (ctx: IGenTemplateCtx) => {
        ctx.template = genFunc(ctx);
        return ctx;
      },
      0,
    );
  }
  private processEnumNode(node: EnumDefinition) {
    const { members, name, comments } = node;
    const enumArr = members.map(i => {
      const { name, comments, initializer } = i;

      return addComment(
        t.tsEnumMember(
          t.identifier(name.value),
          initializer ? this.getExpFromConstValue(initializer) : undefined,
        ),
        comments,
      );
    });
    const enumAst = t.tsEnumDeclaration(t.identifier(name.value), enumArr);
    return withExportDeclaration(enumAst, comments);
  }
  private processStructNode(node: StructDefinition, ctx: ProcessIdlCtx) {
    const { fields, name, comments, nested } = node;

    const typeProps: t.ObjectTypeProperty[] = [];
    const processedFiledName = {} as Record<string, string>;

    fields.forEach(i => {
      const fieldName = parseFiledName(i);
      if (processedFiledName[fieldName]) {
        return;
      }
      const { fieldType, requiredness, comments, annotations } = i;
      const isAnyType = getAnnotation(annotations, 'api.value_type') === 'any';
      const dynamicType = getTypeFromDynamicJsonAnnotation(annotations);
      let valueType: t.FlowType = this.processFiledType(fieldType);
      if (isAnyType) {
        valueType = t.anyTypeAnnotation();
      } else if (dynamicType) {
        valueType = t.genericTypeAnnotation(
          t.qualifiedTypeIdentifier(
            t.identifier(i.name.value),
            t.qualifiedTypeIdentifier(
              t.identifier(name.value),
              t.identifier('Patch'),
            ),
          ),
        );
        this.needPatchTypeFile.add(ctx.ast.idlPath);
      }
      const prop = t.objectTypeProperty(transformFieldId(fieldName), valueType);

      if (requiredness === 'optional') {
        prop.optional = true;
        if (this.options.allowNullForOptional) {
          prop.value = t.unionTypeAnnotation([
            prop.value,
            t.nullLiteralTypeAnnotation(),
          ]);
        }
      }
      processedFiledName[fieldName] = getFieldsAlias(i);
      typeProps.push(addComment(prop, comments));
    });

    const ast = t.interfaceDeclaration(
      t.identifier(name.value),
      null,
      [],
      t.objectTypeAnnotation(typeProps),
    );
    return {
      struct: withExportDeclaration(ast, comments),
      nested: this.processNested(nested, node, ctx),
    };
  }
  private processFiledType(fieldType: FieldType | FunctionType) {
    if (isBaseType(fieldType)) {
      return this.getTsTypeFromThriftBaseType(fieldType);
    } else if (isListType(fieldType) || isSetType(fieldType)) {
      const { valueType } = fieldType;
      return t.arrayTypeAnnotation(this.processFiledType(valueType));
    } else if (isMapType(fieldType)) {
      const { valueType } = fieldType;
      const valueFiledType = this.processFiledType(valueType);
      return t.objectTypeAnnotation(
        [],
        [
          t.objectTypeIndexer(
            t.identifier('key'),
            t.unionTypeAnnotation([
              t.stringTypeAnnotation(),
              t.numberTypeAnnotation(),
            ]),
            valueFiledType,
          ),
        ],
      );
    } else if (isIdentifier(fieldType)) {
      const { namespace, refName } = parseIdFiledType(fieldType);

      if (namespace) {
        return t.genericTypeAnnotation(
          t.qualifiedTypeIdentifier(
            t.identifier(refName),
            t.identifier(
              fieldType.namespaceValue?.startsWith('root')
                ? namespace
                : uniformNs(namespace.replace('.', '_')),
            ),
          ),
        );
      }
      return t.genericTypeAnnotation(t.identifier(refName));
    }
    throw new Error(`unknown type:${fieldType.type}`);
  }

  private processNested(
    nested: Record<string, StructDefinition | EnumDefinition> | undefined,
    parent: StructDefinition,
    ctx: ProcessIdlCtx,
  ) {
    if (!nested) {
      return undefined;
    }

    const block = t.tsModuleBlock([]);

    Object.keys(nested).forEach(key => {
      const node = nested[key];
      if (isStructDefinition(node)) {
        const { nested, struct } = this.processStructNode(node, ctx);
        block.body.push(struct);
        if (nested) {
          block.body.push(nested);
        }
      } else if (isEnumDefinition(node)) {
        block.body.push(this.processEnumNode(node));
      }
    });
    const namespaceModule = t.tsModuleDeclaration(
      t.identifier(parent.name.value),
      block,
    );
    return withExportDeclaration(namespaceModule);
  }

  private processConstNode(node: ConstDefinition) {
    const { name, comments, initializer } = node;
    const exp = this.getExpFromConstValue(initializer);
    const declarator = t.variableDeclarator(t.identifier(name.value), exp);
    const ast = t.variableDeclaration('const', [declarator]);
    return withExportDeclaration(ast, comments);
  }

  private getExpFromConstValue(initializer: ConstValue): t.Expression {
    let exp = null as t.Expression | null;
    if (isStringLiteral(initializer)) {
      exp = t.stringLiteral(initializer.value);
    } else if (isBooleanLiteral(initializer)) {
      exp = t.booleanLiteral(initializer.value);
    } else if (isIntConstant(initializer) || isDoubleConstant(initializer)) {
      exp = t.numericLiteral(Number(initializer.value.value));
    } else if (isConstList(initializer)) {
      const { elements } = initializer;
      exp = t.arrayExpression(elements.map(i => this.getExpFromConstValue(i)));
    } else if (isConstMap(initializer)) {
      exp = t.objectExpression(
        initializer.properties.map(i =>
          t.objectProperty(
            this.getExpFromConstValue(i.name),
            this.getExpFromConstValue(i.initializer),
            isIdentifier(i.name),
          ),
        ),
      );
    } else if (isIdentifier(initializer)) {
      exp = t.identifier(initializer.value);
    }
    if (!exp) {
      throw new Error(`Not support const type yet : ${initializer.type}`);
    }
    return exp;
  }

  private processTypeDefNode(node: TypedefDefinition) {
    const { definitionType, name, comments } = node;
    // @ts-expect-error no fix
    if (node.definitionType?.value?.split('.').length > 2) {
      // @ts-expect-error no fix
      node.definitionType.value = node.definitionType.namespaceValue;
    }
    const ast = t.tsTypeAliasDeclaration(
      t.identifier(name.value),
      null,
      this.getTsTypeFromFiledType(definitionType),
    );
    const res = withExportDeclaration(ast, comments);
    return res;
  }

  private processTypedefEnumNode(node: TypedefDefinition, ctx: ProcessIdlCtx) {
    const { name, comments } = node;
    const enumName = name.value;
    const { statements } = ctx.ast;
    const enumItemIndexArray = findEnumItemIndex(enumName, statements);
    const enumArr = enumItemIndexArray
      .map(i => statements[i])
      .map(i => {
        const { name, comments, initializer } = i as ConstDefinition;

        return addComment(
          t.tsEnumMember(
            t.identifier(name.value.replace(new RegExp(`^${enumName}_`), '')),
            initializer ? this.getExpFromConstValue(initializer) : initializer,
          ),
          comments,
        );
      });
    const enumAst = t.tsEnumDeclaration(t.identifier(name.value), enumArr);

    // Delete enumeration items from back to front to avoid the impact of index changes
    enumItemIndexArray
      .sort((a, b) => b - a)
      .forEach(index => {
        statements.splice(index, 1);
      });
    return withExportDeclaration(enumAst, comments);
  }

  private getTsTypeFromFiledType(fieldType: FieldType) {
    if (isBaseType(fieldType)) {
      return this.getTsTypeFromThriftBaseType(fieldType, true);
    } else if (isListType(fieldType) || isSetType(fieldType)) {
      const { valueType } = fieldType;
      return t.tsArrayType(this.getTsTypeFromFiledType(valueType));
    } else if (isMapType(fieldType)) {
      const { keyType, valueType } = fieldType;
      return t.tsTypeReference(
        t.identifier('Record'),
        t.tsTypeParameterInstantiation([
          this.getTsTypeFromFiledType(keyType),
          this.getTsTypeFromFiledType(valueType),
        ]),
      );
    } else if (isIdentifier(fieldType)) {
      return t.tsTypeReference(t.identifier(fieldType.value));
    }
  }

  private getTsTypeFromThriftBaseType(fieldType: BaseType, isTsType = false) {
    const typeStr = TypeMapper.map(fieldType.type as any);
    if (typeStr === 'number') {
      return !isTsType ? t.numberTypeAnnotation() : t.tsNumberKeyword();
    } else if (typeStr === 'string') {
      return !isTsType ? t.stringTypeAnnotation() : t.tsStringKeyword();
    } else if (typeStr === 'object') {
      const id = t.identifier('Blob');
      return !isTsType ? t.genericTypeAnnotation(id) : t.tsTypeReference(id);
    }
    if (typeStr === 'boolean') {
      return !isTsType ? t.booleanTypeAnnotation() : t.tsBooleanKeyword();
    }
    throw new Error(`not support :${typeStr}`);
  }

  private processIncludes(include: string, ast: IParseResultItem) {
    const includePath = getRelativePath(ast.idlPath, ast.includeMap[include]);
    const name = ast.includeRefer[include];
    let code = `import * as ${name} from '${includePath}';\n`;
    code += `export { ${name} };\n`;
    const res = genAst<t.ImportDeclaration[]>(code);
    // const res = template.ast(code, { plugins }) as ;
    if (!Array.isArray(res)) {
      return [res];
    }
    return res;
  }

  private processServiceDefinition(
    node: ServiceDefinition,
    ast: IParseResultItem,
    ctx: ProcessIdlCtx,
  ): t.ExportNamedDeclaration[] {
    const { functions } = node;
    if (!ast.isEntry) {
      return [];
    }

    const result = [] as t.ExportNamedDeclaration[];
    functions.forEach(i => {
      const { comments, extensionConfig } = i;
      if (!extensionConfig?.method) {
        return;
      }
      const metaCtx = {
        ast,
        meta: ctx.meta.find(m => m.name === i.name.value),
        service: node,
        method: i,
        template: '',
      } as IGenTemplateCtx;
      // this.program.trigger(HOOK.PARSE_FUN_META, ctx);
      this.program.trigger(HOOK.GEN_FUN_TEMPLATE, metaCtx);
      result.push(withExportDeclaration(genAst(metaCtx.template), comments));
    });

    return result;
  }
}
