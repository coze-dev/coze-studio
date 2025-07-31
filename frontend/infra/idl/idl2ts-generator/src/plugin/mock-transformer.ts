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

import { faker } from '@faker-js/faker';
import {
  type IPlugin,
  type Program,
  on,
  after,
} from '@coze-arch/idl2ts-plugin';
import {
  type IParseResultItem,
  type EnumDefinition,
  isServiceDefinition,
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
  isIntConstant,
  isConstDefinition,
  type ProcessIdlCtx,
  isTypedefDefinition,
  type UnifyStatement,
  SyntaxType,
  type ServiceDefinition,
  getStatementById,
  parseIdFiledType,
  uniformNs,
  hasDynamicJsonAnnotation,
  getValuesFromEnum,
  isFullBody,
  removeFileExt,
  parseId,
  getOutputName,
  getFieldsAlias,
  getBaseTypeConverts,
  getRelativePath,
} from '@coze-arch/idl2ts-helper';
import * as t from '@babel/types';
import template from '@babel/template';

import { type Options } from '../types';
import { genMockPublic } from '../template';
import { type Contexts, type GenMockFieldCtx, HOOK } from '../context';

interface ProcessIdlCtxWithMock extends ProcessIdlCtx {
  mockStatements: t.Statement[];
}

export class MockTransformerPlugin implements IPlugin {
  private options: Options;
  private program!: Program<Contexts>;
  constructor(options: Options) {
    this.options = options;
  }
  apply(program: Program<Contexts>): void {
    this.program = program;
    program.register(
      on(HOOK.PROCESS_IDL_NODE),
      ctx => {
        const { node } = ctx;
        ctx.mockStatements = ctx.mockStatements || [];

        if (!node) {
          throw new Error('node is undefined');
        }
        const statement = this.processIdlNode(node, ctx);
        if (statement) {
          ctx.mockStatements.push(statement);
        }
        return ctx;
      },
      0,
    );

    program.register(on(HOOK.GEN_MOCK_FILED), ctx => this.genMockField(ctx));

    program.register(after(HOOK.PROCESS_IDL_AST), ctx => {
      const { ast, mock, mockStatements } = ctx;
      const exportId = [] as string[];
      const mockVarOrder = this.getMockVarOrder(mock);
      const nextOrder = {} as Record<string, number>;
      mockStatements.forEach((i, index) => {
        if (t.isVariableDeclaration(i)) {
          const { name } = i.declarations[0].id as t.Identifier;
          exportId.push(name);
          nextOrder[name] = index;
        }
      });
      // Prioritize in order in the mock file
      const getOrder = (name: string) =>
        typeof mockVarOrder[name] !== 'undefined'
          ? mockVarOrder[name]
          : nextOrder[name];
      const body = mockStatements.sort((a, b) => {
        if (t.isVariableDeclaration(a) && t.isVariableDeclaration(b)) {
          const { name: nameA } = a.declarations[0].id as t.Identifier;
          const { name: nameB } = b.declarations[0].id as t.Identifier;
          const result = getOrder(nameA) - getOrder(nameB);
          return result;
        }
        return 0;
      });
      if (ast.includes) {
        Object.keys(ast.includeMap).forEach(i => {
          body.unshift(this.processIncludes(i, ast));
        });
      }
      const temp = template.ast(
        `module.exports = {${exportId.join(',')}}`,
      ) as t.Statement;
      body.push(temp);

      mock.program.body = [genMockPublic(ctx, this.options), ...body];
      ctx.output.set(
        getOutputName({
          source: `${removeFileExt(ast.idlPath)}.mock.js`,
          outputDir: this.options.outputDir,
          idlRoot: this.options.idlRoot,
        }),
        { type: 'babel', content: mock },
      );
      return ctx;
    });
  }

  private getMockVarOrder(file: t.File) {
    const orders = {} as Record<string, number>;
    file.program.body.map((i, index) => {
      if (t.isVariableDeclaration(i)) {
        const identifier = i.declarations[0].id as t.Identifier;
        orders[identifier.name] = index;
      }
    });
    return orders;
  }
  private processIdlNode(
    statement: UnifyStatement,
    ctx: ProcessIdlCtxWithMock,
  ) {
    if (isStructDefinition(statement)) {
      return this.processStructNode(statement, ctx);
    } else if (isTypedefDefinition(statement)) {
      return this.processTypeDefNode(statement, ctx);
    } else if (isEnumDefinition(statement)) {
      return this.processEnumDefNode(statement, ctx);
    } else if (isConstDefinition(statement)) {
      return this.processConstDefNode(statement, ctx);
    } else if (isServiceDefinition(statement)) {
      return this.processServiceDefinition(statement, ctx);
    }
    throw new Error(`can not process Node from statement type: ${statement}`);
  }

  private processIncludes(include: string, ast: IParseResultItem) {
    const includePath = getRelativePath(ast.idlPath, ast.includeMap[include]);
    const name = ast.includeRefer[include];
    const temp = template.ast(
      `const ${name} = require('${`${includePath}.mock.js`}')`,
    ) as t.ImportDeclaration;
    return temp;
  }
  private processServiceDefinition(
    srtuct: ServiceDefinition,
    ctx: ProcessIdlCtxWithMock,
  ) {
    const { name, functions } = srtuct;
    if (this.findTarget(name.value, ctx)) {
      return;
    }
    const variableDeclaration = template.ast(
      `var ${name.value} = {${functions.map(f => {
        const { name, returnType, fields } = f;
        const reqType = fields[0].fieldType as any;
        const resType = this.processReqResPramsType(returnType, ctx.ast);
        return `${name.value}:{req:${parseId(reqType.value)},res:${parseId(
          resType,
        )}}`;
      })}}`,
    ) as t.ExpressionStatement;
    return variableDeclaration;
  }
  private processReqResPramsType(
    fieldType: FunctionType,
    ast: IParseResultItem,
  ) {
    if (isIdentifier(fieldType)) {
      const statement = getStatementById(fieldType, ast);
      if (isStructDefinition(statement)) {
        const wholeBody = statement.fields.find(isFullBody);
        if (wholeBody) {
          // Processing api.body = "."
          const { annotations } = wholeBody;
          if (hasDynamicJsonAnnotation(annotations)) {
            return '{}';
          }
          return `${fieldType.value}['${getFieldsAlias(wholeBody)}']`;
        } else {
          return fieldType.value;
        }
      }
      throw new Error('params must be identifier');
    } else {
      return 'void';
    }
  }
  private processStructNode(
    struct: StructDefinition,
    ctx: ProcessIdlCtxWithMock,
  ) {
    const { name, fields } = struct;
    if (this.findTarget(name.value, ctx)) {
      return;
    }
    const oldOne = this.getVariableDeclarationById(name.value, ctx);
    const variableDeclaration =
      oldOne ||
      (template.ast(
        `var ${name.value} = createStruct(()=>{ return {} })`,
      ) as t.VariableDeclaration);
    const init = (variableDeclaration.declarations[0].init as t.CallExpression)
      .arguments[0] as t.ArrowFunctionExpression;
    const returnObj = (
      (init.body as t.BlockStatement).body.find(i =>
        t.isReturnStatement(i),
      ) as t.ReturnStatement
    ).argument as t.ObjectExpression;
    if (!returnObj) {
      throw new Error('struct mock must return obj');
    }
    const fieldNames = new Set(fields.map(i => getFieldsAlias(i)));
    const newPros = [] as t.ObjectProperty[];
    const includeFieldName = (pro: t.ObjectProperty) =>
      (t.isStringLiteral(pro.key) && fieldNames.has(pro.key.value)) ||
      (t.isIdentifier(pro.key) && fieldNames.has(pro.key.name));
    returnObj.properties.forEach(i => {
      if (t.isObjectProperty(i)) {
        if (includeFieldName(i)) {
          const key = t.isStringLiteral(i.key)
            ? i.key.value
            : t.isIdentifier(i.key)
            ? i.key.name
            : '';
          fieldNames.delete(key);
        }
        newPros.push(i);
      }
    });
    fields.forEach(f => {
      const { fieldType, defaultValue } = f;
      const fieldName = getFieldsAlias(f);
      if (!fieldNames.has(fieldName)) {
        return;
      }
      // No, it needs to be regenerated.
      newPros.push(
        t.objectProperty(
          fieldName.includes('-')
            ? t.stringLiteral(fieldName)
            : t.identifier(fieldName),
          this.processValue(fieldType, defaultValue || undefined, {
            fieldDefinition: f,
            struct,
            ast: ctx.ast,
          }),
        ),
      );
    });
    returnObj.properties = newPros;
    // this.processNodes.set(name.value, variableDeclaration);
    return variableDeclaration;
  }
  private processValue(
    fieldType: FieldType | FunctionType,
    defaultValue?: ConstValue,
    context?: GenMockFieldCtx['context'],
  ) {
    const ctx = this.program.trigger(HOOK.GEN_MOCK_FILED, {
      fieldType,
      defaultValue,
      context,
    } as GenMockFieldCtx);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return ctx.output!;
  }
  // eslint-disable-next-line complexity
  private genMockField(ctx: GenMockFieldCtx) {
    let { output } = ctx;
    const { defaultValue, fieldType } = ctx;
    if (output) {
      return ctx;
    }
    if (isBaseType(fieldType)) {
      const type = getBaseTypeConverts('number')[fieldType.type];

      if (type === 'string') {
        let value = faker.word.words();
        if (defaultValue && defaultValue.type === SyntaxType.StringLiteral) {
          value = defaultValue.value;
        }
        output = t.stringLiteral(value);
      } else if (type === 'number') {
        let value = faker.number.int();
        if (defaultValue && defaultValue.type === SyntaxType.IntConstant) {
          value = Number(defaultValue.value.value);
        }
        output = t.numericLiteral(value);
      } else if (type === 'boolean') {
        let value = faker.datatype.boolean();
        if (defaultValue && defaultValue.type === SyntaxType.BooleanLiteral) {
          value = defaultValue.value;
        }
        output = t.booleanLiteral(value);
      } else if (type === 'object') {
        // binary
        output = t.callExpression(
          t.memberExpression(t.identifier('Buffer'), t.identifier('from')),
          [t.stringLiteral(faker.word.words())],
        );
      }
    } else if (isMapType(fieldType)) {
      const { valueType } = fieldType;
      output = t.objectExpression([
        t.objectProperty(
          t.identifier(faker.word.words()),
          this.processValue(valueType),
        ),
      ]);
    } else if (isListType(fieldType)) {
      const { valueType } = fieldType;
      output = t.arrayExpression([this.processValue(valueType)]);
    } else if (isSetType(fieldType)) {
      // Set to array validation
      const { valueType } = fieldType;
      output = t.arrayExpression([this.processValue(valueType)]);
    } else if (isIdentifier(fieldType)) {
      // reference type
      const { refName, namespace } = parseIdFiledType(fieldType);
      if (!namespace) {
        output = t.callExpression(t.identifier(refName), []);
      } else {
        output = t.callExpression(
          t.memberExpression(
            t.identifier(uniformNs(namespace)),
            t.identifier(refName),
          ),
          [],
        );
      }
    }
    if (output) {
      return { fieldType, defaultValue, output };
    }
    throw new Error(`can not process fieldType : ${fieldType.type}`);
  }
  private processConst(constVal: ConstValue) {
    // Temporarily unified processing to 0
    if (isStringLiteral(constVal)) {
      return t.stringLiteral(constVal.value);
    }
    if (isIntConstant(constVal)) {
      return t.stringLiteral(constVal.value.value);
    }
    return t.numericLiteral(0);
  }

  private processTypeDefNode(
    typeDef: TypedefDefinition,
    ctx: ProcessIdlCtxWithMock,
  ) {
    const { definitionType, name } = typeDef;
    if (this.findTarget(name.value, ctx)) {
      return;
    }
    const builder = template(`var ${name.value}= () => %%value%% `);
    const variableDeclaration = builder({
      value: this.processValue(definitionType),
    }) as t.VariableDeclaration;
    return variableDeclaration;
  }
  private processEnumDefNode(def: EnumDefinition, ctx: ProcessIdlCtxWithMock) {
    const { name, members } = def;
    const values = getValuesFromEnum(def);

    const commentValues = values.map((value, index) => {
      const { name } = members[index];
      return ` ${name.value}: ${value}`;
    });
    const comment = { type: 'CommentLine', value: commentValues } as any;
    const target = this.findTarget(name.value, ctx);
    if (target) {
      // Comments need to be updated
      // target.trailingComments = [comment];
      return;
    }
    // Enumeration types are uniformly processed into constants
    const builder = template(`var ${name.value}= () => %%value%% `);
    const node = builder({
      value: t.numericLiteral(values[0] || 0),
    }) as t.VariableDeclaration;
    const variableDeclaration = t.addComments(node, 'trailing', [comment]);
    return variableDeclaration;
  }
  private processConstDefNode(
    constDef: ConstDefinition,
    ctx: ProcessIdlCtxWithMock,
  ) {
    const { name, initializer } = constDef;
    if (this.findTarget(name.value, ctx)) {
      return;
    }
    const builder = template(`var ${name.value}= () => %%value%% `);
    const node = builder({
      value: this.processConst(initializer),
    }) as t.VariableDeclaration;
    // const variableDeclaration = t.addComment(
    //   ,
    //   'leading',
    //   'Temporarily, the default processing for const is 0, please reassign it yourself if necessary '
    // );
    return node;
  }
  private getVariableDeclarationById(id: string, ctx: ProcessIdlCtxWithMock) {
    return ctx.mock.program.body.find(i => {
      if (t.isVariableDeclaration(i)) {
        const identifier = i.declarations[0].id as t.Identifier;
        if (identifier.name === id) {
          return true;
        }
      }
      return false;
    }) as t.VariableDeclaration | undefined;
  }
  private findTarget(id: string, ctx: ProcessIdlCtxWithMock) {
    return ctx.mockStatements.find(i => this.getIdName(i) === id);
  }
  private getIdName(statement: t.Statement): string {
    if (
      t.isVariableDeclaration(statement) &&
      t.isVariableDeclarator(statement.declarations[0])
    ) {
      if (t.isIdentifier(statement.declarations[0].id)) {
        return statement.declarations[0].id.name;
      }
    }
    return '';
  }
}
